import { createContentLoader } from 'vitepress'

export interface ArchiveArticle {
  title: string
  date: string
  description: string
  url: string
}

export default createContentLoader<ArchiveArticle[]>('archive/**/*.md', {
  transform(rawArticles) {
    return rawArticles
      .filter(({ url }) => url !== '/archive/')
      .map(({ url, frontmatter }) => {
        const rawDate = frontmatter.date
        const date = rawDate instanceof Date
          ? rawDate.toISOString().slice(0, 10)
          : String(rawDate ?? '')

        return {
          title: frontmatter.title || 'Untitled',
          date,
          description: frontmatter.description || '',
          url
        }
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }
})
