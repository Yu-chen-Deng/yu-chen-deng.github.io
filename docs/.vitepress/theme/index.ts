import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import PersonalInfo from './components/PersonalInfo.vue'
import Profile from './components/Profile.vue'
import News from './components/News.vue'          // 新增
import ProjectList from './components/ProjectList.vue' // 新增
import ArchiveList from './components/ArchiveList.vue'
import './frame.css'
import './markdown.css'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    app.component('PersonalInfo', PersonalInfo)
    app.component('Profile', Profile)
    app.component('News', News)                 // 新增
    app.component('ProjectList', ProjectList)   // 新增
    app.component('ArchiveList', ArchiveList)
    if (typeof window !== 'undefined') {
      window.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        window.dispatchEvent(
          new CustomEvent('open-context-menu', {
            detail: { x: e.clientX, y: e.clientY }
          })
        )
      })
    }
  }
} satisfies Theme
