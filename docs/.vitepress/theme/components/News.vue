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
        <div class="news-scroll">
        <ul class="news-list">
          <li
            v-for="(item, index) in (limit ? newsData.slice(0, limit) : newsData)"
            :key="index"
            class="news-item"
          >
            <span class="news-date">{{ item.date }}</span>
            <div class="news-content" v-html="item.content"></div>
          </li>
        </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.news-list {
  list-style: none;
  margin: 0;
  padding-left: 1.2rem;
  border-left: 2px solid #e5e7eb; /* 时间轴线 */
}

.news-item {
  position: relative;
  margin-bottom: 0.8rem;
  padding-left: 1rem;
  transition: transform 0.15s ease;
}

.news-item:hover {
  transform: translateX(3px);
}

/* 小圆点 */
.news-item::before {
  content: "";
  position: absolute;
  left: -7px;
  top: 6px;
  width: 8px;
  height: 8px;
  background: #000000;
  border-radius: 50%;
}

/* 日期样式 */
.news-date {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
  letter-spacing: 0.03em;
}

/* 内容样式 */
.news-content {
  font-size: 0.95rem;
  line-height: 1.5;
}

.news-scroll {
  position: relative;
  max-height: 230px; /* 自行调整 */
  overflow-y: auto;
  padding-right: 6px; /* 防止遮挡文字 */
  scroll-behavior: smooth;
}

.news-scroll::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

.news-scroll {
  scrollbar-width: none; /* Firefox */
}

.news-scroll::before,
.news-scroll::after {
  content: "";
  position: sticky;
  left: 0;
  right: 0;
  height: 48px;
  pointer-events: none;
  z-index: 2;
}

.news-scroll::before {
  top: 0;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 1),
    rgba(255, 255, 255, 0)
  );
}

.news-scroll::after {
  bottom: 0;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 1),
    rgba(255, 255, 255, 0)
  );
}
</style>