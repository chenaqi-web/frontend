import { useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { resolveMarkdownImages } from '@/utils/storage'

interface Props {
  content: string
  className?: string
}

marked.setOptions({ breaks: true, gfm: true })

export default function MarkdownView({ content, className }: Props) {
  const html = useMemo(() => {
    if (!content) return ''
    const resolved = resolveMarkdownImages(content)
    const raw = marked.parse(resolved) as string
    return DOMPurify.sanitize(raw)
  }, [content])

  return <div className={className ?? 'markdown-body'} dangerouslySetInnerHTML={{ __html: html }} />
}
