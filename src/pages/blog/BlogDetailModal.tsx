import { useEffect, useState } from 'react'
import { articleApi } from '@/api/article'
import type { Article } from '@/types/article'
import MarkdownView from '@/components/common/MarkdownView'
import { resolveStorageUrl } from '@/utils/storage'

interface Props {
  articleId: string | null
  token?: string
  onClose: () => void
}

export default function BlogDetailModal({ articleId, token, onClose }: Props) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!articleId) return
    setLoading(true)
    setArticle(null)
    articleApi
      .detail({ id: Number(articleId) }, token)
      .then((res) => setArticle(res.article ?? null))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false))
  }, [articleId, token])

  if (!articleId) return null

  return (
    <div className="blog-detail-overlay" onClick={onClose}>
      <div className="blog-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="blog-detail-close" onClick={onClose}>×</button>
        {loading && <div className="blog-detail-loading">加载中…</div>}
        {!loading && article && (
          <>
            <div className="blog-detail-header">
              <small>{article.authorName ?? '匿名'} · {new Date(article.createdAt * 1000).toLocaleDateString()}</small>
              <h2>{article.title}</h2>
              {article.summary && <p className="blog-detail-summary">{article.summary}</p>}
            </div>
            {article.coverImage && <img className="blog-detail-cover" src={resolveStorageUrl(article.coverImage)} alt={article.title} />}
            <MarkdownView content={article.content} className="blog-detail-content" />
          </>
        )}
        {!loading && !article && <div className="blog-detail-loading">文章加载失败</div>}
      </div>
    </div>
  )
}
