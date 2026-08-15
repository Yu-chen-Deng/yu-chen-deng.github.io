<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as articles } from '../../../archive.data'

const articlesByYear = computed(() => {
  const groups = new Map<string, typeof articles>()

  for (const article of articles) {
    const year = article.date.slice(0, 4) || 'Undated'
    const group = groups.get(year) ?? []
    group.push(article)
    groups.set(year, group)
  }

  return [...groups.entries()]
})

</script>

<template>
  <div v-if="articles.length" class="archive-list">
    <section v-for="[year, yearArticles] in articlesByYear" :key="year" class="archive-year">
      <h2>{{ year }}</h2>
      <article v-for="article in yearArticles" :key="article.url" class="archive-item">
        <time v-if="article.date" :datetime="article.date">{{ article.date }}</time>
        <div>
          <h3><a :href="withBase(article.url)">{{ article.title }}</a></h3>
          <p v-if="article.description">{{ article.description }}</p>
        </div>
      </article>
    </section>
  </div>
  <p v-else class="archive-empty">No articles yet.</p>
</template>

<style scoped>
.archive-year {
  margin-top: 2rem;
}

.archive-year h2 {
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--color-text-secondary);
}

.archive-item {
  display: grid;
  grid-template-columns: 9rem 1fr;
  gap: 1rem;
  padding: 1rem 0;
}

.archive-item time {
  align-self: start;
  justify-self: start;
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--color-text-primary);
  background: var(--color-background);
  box-shadow: 3px 3px 0 var(--color-text-secondary);
  color: var(--color-text-primary);
  font-family: 'Roboto Mono', monospace;
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  line-height: 1;
  transform: rotate(-1.5deg);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.archive-item:hover time {
  box-shadow: 1px 1px 0 var(--color-text-secondary);
  transform: translate(2px, 2px) rotate(0);
}

.archive-item h3,
.archive-item p {
  margin: 0;
}

.archive-item h3 a:hover {
  text-decoration: underline;
}

.archive-item p {
  margin-top: 0.35rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.archive-empty {
  color: var(--color-text-secondary);
}

@media (max-width: 688px) {
  .archive-item {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }
}
</style>
