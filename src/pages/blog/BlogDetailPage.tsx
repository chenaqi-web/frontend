import { useEffect, useMemo, useState } from 'react'
import { articleApi } from '@/api/article'
import { commentApi } from '@/api/comment'
import { likeApi } from '@/api/like'
import { userApi } from '@/api/user'
import MarkdownView from '@/components/common/MarkdownView'
import { navigate } from '@/hooks/usePathname'
import type { Article } from '@/types/article'
import type { CommentItem } from '@/types/comment'
import type { CurrentUser } from '@/types/user'
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
  const [comments, setComments] = useState<CommentItem[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const userId = Number(localStorage.getItem('renai_user_id') ?? 0)

  useEffect(() => {
    if (!articleId) return
    setLoading(true)
    articleApi
      .detail({ id: Number(articleId) }, token)
      .then((articleRes) => setArticle(articleRes.article ?? null))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false))
  }, [articleId, token])

  useEffect(() => {
    if (!articleId) return
    setCommentsLoading(true)
    commentApi.list({ articleId: Number(articleId), page: 1, size: 50 }, token)
      .then((res) => setComments(res.comments ?? []))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false))
  }, [articleId, token])

  useEffect(() => {
    if (!token) return
    userApi.current(token).then(setCurrentUser).catch(() => setCurrentUser(null))
  }, [token])

  const submitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = commentText.trim()
    if (!content || !articleId || !currentUser || commentSubmitting) return
    setCommentSubmitting(true)
    try {
      await commentApi.create({ articleId: Number(articleId), userId: currentUser.id, content }, token)
      const res = await commentApi.list({ articleId: Number(articleId), page: 1, size: 50 }, token)
      setComments(res.comments ?? [])
      setCommentText('')
    } finally {
      setCommentSubmitting(false)
    }
  }

  const toggleLike = async () => {
    if (!article || likeLoading || !currentUser) return
    setLikeLoading(true)
    try {
      const payload = { userId: currentUser.id, objectType: 'article', objectId: Number(article.id) }
      if (liked) await likeApi.cancelThumbUp(payload, token)
      else await likeApi.thumbUp(payload, token)
      setLiked(!liked)
      setArticle({ ...article, likeCount: Math.max(0, article.likeCount + (liked ? -1 : 1)) })
    } finally {
      setLikeLoading(false)
    }
  }

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
