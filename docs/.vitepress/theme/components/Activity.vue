<script setup>
import { data as activitiesHtml } from '../../../activities.data'
</script>

<template>
  <div class="profile activity-section">
    <div class="post-content profile-content">
      <div class="profile-title">
        <span>Activity</span>
      </div>
      <div v-if="activitiesHtml" class="profile-body activity-content" v-html="activitiesHtml"></div>
    </div>
  </div>
</template>

<style scoped>
.activity-content {
  margin-top: 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.activity-content :deep(p) {
  margin: 0.5rem 0;
}

.activity-content :deep(ul),
.activity-content :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.2rem;
}

.activity-content :deep(li) {
  margin-bottom: 0.5rem;
}

.activity-content :deep(h1),
.activity-content :deep(h2),
.activity-content :deep(h3),
.activity-content :deep(h4),
.activity-content :deep(h5),
.activity-content :deep(h6) {
  margin: 1rem 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.5;
}

.activity-content :deep(a:hover) {
  text-decoration: underline;
}

.activity-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.activity-content :deep(> :first-child) {
  margin-top: 0;
}

.activity-content :deep(> :last-child) {
  margin-bottom: 0;
}
.activity-content :deep(.activity-transparent) {
  opacity: 0;
}
</style>
