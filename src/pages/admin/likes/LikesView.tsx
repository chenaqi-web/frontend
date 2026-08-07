import { useCallback, useEffect, useState } from 'react'
import { likeApi } from '@/api/like'
import { userApi } from '@/api/user'
import { navigate } from '@/hooks/usePathname'
import { resolveStorageUrl } from '@/utils/storage'
import type { Article } from '@/types/article'

const PAGE_SIZE = 100

export default function LikesView() {
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingID, setUpdatingID] = useState<string | null>(null)
  const token = localStorage.getItem('renai_access_token') ?? ''

  const loadLikes = useCallback(async () => {
    if (!token) {
      setError('登录已失效，请重新登录')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const user = await userApi.current(token)
      const result = await likeApi.list({ userId: user.id, objectType: 'article', page: 1, pageSize: PAGE_SIZE }, token)
      setArticles(result.articles ?? [])
      setTotal(result.total ?? 0)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '点赞列表加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadLikes()
  }, [loadLikes])

  const cancelLike = async (article: Article) => {
    if (updatingID) return
    setUpdatingID(article.id)
    setError('')
    try {
      const result = await likeApi.cancelThumbUp({ objectType: 'article', objectId: Number(article.id) }, token)
      if (!result.success) throw new Error('取消点赞失败')
      setArticles((current) => current.filter((item) => item.id !== article.id))
      setTotal((current) => Math.max(0, current - 1))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '取消点赞失败，请稍后重试')
    } finally {
      setUpdatingID(null)
    }
  }

  return (
    <div className="admin-card likes-manager">
      <div className="card-title">
        <div>
          <h2>我的点赞列表</h2>
          <small>{loading ? '正在加载…' : `共 ${total} 篇已点赞文章`}</small>
        </div>
        <button type="button" onClick={() => void loadLikes()}>刷新列表</button>
      </div>

      {error && <div className="article-load-error">{error}</div>}
      {!loading && !error && !articles.length && <div className="article-empty">你还没有点赞任何文章。</div>}

      {!loading && !error && articles.length > 0 && (
        <div className="admin-article-list">
          {articles.map((article) => (
            <article className="admin-article-item" key={article.id} onClick={() => navigate(`/blog/${article.id}`, { from: 'admin-likes' })}>
              {article.coverImage && (
                <div className="admin-article-cover">
                  <img src={resolveStorageUrl(article.coverImage)} alt="" />
                </div>
              )}
              <div className="admin-article-content">
                <h3>{article.title}</h3>
                <p>{article.summary || '暂无文章摘要'}</p>
                <div className="admin-article-meta">
                  <span>{article.authorName || '匿名'}</span>
                  <span>{new Date(article.createdAt * 1000).toLocaleDateString()}</span>
                  <span>{article.viewCount ?? 0} 阅读</span>
                  <span>{article.likeCount ?? 0} 点赞</span>
                  <span>{article.commentCount ?? 0} 评论</span>
                </div>
              </div>
              <div className="admin-article-actions" onClick={(event) => event.stopPropagation()}>
                <button type="button" className="like-toggle liked" disabled={updatingID === article.id} aria-label="取消点赞" title="点击取消点赞" onClick={() => void cancelLike(article)}>
                  <span aria-hidden="true">♥</span>
                </button>
                <button type="button" className="text-button" onClick={() => navigate(`/blog/${article.id}`, { from: 'admin-likes' })}>查看文章</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
