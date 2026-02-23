<template>
  <div
    v-if="visible"
    class="context-menu"
    :style="{ left: x + 'px', top: y + 'px' }"
  >
    <div class="context-item" @click="copy">
      Copy Link
    </div>
    <div class="context-item" @click="top">
      Back to Top
    </div>
    <div class="context-item" @click="refresh">
      Refresh
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const visible = ref(false)
const x = ref(0)
const y = ref(0)

function open(e) {
  x.value = e.detail.x
  y.value = e.detail.y
  visible.value = true
}

function close() {
  visible.value = false
}

function copy() {
  navigator.clipboard.writeText(location.href)
  close()
}

function top() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  close()
}

function refresh() {
  location.reload()
}

onMounted(() => {
  window.addEventListener('open-context-menu', open)
  window.addEventListener('click', close)
})

onBeforeUnmount(() => {
  window.removeEventListener('open-context-menu', open)
})
</script>