<script setup>
</script>

<template>
  <div class="personal-info">
    <div class="personal-info-image">
      <img src="/yuchen.jpg" alt="featured_image" class="personal-info-img">
    </div>
    <div class="personal-info-link">
      <ul class="personal-info-link-list">
        <li class="link-item mail">
          <a href="mailto:ydeng714@gmail.com" target="_blank">Email</a>
        </li>
        <li class="link-item github">
          <a href="https://github.com/Yu-chen-Deng" target="_blank">Github</a>
        </li>
        <li class="link-item scholar">
          <a href="https://github.com/Yu-chen-Deng" target="_blank">Scholar</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* scoped样式主要用于微调，核心布局逻辑已经移交给了 frame.css 
  图标需要在这里定义，或者在全局 CSS 中定义
*/
.link-item.mail { background-image: url('/icon_mail.png'); }
.link-item.github { background-image: url('/icon_github.png'); }
.link-item.scholar { background-image: url('/icon_scholar.png'); }
</style>