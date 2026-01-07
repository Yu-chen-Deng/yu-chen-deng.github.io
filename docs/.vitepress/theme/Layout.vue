<script setup>
import { useData, withBase } from 'vitepress'
import { ref, onMounted } from 'vue'

const { site, theme } = useData()

const isDark = ref(false)
const isMenuOpen = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('theme')
  isDark.value = saved === 'dark'
  applyTheme()
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  applyTheme()
}

const applyTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

</script>

<template>
  <div class="mask-border"></div>

  <div class="wrapper">
    
    <header class="header">
      <div class="flex-container">
        <div class="header-inner">
          <div class="site-brand-container">
            <a class="site-brand" href="javascript:void(0);" @click="toggleTheme">
              <span id="brand-name">{{ site.title }} | {{ isDark ? '&nbsp;☽︎' : '☀' }}</span>
            </a>
          </div>
          
          <div id="menu-btn" class="menu-btn" @click="toggleMenu">
            {{ isMenuOpen ? '▲' : 'Menu' }}
          </div>

          <nav class="site-nav">
            <ul class="menu-list" :class="{ active: isMenuOpen }">
              <li v-for="item in theme.nav" :key="item.text" class="menu-item">
                <a :href="withBase(item.link)">{{ item.text }}</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>

    <main class="main">
      <div class="flex-container">
        <div class="vp-doc">
          <Content />
        </div>
      </div>
    </main>

    <footer class="footer">
      <div class="flex-container">
        <div class="footer-text">
          <p v-if="theme.footer?.copyright">
            {{ theme.footer.copyright }}
          </p>
        </div>
      </div>
    </footer>

  </div>
</template>