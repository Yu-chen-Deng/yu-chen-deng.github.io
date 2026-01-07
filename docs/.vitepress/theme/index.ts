import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import PersonalInfo from './components/PersonalInfo.vue'
import Profile from './components/Profile.vue'
import News from './components/News.vue'          // 新增
import ProjectList from './components/ProjectList.vue' // 新增
import './frame.css'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    app.component('PersonalInfo', PersonalInfo)
    app.component('Profile', Profile)
    app.component('News', News)                 // 新增
    app.component('ProjectList', ProjectList)   // 新增
  }
} satisfies Theme