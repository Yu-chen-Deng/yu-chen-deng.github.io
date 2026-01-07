<script setup>
import { ref } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const currentLang = ref('en')

const switchLanguage = (lang) => {
  currentLang.value = lang
}
</script>

<template>
  <div class="profile">
    <div class="profile-image" v-if="data.image">
      <img :src="data.image" alt="profile_cover">
    </div>

    <div class="post-content profile-content">
      <div class="profile-title">
        <span v-if="currentLang === 'en'">{{ data.title }}</span>
        <span v-else>{{ data.title_zh }}</span>

        <div class="switch-lang">
          <a href="javascript:;" @click="switchLanguage('en')">[EN]</a>
          |
          <a href="javascript:;" @click="switchLanguage('zh')">[中]</a>
        </div>
      </div>

      <div class="profile-body">
        <div v-if="currentLang === 'en'" v-html="data.body"></div>
        <div v-else v-html="data.body_zh"></div>
      </div>

      <div class="profile-link" v-if="data.links">
        <span><b>Links: </b></span>
        <template v-for="(link, key) in data.links" :key="key">
          <a :href="link" target="_blank">{{ key }}</a>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 还原 profile.styl */
.profile {
  margin-top: 56px; /* $margin-primary */
  padding-bottom: 12px; /* $margin-m-1 */
  display: flex;
  flex-direction: row-reverse; /* 关键：反向排列，让第一个子元素(图片)去右边 */
  border-bottom: 1px solid #e0e0e0; /* silver */
  gap: 3%; /* 控制图片和文字的间距 */
}

/* 内容区域 */
.profile-content {
  width: 100%;
  margin: 0;
  /* margin: 0 $margin-l-0 0 0;  flex gap 替代了 margin */
}

/* 图片区域 */
.profile-image {
  width: 40%;
  flex-shrink: 0; /* 防止图片被压缩 */
}

.profile-image img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 2px; /* 可选：稍微圆角 */
}

/* 标题样式 - 还原 text-style(heading-h1) */
.profile-title {
  font-size: 2rem; /* ~28px */
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 8px; /* $margin-m-0 */
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  flex-direction: column-reverse;
}

/* 语言切换按钮 */
.switch-lang {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--color-text-secondary);
}

.switch-lang a {
  cursor: pointer;
  color: var(--color-text-primary);
  margin: 0 2px;
}
.switch-lang a:hover {
  opacity: 0.6;
}

/* 正文样式 - 还原 text-style(body-default) */
.profile-body {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 32px; /* $margin-l-1 */
}

/* 针对正文内部 p 标签的样式 */
:deep(.profile-body p) {
  margin-top: 8px;
  margin-bottom: 8px;
  text-indent: 0; /* 原版 styling 有 2em 缩进，现代网页通常不缩进，如果需要可改为 2em */
}

/* 链接样式 - 还原 text-style(header) */
.profile-link {
  font-size: 0.875rem; /* ~14px */
  font-weight: 500;
  line-height: 1.5;
  margin-bottom: 12px;
}

.profile-link a {
  margin-right: 8px;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-bottom 0.2s;
}

.profile-link a:hover {
  border-bottom: 1px solid currentColor;
}

/* 移动端适配 - 还原 @media (max-width: 480px) */
@media (max-width: 600px) {
  .profile {
    flex-wrap: wrap;
    flex-direction: row; /* 移动端恢复正常顺序，或者保持 row-reverse 看效果 */
  }

  .profile-image {
    width: 100%;
    margin-bottom: 16px;
  }

  .profile-content {
    width: 100%;
  }
}
</style>