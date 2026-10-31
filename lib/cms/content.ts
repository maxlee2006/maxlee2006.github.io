import { z } from 'zod'

/** Shared rules for live reads, the import exporter, and cms:check.
 * JSON is data: objects have named fields; arrays keep items in order.
 * TypeScript describes valid values to the editor. Zod checks actual values
 * while the program runs, including data returned over the network.
 */
// A root-relative path (/assets/...) uses this website's host. An HTTPS URL
// includes another host. Reject script/data URLs, ambiguous //host paths,
// backslashes, whitespace/control characters, and embedded usernames/passwords.
// This checks address syntax, not whether an image exists or its host is trusted.
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

// An embed puts another website inside an iframe (a small browser area).
// Unlike ordinary links/images, only these specific providers and URL shapes
// are supported. A normal YouTube watch URL must become /embed/VIDEO_ID.
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
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
// Choose exactly one destination. Article slugs use the site's existing routes;
// href and image use the same safe URL rules as other content blocks.
const buttonSchema = z.union([
  z.object({ text: z.string().trim().min(1), article: slug, href: z.never().optional(), image: url.optional() }),
  z.object({ text: z.string().trim().min(1), href: url, article: z.never().optional(), image: url.optional() }),
])
export type ContentButton = z.infer<typeof buttonSchema>
// The type field selects which other fields are meaningful. An ordered body
// can repeat a type: paragraph -> image -> paragraph is three separate entries.
export type ContentBlock =
  | { type: 'paragraph'; text: string; muted?: boolean }
  | { type: 'heading'; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'link'; href: string; text: string }
  | { type: 'code'; code: string; language?: string; filename?: string }
  | { type: 'buttons'; buttons: ContentButton[] }
  | { type: 'embed'; src: string; title: string; height?: number }
  | { type: 'group'; layout: 'text' | 'embeds' | 'gallery'; body: ContentBlock[] }

// A group contains another body array. Build progressively shallower validators
// to allow at most four nested groups and 500 entries per body. That keeps
// malformed/deep input from causing unbounded recursive validation/rendering.
function blockSchema(depth: number): z.ZodType<ContentBlock> {
  const blocks = [
    z.object({ type: z.literal('paragraph'), text: z.string(), muted: z.boolean().optional() }),
    z.object({ type: z.literal('heading'), text: z.string() }),
    z.object({ type: z.literal('image'), src: url, alt: z.string(), caption: z.string().optional() }),
    z.object({ type: z.literal('link'), href: url, text: z.string() }),
    z.object({ type: z.literal('code'), code: z.string().max(100000), language: z.string().trim().min(1).max(100).optional(), filename: z.string().optional() }),
    z.object({ type: z.literal('buttons'), buttons: z.array(buttonSchema).min(1).max(100) }),
    z.object({ type: z.literal('embed'), src: embedUrl, title: z.string(), height: z.number().int().min(100).max(1000).optional() }),
  ] as const
  if (depth === 0) return z.discriminatedUnion('type', blocks)
  return z.discriminatedUnion('type', [...blocks, z.object({
    type: z.literal('group'), layout: z.enum(['text', 'embeds', 'gallery']),
    body: z.array(blockSchema(depth - 1)).max(500),
  })])
}

// Optional means a field can be absent; default supplies a value when absent.
// Defaults don't overwrite the database: they normalize the copy we read.
// thumbnail and body are required even when no hero or metadata is supplied.
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

// These are the seven CMS columns read by the site. published must be true
// because this schema describes PUBLIC content, not partially completed drafts.
// superRefine below checks a relationship between fields: a valid category must
// belong to the selected page, rather than just being any string.
export const recordSchema = z.object({
  slug,
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
// Preserve the old case-sensitive LongMarch address. Other articles share one
// static page, which reads the slug after ? in the address. No new HTML file is
// required per article; encodeURIComponent safely inserts the slug into a URL.
export function articleHref(slug: string): string {
  return slug === 'long-march' ? '/LongMarch' : `/articles?slug=${encodeURIComponent(slug)}`
}
