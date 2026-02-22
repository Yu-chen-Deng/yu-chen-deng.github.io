---
layout: doc
title: Home
profile:
  image: /profile_cover.png
  title: About me
  title_zh: 关于我
  body: |
    <p>Here is Yuchen Deng (Kieth, 邓宇宸). I am a junior at the School of Computer and Information Science at Southwest University.</p> 
    <p>My research interests include Generative Model, 3D Reconstruction, and Spatial Augmented Reality. Also, Lateral Thinking with Withered Technology inspires my research exploration.</p>
    <p>If you are interested in any aspect of me, I would love to chat and collaborate, please email me at - ydeng714 AT gmail DOT com</p>
  body_zh: |
    <p>你好，我是邓宇宸，目前是西南大学的在读学生。我的研究兴趣包括生成模型、三维重建和空间增强现实。此外，枯萎技术的平行思考也激发了我的研究探索。</p>
    <p>如果您对我的工作或其他相关领域有兴趣，我非常期待有机会与您进一步交流，欢迎随时通过 ydeng714@gmail.com 与我联系。</p>
  links:
    Email: "mailto:ydeng714@gmail.com"
    Github: "https://github.com/Yu-chen-Deng"
    Google Scholar: "https://scholar.google.com/citations?user=Dtup8JcAAAAJ&hl=en"
---

<script setup>
import { useData } from 'vitepress'
const { frontmatter } = useData()
</script>

<PersonalInfo />

<Profile :data="frontmatter.profile" />

<News :limit="8" />

<ProjectList :onlyHome="true" />