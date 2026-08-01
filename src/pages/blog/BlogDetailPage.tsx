import { useEffect, useMemo, useState } from 'react'
import { articleApi } from '@/api/article'
import MarkdownView from '@/components/common/MarkdownView'
import { navigate } from '@/hooks/usePathname'
import type { Article } from '@/types/article'
import { resolveStorageUrl } from '@/utils/storage'
import './BlogPage.css'

function getArticleId() {
  const match = window.location.pathname.match(/^\/blog\/(\d+)$/)
  return match?.[1] ?? ''
}

export default function BlogDetailPage() {
  const articleId = getArticleId()
  const token = localStorage.getItem('renai_access_token') ?? ''
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!articleId) return
    setLoading(true)
    articleApi
      .detail({ id: Number(articleId) }, token)
      .then((articleRes) => {
        setArticle(articleRes.article ?? null)
      })
      .catch(() => {
        setArticle(null)
      })
      .finally(() => setLoading(false))
  }, [articleId, token])

  const toc = useMemo(() => {
    if (!article?.content) return [] as { id: string; text: string; level: number }[]
    const lines = article.content.split('\n')
    const items: { id: string; text: string; level: number }[] = []
    let idx = 0
    for (const line of lines) {
      const m = line.match(/^(#{1,3})\s+(.+)$/)
      if (!m) continue
      idx += 1
      items.push({ id: `heading-${idx}`, text: m[2], level: m[1].length })
    }
    return items
  }, [article?.content])

  return (
    <main className="blog-detail-page">
      <aside className="blog-detail-sidebar">
        <button type="button" className="back-btn" onClick={() => navigate('/blog')}>← 返回列表</button>
        <div className="toc-card">
          <h3>目录</h3>
          {toc.length ? toc.map((item) => <a key={item.id} href={`#${item.id}`} className={`toc-item level-${item.level}`}>{item.text}</a>) : <p>暂无目录</p>}
        </div>
        <button type="button" className="top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>返回顶部 ↑</button>
      </aside>

      <article className="blog-detail-content-wrap">
        {loading && <div className="detail-loading">加载中…</div>}
        {!loading && article && (
          <>
            <header className="detail-hero">
              <small>{article.authorName ?? '匿名'} · {new Date(article.createdAt * 1000).toLocaleDateString()}</small>
              <h1>{article.title}</h1>
              <p>{article.summary}</p>
              {article.coverImage && <img src={resolveStorageUrl(article.coverImage)} alt={article.title} />}
            </header>
            <section className="article-body">
              <MarkdownView content={article.content} />
            </section>
            <section className="comment-section">
              <h2>评论</h2>
              <div className="comment-list">
                <div className="empty-comments">评论功能暂未接入后端接口。</div>
              </div>
            </section>
          </>
        )}
      </article>
    </main>
  )
}
