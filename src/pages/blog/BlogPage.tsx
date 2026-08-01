import { useEffect, useMemo, useState } from 'react'
import { articleApi } from '@/api/article'
import type { Article } from '@/types/article'
import { resolveStorageUrl } from '@/utils/storage'
import BlogDetailModal from '@/pages/blog/BlogDetailModal'
import './BlogPage.css'

const PAGE_SIZE = 10

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const token = localStorage.getItem('renai_access_token') ?? ''

  useEffect(() => {
    setLoading(true)
    articleApi
      .list({ page: 1, pageSize: PAGE_SIZE }, token)
      .then((res) => setArticles(res.articles ?? []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [token])

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase()
    if (!query) return articles
    return articles.filter((a) => a.title.toLowerCase().includes(query) || (a.summary ?? '').toLowerCase().includes(query))
  }, [articles, keyword])

  return (
    <main className="inner-page blog-page">
      <header className="page-intro compact-panel">
        <span>CLUB BLOG</span>
        <h1>社团博客</h1>
        <p>公告、脑洞、经验和偶尔认真写下来的长文章。</p>
      </header>

      <div className="blog-toolbar compact-panel">
        <div className="filter-result">
          <span>✎</span>
          当前找到 <b>{filtered.length}</b> 篇文章
        </div>
        <label className="search-note">
          <span>⌕</span>
          <input aria-label="搜索博客" placeholder="搜点什么…" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </label>
      </div>

      {loading && <div className="blog-loading compact-panel">正在拉取文章…</div>}

      <div className="blog-grid">
        {filtered.map((article) => (
          <article className="blog-card compact-panel" key={article.id} onClick={() => setSelectedId(String(article.id))}>
            <div className="blog-cover">
              {article.coverImage ? <img src={resolveStorageUrl(article.coverImage)} alt={article.title} /> : <span>📝</span>}
            </div>
            <div className="blog-content">
              <small>{article.authorName ?? '匿名'} · {new Date(article.createdAt * 1000).toLocaleDateString()}</small>
              <h2>{article.title}</h2>
              <p>{article.summary}</p>
              <div className="post-meta">
                <div>
                  {article.isTop && <span>#置顶</span>}
                  <span>#浏览 {article.viewCount}</span>
                  <span>#点赞 {article.likeCount}</span>
                </div>
                <b>♡ {article.commentCount} 条评论</b>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!loading && filtered.length === 0 && <div className="empty-note compact-panel">这里还空着，等一篇新故事掉进来…</div>}

      <BlogDetailModal articleId={selectedId} token={token} onClose={() => setSelectedId(null)} />
    </main>
  )
}
