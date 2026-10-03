import { createContentLoader } from 'vitepress'

export default createContentLoader('data/activities.md', {
  render: true,
  transform(pages) {
    return pages[0]?.html ?? ''
  }
})
