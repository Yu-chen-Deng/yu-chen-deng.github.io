import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Yuchen Deng", // 对应 site_brand_name
  description: "About me - Yuchen Deng",

  base: '/',
  // 禁用默认外观样式，完全由我们需要自定义
  appearance: false, 

  cleanUrls: 'with-subfolders',

  head: [
    // 如果需要 favicon，可以放在 public 文件夹下并在这里引用
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  themeConfig: {
    // 对应 menu 配置
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Archive', link: '/archive/' },
      { text: 'Project', link: '/project/' }
    ],

    // 对应 footer 配置
    footer: {
      copyright: "© 2026 Yuchen Deng"
    }
  }
})