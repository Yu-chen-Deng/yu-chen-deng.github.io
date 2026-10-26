import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Yuchen Deng", // 对应 site_brand_name
  description: "About me - Yuchen Deng",

  base: '/',
  // 禁用默认外观样式，完全由我们需要自定义
  appearance: false, 

  cleanUrls: true,

  head: [
    // 如果需要 favicon，可以放在 public 文件夹下并在这里引用
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    // GA4 使用增强型衡量中的浏览器历史事件统计站内页面切换。
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-N1FHRENB96' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-N1FHRENB96');`
    ]
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
