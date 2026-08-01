import { env } from '@/config/env'

const STORAGE_PREFIX = '/static/upload'

const isAbsoluteURL = (url: string) =>
  url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')

const isStoragePath = (url: string) => url.startsWith(STORAGE_PREFIX)

export function resolveStorageUrl(url: string): string {
  if (!url) return url
  if (isAbsoluteURL(url)) return url
  if (isStoragePath(url)) return `${env.apiBaseUrl}${url}`
  return url
}

const IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)]+)\)/g

export function resolveMarkdownImages(markdown: string): string {
  if (!markdown) return ''
  return markdown.replace(IMAGE_PATTERN, (match, alt: string, src: string) => {
    const trimmed = src.trim()
    const resolved = resolveStorageUrl(trimmed)
    return `![${alt}](${resolved})`
  })
}
