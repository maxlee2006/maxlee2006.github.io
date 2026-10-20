import { z } from 'zod'

// URLs become attributes only after validation. HTML is never interpreted.
export function isSafeUrl(value: string): boolean {
  if (!value || /[\s\\\u0000-\u001f\u007f]/.test(value)) return false
  if (value.startsWith('/') && !value.startsWith('//')) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch {
    return false
  }
}

export function isSafeEmbed(value: string): boolean {
  if (!isSafeUrl(value) || value.startsWith('/')) return false
  const url = new URL(value)
  return (
    (['youtube.com', 'www.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname) && /^\/embed\/[\w-]+$/.test(url.pathname)) ||
    (url.hostname === 'store.steampowered.com' && /^\/widget\/\d+\/$/.test(url.pathname)) ||
    (url.hostname === 'www.musicnerd.xyz' && url.pathname === '/')
  ) && !url.port
}

const url = z.string().refine(isSafeUrl, 'Use a root-relative path or an HTTPS URL without whitespace or credentials')
const embedUrl = z.string().refine(isSafeEmbed, 'Unsupported embed URL')
export type ContentBlock =
  | { type: 'paragraph'; text: string; muted?: boolean }
  | { type: 'heading'; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'link'; href: string; text: string }
  | { type: 'embed'; src: string; title: string; height?: number }
  | { type: 'group'; layout: 'text' | 'embeds' | 'gallery'; body: ContentBlock[] }

// Limit nesting so an accidental JSON cycle/deeply nested input cannot exhaust the renderer.
function blockSchema(depth: number): z.ZodType<ContentBlock> {
  const blocks = [
    z.object({ type: z.literal('paragraph'), text: z.string(), muted: z.boolean().optional() }),
    z.object({ type: z.literal('heading'), text: z.string() }),
    z.object({ type: z.literal('image'), src: url, alt: z.string(), caption: z.string().optional() }),
    z.object({ type: z.literal('link'), href: url, text: z.string() }),
    z.object({ type: z.literal('embed'), src: embedUrl, title: z.string(), height: z.number().int().min(100).max(1000).optional() }),
  ] as const
  if (depth === 0) return z.discriminatedUnion('type', blocks)
  return z.discriminatedUnion('type', [...blocks, z.object({
    type: z.literal('group'), layout: z.enum(['text', 'embeds', 'gallery']),
    body: z.array(blockSchema(depth - 1)).max(500),
  })])
}

const contentSchema = z.object({
  thumbnail: url,
  date: z.string().default(''),
  method: z.string().default(''),
  description: z.string().default(''),
  hero_image: url.optional(),
  logo_image: url.optional(),
  subtitle: z.string().default(''),
  card_date: z.string().optional(),
  card_method: z.string().optional(),
  featured: z.boolean().default(false),
  featured_image: url.optional(),
  featured_description: z.string().default(''),
  body: z.array(blockSchema(4)).max(500),
})

export const recordSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  page: z.enum(['portfolio', 'design', 'professional-projects']),
  category: z.string(),
  sort_order: z.number().int(),
  published: z.literal(true),
  content: contentSchema,
}).superRefine((record, ctx) => {
  const categories: Record<string, string[]> = {
    portfolio: ['modeling', 'animation', 'sketches'],
    design: ['ue'],
    'professional-projects': ['custom-engines', 'web-development'],
  }
  if (!categories[record.page].includes(record.category)) {
    ctx.addIssue({ code: 'custom', path: ['category'], message: 'Category must belong to the selected page' })
  }
})

export type CmsRecord = z.infer<typeof recordSchema>
export type Catalog = { articles: CmsRecord[]; modals: CmsRecord[] }
export function articleHref(slug: string): string {
  return slug === 'long-march' ? '/LongMarch' : `/articles?slug=${encodeURIComponent(slug)}`
}
