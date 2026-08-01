import { useEffect, useMemo, useState } from 'react'
import { articleApi } from '@/api/article'
import { categoryApi } from '@/api/category'
import type { Article } from '@/types/article'
import type { Category, CategoryType } from '@/types/category'
import { resolveStorageUrl } from '@/utils/storage'
import { navigate } from '@/hooks/usePathname'
import './BlogPage.css'

const PAGE_SIZE = 20

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [types, setTypes] = useState<CategoryType[]>([])
  const [subCategories, setSubCategories] = useState<Category[]>([])
  const [selectedType, setSelectedType] = useState('all')
  const [selectedSub, setSelectedSub] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('renai_access_token') ?? ''

  useEffect(() => {
    categoryApi.listTypes(token)
      .then((res) => setTypes(res.types ?? []))
      .catch(() => setTypes([]))
  }, [token])

  useEffect(() => {
    if (selectedType === 'all') {
      setSubCategories([])
      return
    }
    categoryApi.listCategories({ parentID: Number(selectedType) }, token)
      .then((res) => setSubCategories(res.categories ?? []))
      .catch(() => setSubCategories([]))
  }, [selectedType, token])

  useEffect(() => {
    setLoading(true)
    const loader = selectedSub === 'all'
      ? articleApi.list({ page: 1, pageSize: PAGE_SIZE }, token)
      : articleApi.byCategory(Number(selectedSub), { page: 1, pageSize: PAGE_SIZE }, token)

    loader
      .then((res) => setArticles(res.articles ?? []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [selectedSub, token])

  const search = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    const keyword = searchText.trim()
    setLoading(true)
    const loader = keyword
      ? articleApi.search(keyword, { page: 1, pageSize: PAGE_SIZE }, token)
      : articleApi.list({ page: 1, pageSize: PAGE_SIZE }, token)

    loader
      .then((res) => {
        setArticles(res.articles ?? [])
        if (keyword) {
          setSelectedType('all')
          setSelectedSub('all')
        }
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }

  const selectType = (id: string) => {
    setSearchText('')
    setSelectedType(id)
    setSelectedSub('all')
  }

  const selectSubCategory = (id: string) => {
    setSearchText('')
    setSelectedSub(id)
  }

  const visibleArticles = useMemo(() => articles, [articles])

  return (
    <main className="inner-page blog-page">
      <header className="page-intro compact-panel">
        <span>CLUB BLOG</span>
        <h1>社团博客</h1>
        <p>公告、脑洞、经验和偶尔认真写下来的长文章。</p>
      </header>

      <form className="blog-search" onSubmit={search} role="search">
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="搜索文章标题或内容…"
          aria-label="搜索博客文章"
        />
        <button type="submit">搜索</button>
      </form>

      <section className="blog-category-panel compact-panel" aria-label="博客分类筛选">
        <div className="blog-category-row">
          <button type="button" className={selectedType === 'all' ? 'active' : ''} onClick={() => selectType('all')}>全部文章</button>
          {types.map((type) => (
            <button type="button" key={type.id} className={selectedType === String(type.id) ? 'active' : ''} onClick={() => selectType(String(type.id))}>
              {type.name}
            </button>
          ))}
        </div>
        {selectedType !== 'all' && (
          <div className="blog-subcategory-row">
            {subCategories.length === 0 && <span>该分类暂无二级分类</span>}
            {subCategories.map((category) => (
              <button type="button" key={category.id} className={selectedSub === String(category.id) ? 'active' : ''} onClick={() => selectSubCategory(String(category.id))}>
                {category.name}
              </button>
            ))}
          </div>
        )}
      </section>

      {loading && <div className="blog-loading compact-panel">正在拉取文章…</div>}

      <div className="blog-grid">
        {visibleArticles.map((article) => (
          <article className="blog-card compact-panel" key={article.id} onClick={() => navigate(`/blog/${article.id}`)}>
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

      {!loading && visibleArticles.length === 0 && <div className="empty-note compact-panel">这里还空着，等一篇新故事掉进来…</div>}
    </main>
  )
}
