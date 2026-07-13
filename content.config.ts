import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const base = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  tags: z.array(z.string()),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  readingTime: z.string().optional()
})

export default defineContentConfig({
  collections: {
    articles: defineCollection({
      type: 'page',
      source: 'articles/**/*.md',
      schema: base.extend({
        description: z.string().optional(),
        category: z.string()
      })
    }),
    projects: defineCollection({
      type: 'page',
      source: 'projects/**/*.md',
      schema: base.extend({ role: z.string(), period: z.string(), stack: z.array(z.string()) })
    })
  }
})
