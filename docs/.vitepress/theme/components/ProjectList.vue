<script setup>
import { withBase } from 'vitepress'
import projectData from '../../../data/projects.json'
import { computed } from 'vue'

const props = defineProps({
  onlyHome: {
    type: Boolean,
    default: false
  }
})

const displayItems = computed(() => {
  if (props.onlyHome) {
    return projectData.filter(item => item.home === true)
  }
  return projectData
})
</script>

<template>
  <div class="profile project-section">
    <div class="post-content profile-content">
      <div class="profile-title">
        <span>Project&nbsp;</span><span style="font-size:0.8rem;font-weight:500;"><sup>&ast;</sup>Equal contribution, <sup>&dagger;</sup>Corresponding author</span>
      </div>
      
      <div class="post-project-list">
        <div v-for="(item, index) in displayItems" :key="index" class="project-wrapper">
          
          <div class="post-project-item">
            <div class="post-img" v-if="item.cover">
              <img :src="withBase(item.cover)" :alt="item.title">
            </div>

            <div class="post-info">
              <div class="post-title">
                <a :href="item.link ? withBase(item.link) : '#'" target="_blank">{{ item.title }}</a>
              </div>
              
              <span class="post-author" v-if="item.author" v-html="item.author"></span>
              <span class="post-publication" v-if="item.publication" v-html="item.publication"></span>
              
              <div class="tag-list" v-if="item.links">
                <span v-for="(linkUrl, linkName) in item.links" :key="linkName" class="post-tag">
                  <a :href="linkUrl" target="_blank">{{ linkName }}</a>
                </span>
              </div>
            </div>
          </div>
          <div>
            <span class="post-summary" v-if="item.summary" v-html="item.summary"></span>
          </div>
          </div>
      </div>
    </div>
  </div>
</template>