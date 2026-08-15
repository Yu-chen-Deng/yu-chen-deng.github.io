---
title: Controlling RGB Exposure and Gain on Kinect for Xbox 360 Model 1473 with libfreenect
date: 2026-08-15
---

# Controlling RGB Exposure and Gain on Kinect for Xbox 360 Model 1473 with libfreenect

## 1. Overview

Current versions of `libfreenect` provide:

```c
freenect_set_flag(dev, FREENECT_AUTO_EXPOSURE, FREENECT_OFF);
freenect_set_exposure(dev, time_us);
```

However, on at least one real Kinect for Xbox 360 **Model 1473**, this path does **not** actually lock the RGB exposure.

The reason is important:

- Current `libfreenect` controls exposure through **Kinect command `0x95`**, which directly accesses RGB CMOS registers.
- `FREENECT_AUTO_EXPOSURE` modifies CMOS register `0x0106`.
- `freenect_set_exposure()` writes CMOS register `0x0009`.
- This approach was successfully tested by the upstream manual-exposure work on a **Model 1414**, but it does not work correctly on the tested **Model 1473**.

Reverse engineering of Microsoft Kinect SDK 1.8 shows that its camera-control stack uses a **different protocol** for exposure:

```text
Kinect proprietary command: 0x96

0xCC00  Auto/manual exposure mode
0xCC04  Exposure value, high 16 bits
0xCC06  Exposure value, low 16 bits
0xCC0E  Gain
```

On the tested Model 1473, these commands were accepted by the device, read back correctly, and caused the RGB image brightness to change as expected.

---

## 2. What Was Verified

The test device presented its RGB camera as:

```text
VID:PID = 045e:02ae
```

Microsoft Kinect SDK 1.8 normally refuses to expose `INuiColorCameraSettings` for this device:

```text
NuiGetColorCameraSettings -> 0x8301000F
```

`0x8301000F` is `E_NUI_HARDWARE_FEATURE_UNAVAILABLE`.

Reverse engineering showed that this rejection is performed in `Kinect10.dll` before any USB request is sent.

After bypassing the SDK's software-only device-type checks for research purposes, the SDK eventually reached its real camera-control implementation. A USB capture showed that `kinectcamera.sys` translated those operations into Kinect proprietary **`GM` command `0x96`** requests.

The following operations were observed on the real Model 1473.

### Disable automatic exposure

The important state is:

```text
control 0xCC00 = 1
```

Observed meanings:

```text
0xCC00 = 1  -> manual exposure
0xCC00 = 2  -> automatic exposure
```

The device was subsequently read back and returned `1`.

### Set exposure to 5 ms

The requested exposure was:

```text
5000 us
```

The wire representation was:

```text
5000 / 100 = 50 = 0x0032
```

The controls became:

```text
0xCC04 = 0x0000
0xCC06 = 0x0032
```

The device returned `0x0032` when read back.

### Set exposure to 20 ms

The requested exposure was:

```text
20000 us
```

The wire representation was:

```text
20000 / 100 = 200 = 0x00C8
```

The controls became:

```text
0xCC04 = 0x0000
0xCC06 = 0x00C8
```

The device returned `0x00C8` when read back.

The captured RGB data also changed at the same time as the exposure commands. Under unchanged scene conditions, the average captured RGB payload level moved roughly:

```text
before change: ~130

5 ms:
~101

20 ms:
~169
```

This is strong evidence that the real RGB sensor exposure changed, not merely a cached software property.


### Set gain to 1x, 2x, 4x, 8x, and 16x

A second Model-1473 experiment used the same patched Microsoft SDK path to exercise `INuiColorCameraSettings::SetGain()`.

The device accepted the following values through control `0xCC0E`:

```text
SDK Gain   Raw 0xCC0E value
--------   ----------------
1.0        0x0020
2.0        0x0040
4.0        0x0080
8.0        0x0100
16.0       0x0200
```

The mapping is therefore:

```text
raw_gain = gain * 32
```

Each write was followed by a readback from the device, and the returned raw value matched the requested value.

The captured RGB payload brightness also increased monotonically with gain under approximately unchanged scene conditions:

```text
Gain 1x    ~171
Gain 2x    ~192
Gain 4x    ~208
Gain 8x    ~225
Gain 16x   ~241
```

This confirms that `0xCC0E` changes the real RGB sensor gain rather than only changing an SDK-side cached property.

> `Gain` should be treated as a sensor gain multiplier, **not** as a calibrated photographic ISO value. Do not label `Gain = 4` as `ISO 400` unless you have independently calibrated that relationship.

---

## 3. Why the Existing libfreenect Exposure API Fails on 1473

At the time of writing, the relevant upstream `libfreenect` implementation is essentially:

```c
int freenect_set_exposure(freenect_device *dev, int time_us)
{
    uint16_t cmos_value = 0;

    /* conversion omitted */

    return write_cmos_register(dev, 0x0009, cmos_value);
}
```

The automatic-exposure flags are also implemented by reading and modifying:

```text
CMOS register 0x0106
```

The CMOS helper uses:

```text
Kinect command 0x95
```

Conceptually:

```text
libfreenect
    |
    +-- command 0x95
            |
            +-- direct CMOS register access
                    |
                    +-- 0x0106   auto-exposure bits
                    +-- 0x0009   shutter width
```

This path is not reliable on the tested Model 1473.

The Microsoft driver instead uses:

```text
application
    |
    v
Kinect10.dll
    |
    v
DeviceIoControl
    |
    v
kinectcamera.sys
    |
    v
Kinect command 0x96
    |
    +-- 0xCC00
    +-- 0xCC04
    +-- 0xCC06
    +-- 0xCC0E
```

The important conclusion is:

> **For Model 1473, use the `0x96 / 0xCCxx` camera-control path for manual exposure and gain instead of relying on the existing `0x95` CMOS exposure path.**

---

## 4. Understanding libfreenect's `send_cmd()`

`libfreenect` already contains the transport required to send the newly discovered command.

In current `src/flags.c`, `send_cmd()` builds this header:

```c
typedef struct {
    uint8_t  magic[2];
    uint16_t len;
    uint16_t cmd;
    uint16_t tag;
} cam_hdr;
```

The outgoing magic is:

```text
47 4D = "GM"
```

The response magic is:

```text
52 42 = "RB"
```

The transport uses USB vendor control transfers:

```text
Host -> Kinect: bmRequestType = 0x40
Kinect -> Host: bmRequestType = 0xC0
```

Therefore, no new libusb transport layer is required. The easiest implementation is to add Model-1473 camera-control helpers next to `send_cmd()` in `src/flags.c`.

---

## 5. Reverse-Engineered Command 0x96 Format

All 16-bit words are little-endian.

The capture revealed four useful forms.

### 5.1 Set an 8-bit camera control

Used for auto/manual exposure mode:

```c
uint16_t cmd[5] = {
    0x0002,
    0xFF80,
    control,
    0xFF81,
    value
};
```

Send with:

```c
send_cmd(dev, 0x96, cmd, sizeof(cmd), ...);
```

For manual exposure:

```text
control = 0xCC00
value   = 0x0001
```

For automatic exposure:

```text
control = 0xCC00
value   = 0x0002
```

An observed manual-exposure request looked like:

```text
47 4D 05 00 96 00 TT TT
02 00 80 FF 00 CC 81 FF 01 00
```

`TT TT` is the normal `libfreenect` command tag and changes for every request.

### 5.2 Read an 8-bit camera control

Observed request payload:

```c
uint16_t cmd[3] = {
    0x0001,
    0xFF83,
    control
};
```

For example:

```text
control = 0xCC00
```

The returned value was found in the fourth 16-bit response word after `send_cmd()` removes the `RB` header.

### 5.3 Set a 16-bit camera control

Observed request payload:

```c
uint16_t cmd[3] = {
    0x0001,
    control,
    value
};
```

Examples:

```text
control = 0xCC04
value   = high 16 bits

control = 0xCC06
value   = low 16 bits
```

For 5 ms:

```text
01 00 06 CC 32 00
```

For 20 ms:

```text
01 00 06 CC C8 00
```

### 5.4 Read a 16-bit camera control

Observed request payload:

```c
uint16_t cmd[3] = {
    0x0001,
    0xFF82,
    control
};
```

The returned value is again present in the response data.

---

## 6. Recommended libfreenect Implementation

The following implementation is deliberately kept separate from the existing `0x95` functions so that 1414 behavior is not changed.

Add these helpers to `src/flags.c`, where `send_cmd()` and the endian conversion helpers are already available.

```c
#define K1473_CMD_CAMERA_CONTROL       0x0096

#define K1473_CTRL_EXPOSURE_MODE       0xCC00
#define K1473_CTRL_EXPOSURE_HIGH       0xCC04
#define K1473_CTRL_EXPOSURE_LOW        0xCC06
#define K1473_CTRL_GAIN                0xCC0E

#define K1473_EXPOSURE_MANUAL          0x0001
#define K1473_EXPOSURE_AUTO            0x0002


static int k1473_set_u8_control(
    freenect_device *dev,
    uint16_t control,
    uint16_t value)
{
    uint16_t cmd[5];
    uint16_t reply[5] = {0};

    cmd[0] = fn_le16(0x0002);
    cmd[1] = fn_le16(0xFF80);
    cmd[2] = fn_le16(control);
    cmd[3] = fn_le16(0xFF81);
    cmd[4] = fn_le16(value);

    int res = send_cmd(
        dev,
        K1473_CMD_CAMERA_CONTROL,
        cmd,
        sizeof(cmd),
        reply,
        sizeof(reply));

    if (res < 0)
        return res;

    if (res < 2 || fn_le16(reply[0]) != 0x0000)
        return -1;

    return 0;
}


static int k1473_get_u8_control(
    freenect_device *dev,
    uint16_t control,
    uint16_t *value)
{
    uint16_t cmd[3];
    uint16_t reply[4] = {0};

    cmd[0] = fn_le16(0x0001);
    cmd[1] = fn_le16(0xFF83);
    cmd[2] = fn_le16(control);

    int res = send_cmd(
        dev,
        K1473_CMD_CAMERA_CONTROL,
        cmd,
        sizeof(cmd),
        reply,
        sizeof(reply));

    if (res < 0)
        return res;

    if (res < 8 || fn_le16(reply[0]) != 0x0000)
        return -1;

    *value = fn_le16(reply[3]);
    return 0;
}


static int k1473_set_u16_control(
    freenect_device *dev,
    uint16_t control,
    uint16_t value)
{
    uint16_t cmd[3];
    uint16_t reply[4] = {0};

    cmd[0] = fn_le16(0x0001);
    cmd[1] = fn_le16(control);
    cmd[2] = fn_le16(value);

    int res = send_cmd(
        dev,
        K1473_CMD_CAMERA_CONTROL,
        cmd,
        sizeof(cmd),
        reply,
        sizeof(reply));

    if (res < 0)
        return res;

    if (res < 2 || fn_le16(reply[0]) != 0x0000)
        return -1;

    return 0;
}


static int k1473_get_u16_control(
    freenect_device *dev,
    uint16_t control,
    uint16_t *value)
{
    uint16_t cmd[3];
    uint16_t reply[4] = {0};

    cmd[0] = fn_le16(0x0001);
    cmd[1] = fn_le16(0xFF82);
    cmd[2] = fn_le16(control);

    int res = send_cmd(
        dev,
        K1473_CMD_CAMERA_CONTROL,
        cmd,
        sizeof(cmd),
        reply,
        sizeof(reply));

    if (res < 0)
        return res;

    if (res < 8 || fn_le16(reply[0]) != 0x0000)
        return -1;

    *value = fn_le16(reply[3]);
    return 0;
}
```

---

## 7. Public Functions

Now add a small public API.

### 7.1 Auto exposure

```c
int freenect_1473_set_auto_exposure(
    freenect_device *dev,
    int enabled)
{
    const uint16_t value =
        enabled ? K1473_EXPOSURE_AUTO
                : K1473_EXPOSURE_MANUAL;

    int ret = k1473_set_u8_control(
        dev,
        K1473_CTRL_EXPOSURE_MODE,
        value);

    if (ret < 0)
        return ret;

    /* Verify that the hardware accepted it. */
    uint16_t readback = 0;

    ret = k1473_get_u8_control(
        dev,
        K1473_CTRL_EXPOSURE_MODE,
        &readback);

    if (ret < 0)
        return ret;

    if (readback != value)
        return -1;

    return 0;
}
```

### 7.2 Fixed exposure time

The protocol stores exposure in units of **100 microseconds**:

```text
wire value = exposure_us / 100
```

The value is 32-bit and split between `0xCC04` and `0xCC06`.

```c
int freenect_1473_set_exposure(
    freenect_device *dev,
    uint32_t exposure_us)
{
    /*
     * 100 us per protocol unit.
     *
     * Examples:
     *   5000 us  ->  50 -> 0x00000032
     *  20000 us  -> 200 -> 0x000000C8
     */
    uint32_t value = exposure_us / 100;

    uint16_t high = (uint16_t)(value >> 16);
    uint16_t low  = (uint16_t)(value & 0xFFFF);

    /*
     * The successful Microsoft-driver capture writes
     * the high and low halves independently.
     */
    int ret = k1473_set_u16_control(
        dev,
        K1473_CTRL_EXPOSURE_HIGH,
        high);

    if (ret < 0)
        return ret;

    ret = k1473_set_u16_control(
        dev,
        K1473_CTRL_EXPOSURE_LOW,
        low);

    if (ret < 0)
        return ret;

    /*
     * Verify both values by reading them back from the device.
     */
    uint16_t high_readback = 0;
    uint16_t low_readback = 0;

    ret = k1473_get_u16_control(
        dev,
        K1473_CTRL_EXPOSURE_HIGH,
        &high_readback);

    if (ret < 0)
        return ret;

    ret = k1473_get_u16_control(
        dev,
        K1473_CTRL_EXPOSURE_LOW,
        &low_readback);

    if (ret < 0)
        return ret;

    if (high_readback != high || low_readback != low)
        return -1;

    return 0;
}
```

### 7.3 Set gain

The Microsoft driver uses:

```text
0xCC0E = gain * 32
```

The tested SDK range was:

```text
1.0 <= gain <= 16.0
```

A convenient implementation is:

```c
int freenect_1473_set_gain(
    freenect_device *dev,
    float gain)
{
    if (gain < 1.0f || gain > 16.0f)
        return -1;

    /*
     * Verified mapping on Model 1473:
     *
     *   1x  -> 0x0020
     *   2x  -> 0x0040
     *   4x  -> 0x0080
     *   8x  -> 0x0100
     *   16x -> 0x0200
     */
    uint16_t raw =
        (uint16_t)(gain * 32.0f + 0.5f);

    int ret = k1473_set_u16_control(
        dev,
        K1473_CTRL_GAIN,
        raw);

    if (ret < 0)
        return ret;

    uint16_t readback = 0;

    ret = k1473_get_u16_control(
        dev,
        K1473_CTRL_GAIN,
        &readback);

    if (ret < 0)
        return ret;

    if (readback != raw)
        return -1;

    return 0;
}
```

A matching getter can expose the actual hardware value:

```c
int freenect_1473_get_gain(
    freenect_device *dev,
    float *gain)
{
    if (!gain)
        return -1;

    uint16_t raw = 0;

    int ret = k1473_get_u16_control(
        dev,
        K1473_CTRL_GAIN,
        &raw);

    if (ret < 0)
        return ret;

    *gain = (float)raw / 32.0f;
    return 0;
}
```

For deterministic manual camera control, set manual exposure mode first:

```c
freenect_1473_set_auto_exposure(dev, 0);
freenect_1473_set_gain(dev, 4.0f);
```

The Microsoft implementation only applies gain while the camera is in manual exposure mode.

### 7.4 Read the current exposure

```c
int freenect_1473_get_exposure(
    freenect_device *dev,
    uint32_t *exposure_us)
{
    if (!exposure_us)
        return -1;

    uint16_t high = 0;
    uint16_t low = 0;

    int ret = k1473_get_u16_control(
        dev,
        K1473_CTRL_EXPOSURE_HIGH,
        &high);

    if (ret < 0)
        return ret;

    ret = k1473_get_u16_control(
        dev,
        K1473_CTRL_EXPOSURE_LOW,
        &low);

    if (ret < 0)
        return ret;

    uint32_t value =
        ((uint32_t)high << 16) |
        (uint32_t)low;

    *exposure_us = value * 100;

    return 0;
}
```

Add declarations to the appropriate public header, for example:

```c
FREENECTAPI int freenect_1473_set_auto_exposure(
    freenect_device *dev,
    int enabled);

FREENECTAPI int freenect_1473_set_exposure(
    freenect_device *dev,
    uint32_t exposure_us);

FREENECTAPI int freenect_1473_get_exposure(
    freenect_device *dev,
    uint32_t *exposure_us);

FREENECTAPI int freenect_1473_set_gain(
    freenect_device *dev,
    float gain);

FREENECTAPI int freenect_1473_get_gain(
    freenect_device *dev,
    float *gain);
```

You may prefer less model-specific names if this protocol is later verified on additional Kinect revisions.

---

## 8. Minimal Usage Example

After opening the Kinect and configuring the RGB video mode:

```c
freenect_set_video_mode(
    dev,
    freenect_find_video_mode(
        FREENECT_RESOLUTION_MEDIUM,
        FREENECT_VIDEO_RGB));
```

disable automatic exposure:

```c
if (freenect_1473_set_auto_exposure(dev, 0) < 0) {
    fprintf(stderr, "Failed to disable auto exposure\n");
    return -1;
}
```

then request a fixed 5 ms exposure:

```c
if (freenect_1473_set_exposure(dev, 5000) < 0) {
    fprintf(stderr, "Failed to set exposure\n");
    return -1;
}
```

optionally set a fixed gain, for example 4x:

```c
if (freenect_1473_set_gain(dev, 4.0f) < 0) {
    fprintf(stderr, "Failed to set gain\n");
    return -1;
}
```

and start RGB streaming:

```c
if (freenect_start_video(dev) < 0) {
    fprintf(stderr, "Failed to start RGB stream\n");
    return -1;
}
```

The commands were also observed working while RGB streaming was already active. For a first implementation, setting exposure immediately before starting the stream is simpler and easier to debug.

---

## 9. Example: 20 ms Exposure

```c
freenect_1473_set_auto_exposure(dev, 0);
freenect_1473_set_exposure(dev, 20000);
```

Expected wire representation:

```text
20000 us / 100 = 200
200 decimal = 0x000000C8

0xCC04 = 0x0000
0xCC06 = 0x00C8
```

---

## 10. Example: Fixed Exposure + Fixed Gain

For a fully manual RGB configuration:

```c
freenect_1473_set_auto_exposure(dev, 0);
freenect_1473_set_exposure(dev, 5000);
freenect_1473_set_gain(dev, 4.0f);
```

Expected controls:

```text
Manual exposure:
0xCC00 = 0x0001

Exposure 5 ms:
0xCC04 = 0x0000
0xCC06 = 0x0032

Gain 4x:
0xCC0E = 0x0080
```

Verified gain mapping:

```text
1x   -> 0x0020
2x   -> 0x0040
4x   -> 0x0080
8x   -> 0x0100
16x  -> 0x0200
```

## 11. Do Not Use the Existing `freenect_set_exposure()` for This Path

Do not mix the two mechanisms during testing.

Avoid:

```c
freenect_set_flag(
    dev,
    FREENECT_AUTO_EXPOSURE,
    FREENECT_OFF);

freenect_set_exposure(dev, 5000);
```

for the Model-1473-specific path described here.

Those calls currently use:

```text
0x95
  -> CMOS register 0x0106
  -> CMOS register 0x0009
```

Instead use only:

```text
0x96
  -> 0xCC00
  -> 0xCC04
  -> 0xCC06
```

This avoids having two independent camera-control mechanisms modifying the device.

---

## 12. How to Verify That Exposure and Gain Are Really Applied

A setter returning success is not enough.

Use all three checks below.

### Check 1: Read the control back

After disabling AE:

```c
uint16_t mode;
k1473_get_u8_control(
    dev,
    K1473_CTRL_EXPOSURE_MODE,
    &mode);
```

Expected:

```text
mode = 1
```

After setting 5 ms:

```text
0xCC04 = 0
0xCC06 = 50
```

After setting 20 ms:

```text
0xCC04 = 0
0xCC06 = 200
```

### Check 2: Change the requested exposure

Use a static scene and fixed lighting.

Compare:

```text
5 ms
20 ms
```

The 20 ms image should be significantly brighter unless it is already saturated.

### Check 3: Verify gain independently

Keep exposure fixed, then compare several gain values:

```text
Gain 1x
Gain 2x
Gain 4x
Gain 8x
Gain 16x
```

The image should become brighter as gain increases. Noise should also generally increase at higher gain.

Read `0xCC0E` back after every write. The expected raw values are:

```text
1x   -> 0x0020
2x   -> 0x0040
4x   -> 0x0080
8x   -> 0x0100
16x  -> 0x0200
```

### Check 4: Challenge the auto-exposure loop

With the exposure fixed:

1. Point the camera at a stable scene.
2. Cover part of the lens or switch a lamp on/off.
3. Observe the image for several seconds.
4. Confirm that the camera does not gradually compensate back toward its previous brightness.

This distinguishes a true manual exposure from a temporary brightness change while automatic exposure remains active.

---

## 13. Wireshark / USBPcap Validation

When analyzing a Model 1473 capture, first identify the Kinect camera's USB device address.

The tested device used:

```text
VID:PID 045e:02ae
```

Then filter the camera in Wireshark, for example:

```text
usb.device_address == 20
```

Replace `20` with the address from your own capture.

To find Kinect proprietary commands, inspect control transfers whose payload starts with:

```text
47 4D
```

which is ASCII:

```text
GM
```

The exposure protocol uses:

```text
command = 0x0096
```

Useful values to search for in packet bytes include:

```text
00 CC       # 0xCC00
04 CC       # 0xCC04
06 CC       # 0xCC06
0E CC       # 0xCC0E (gain)

32 00       # exposure 50  -> 5 ms
C8 00       # exposure 200 -> 20 ms

20 00       # gain 1x
40 00       # gain 2x
80 00       # gain 4x
00 01       # gain 8x
00 02       # gain 16x
```

Example request for 5 ms low word:

```text
47 4D 03 00 96 00 TT TT
01 00 06 CC 32 00
```

Example request for 20 ms low word:

```text
47 4D 03 00 96 00 TT TT
01 00 06 CC C8 00
```

---

## 14. Integrating This into a ROS / ROS 2 Driver

For a ROS 2 wrapper around `libfreenect`, expose parameters such as:

```yaml
auto_exposure: false
exposure_us: 5000
gain: 4.0
```

During camera initialization:

```cpp
if (!auto_exposure) {
    freenect_1473_set_auto_exposure(fn_dev_, 0);
    freenect_1473_set_exposure(fn_dev_, exposure_us);
    freenect_1473_set_gain(fn_dev_, gain);
}
```

A better production implementation should:

- check every return code;
- read the controls back;
- report the actual exposure and gain readback values in logs;
- reject obviously invalid exposure or gain values;
- optionally allow runtime parameter updates;
- serialize camera-control commands if another thread is calling `freenect_process_events()`.

Example:

```cpp
int ret = freenect_1473_set_auto_exposure(fn_dev_, 0);

if (ret < 0) {
    RCLCPP_ERROR(
        get_logger(),
        "Failed to switch Kinect 1473 to manual exposure");
}

ret = freenect_1473_set_exposure(
    fn_dev_,
    exposure_us_);

if (ret < 0) {
    RCLCPP_ERROR(
        get_logger(),
        "Failed to set Kinect 1473 exposure to %u us",
        exposure_us_);
} else {
    RCLCPP_INFO(
        get_logger(),
        "Kinect 1473 exposure set to %u us",
        exposure_us_);
}
```

---

## 15. Exposure and Gain Ranges

Only values actually tested on the Model 1473 should be treated as confirmed.

Confirmed exposure values in this experiment:

```text
5000 us   = 5 ms
20000 us  = 20 ms
```

Confirmed gain values:

```text
1x
2x
4x
8x
16x
```

The Microsoft SDK public gain range is `1.0` to `16.0`, and the verified Model-1473 wire mapping is:

```text
raw_gain = gain * 32
```

At 30 FPS the frame interval is approximately:

```text
33.33 ms
```

For initial testing, keeping exposure below one frame interval is sensible:

```text
100 us <= exposure <= ~33000 us
```

This is a conservative engineering recommendation, **not a fully characterized hardware limit**.

The Microsoft SDK internally represented exposure in units of `1/10000 s`, which is the same 100-us granularity observed on the wire.

---

## 16. Summary

The key discovery is:

```text
Stock libfreenect exposure path
--------------------------------
command 0x95
CMOS 0x0106 / 0x0009
Model 1473: does not reliably control exposure


Verified Model-1473 path
------------------------
command 0x96

0xCC00 = 1      manual exposure
0xCC00 = 2      automatic exposure

0xCC04          exposure high 16 bits
0xCC06          exposure low 16 bits
0xCC0E          gain

wire exposure unit = 100 us
raw gain = gain * 32
```

Therefore:

```text
5 ms:
value  = 5000 / 100
       = 50
       = 0x00000032

0xCC04 = 0x0000
0xCC06 = 0x0032


20 ms:
value  = 20000 / 100
       = 200
       = 0x000000C8

0xCC04 = 0x0000
0xCC06 = 0x00C8


Gain 4x:
raw_gain = 4 * 32
         = 128
         = 0x0080

0xCC0E = 0x0080
```

For Kinect for Xbox 360 **Model 1473**, this `0x96 / 0xCCxx` mechanism is the experimentally verified route to **fixed RGB exposure and fixed gain**.

---

## 17. References

The implementation and investigation were cross-checked against:

- OpenKinect `libfreenect`, especially `src/flags.c`, `src/cameras.c`, and `src/usb_libusb10.c`.
- OpenKinect issue history for Model 1473 support and auto-exposure behavior.
- The upstream manual-exposure implementation based on command `0x95`, which was originally tested on Model 1414.
- Microsoft Kinect SDK 1.8 binaries and headers.
- USBPcap captures from a real Model 1473.

Because the `0x96` exposure path documented here was recovered through reverse engineering and direct hardware experiments, readers should independently validate it on their own hardware before relying on it in production.
