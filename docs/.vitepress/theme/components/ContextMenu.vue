<template>
  <div
    v-if="visible"
    class="context-menu"
    :style="{ left: x + 'px', top: y + 'px' }"
  >
    <div
      class="context-item"
      v-if="hasSelection"
      @click="copy"
    >
      Copy
    </div>

    <div
      class="context-item"
      v-if="!hasSelection"
      @click="copyLink"
    >
      Copy Link
    </div>

    <div
      class="context-item"
      v-if="hasSelection"
      @click="copyHighlight"
    >
      Copy Highlight Link
    </div>

    <div
      class="context-item"
      v-if="hasSelection"
      @click="search"
    >
      Search
    </div>

    <div class="context-item" @click="top">
      Back to Top
    </div>

    <div class="context-item" @click="refresh">
      Refresh
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

const visible = ref(false)
const x = ref(0)
const y = ref(0)

const selectionText = ref('')

const hasSelection = computed(() => selectionText.value.length > 0)

function open(e) {
  x.value = e.detail.x
  y.value = e.detail.y

  const sel = window.getSelection()
  selectionText.value = sel ? sel.toString().trim() : ''

  visible.value = true
}

function close() {
  visible.value = false
}

function copy() {
  const text = window.getSelection().toString()
  navigator.clipboard.writeText(text)
  close()
}

function copyLink() {
  navigator.clipboard.writeText(location.href)
  close()
}

function copyHighlight() {
  if (!selectionText.value) return

  const encoded = encodeURIComponent(selectionText.value)
  const url = `${location.origin}${location.pathname}#:~:text=${encoded}`
  navigator.clipboard.writeText(url)

  close()
}

function search() {
  if (!selectionText.value) return

  const query = encodeURIComponent(selectionText.value)
  const url = `https://www.bing.com/search?q=${query}`
  window.open(url, '_blank')

  close()
}

function top() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  close()
}

function refresh() {
  location.reload()
}

onMounted(() => {
  window.addEventListener('open-context-menu', open)
  window.addEventListener('click', close)
})

onBeforeUnmount(() => {
  window.removeEventListener('open-context-menu', open)
})
</script>