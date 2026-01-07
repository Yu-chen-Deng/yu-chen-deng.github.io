---
layout: doc
title: Home
profile:
  image: /profile_cover.png
  title: About me
  title_zh: 关于我
  body: |
    <p>Here is Yuchen Deng (Kieth, 邓宇宸).</p>
    <p>If you are interested in any aspect of me, I would love to chat and collaborate, please email me at - ydeng714 AT gmail DOT com</p>
  body_zh: |
    <p>你好，我是邓宇宸。</p>
    <p>我目前是西南大学的在读学生，正在计算机视觉领域进行初步探索。</p>
    <p>如果您对我的工作或其他相关领域有兴趣，我非常期待有机会与您进一步交流，欢迎随时通过 ydeng714@gmail.com 与我联系。</p>
  links:
    Google Scholar: "#"
    Github: "https://github.com/Yu-chen-Deng"
---

<script setup>
import { useData } from 'vitepress'
const { frontmatter } = useData()
</script>

<PersonalInfo />

<Profile :data="frontmatter.profile" />

<News :limit="3" />

<ProjectList :onlyHome="true" />