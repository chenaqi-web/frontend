const isAbsoluteURL = (url: string) =>
  url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')

const normalizeStoragePath = (url: string) => url.replace(/^\/+/, '')

export function resolveStorageUrl(url: string): string {
  if (!url) return url
  if (isAbsoluteURL(url)) return url

  const normalized = normalizeStoragePath(url)
  if (normalized.startsWith('static/upload')) {
    return `/${normalized}`
  }

  return url
}

const IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)]+)\)/g

export function resolveMarkdownImages(markdown: string): string {
  if (!markdown) return ''
  return markdown.replace(IMAGE_PATTERN, (_match, alt: string, src: string) => {
    const trimmed = src.trim()
    const resolved = resolveStorageUrl(trimmed)
    return `![${alt}](${resolved})`
  })
}
