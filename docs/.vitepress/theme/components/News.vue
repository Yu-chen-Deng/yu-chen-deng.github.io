<script setup>
import newsData from '../../../data/news.json'
defineProps({
  // 可选：限制显示条数
  limit: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <div class="profile news-section">
    <div class="post-content profile-content">
      <div class="profile-title">
        <span>News</span>
      </div>
      <div class="profile-body">
        <p></p>
        <ul class="news-list">
          <li v-for="(item, index) in (limit ? newsData.slice(0, limit) : newsData)" :key="index">
            <strong class="news-date">{{ item.date }}:&nbsp;</strong>
            <span v-html="item.content"></span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 继承 Profile 的布局，但针对 News 做微调 */
.news-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.news-list li {
  margin-top: 2px;
  line-height: 1.25;
}

.news-date {
  font-family: 'Roboto Mono', monospace; /* 对应 Noto Sans Mono */
  font-weight: 600;
}
</style>