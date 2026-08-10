import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { articleApi } from '@/api/v1/article'
import { categoryApi } from '@/api/v1/category'
import AppLink from '@/components/common/AppLink'
import type { Article } from '@/types/article'
import type { Category, CategoryType } from '@/types/category'
import { resolveStorageUrl } from '@/utils/storage'
import './BlogPage.css'

const PAGE_SIZE = 12
type CategoryGroup = { type: CategoryType; categories: Category[] }
const formatDate = (value: number) => new Date(value > 1_000_000_000_000 ? value : value * 1000).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })

export default function BlogPage() {
  const [groups, setGroups] = useState<CategoryGroup[]>([])
  const [selectedType, setSelectedType] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState(0)
  const [articles, setArticles] = useState<Article[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [query, setQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { void categoryApi.listTypes().then(async ({ types }) => { const children = await Promise.all(types.map((type) => categoryApi.listCategories({ parentID: type.id }))); setGroups(types.map((type, index) => ({ type, categories: children[index].categories ?? [] }))) }).catch((reason: Error) => setError(reason.message)) }, [])
  useEffect(() => { let active = true; setLoading(true); setError(''); const params = { page, pageSize: PAGE_SIZE }; const selectedChildren = groups.find((group) => group.type.id === selectedType)?.categories ?? []; const request = query ? articleApi.search(query, params) : selectedCategory ? articleApi.byCategory(selectedCategory, params) : selectedType ? Promise.all(selectedChildren.map((category) => articleApi.byCategory(category.id, params))).then((responses) => ({ articles: responses.flatMap((response) => response.articles ?? []) })) : articleApi.list(params); void request.then(({ articles: nextArticles }) => { if (!active) return; const next = nextArticles ?? []; setArticles((current) => page === 1 ? next : [...current, ...next]); setHasMore(next.length === PAGE_SIZE) }).catch((reason: Error) => { if (active) setError(reason.message) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [page, query, selectedCategory, selectedType, groups])

  const categoryNames = useMemo(() => new Map(groups.flatMap((group) => group.categories.map((item) => [item.id, item.name] as const))), [groups])
  const activeChildren = groups.find((group) => group.type.id === selectedType)?.categories ?? []
  const resetAnd = (action: () => void) => { setPage(1); action() }
  const clearFilters = () => resetAnd(() => { setSelectedType(0); setSelectedCategory(0); setQuery(''); setSearchInput('') })
  const submitSearch = (event: FormEvent) => { event.preventDefault(); resetAnd(() => { setSelectedType(0); setSelectedCategory(0); setQuery(searchInput.trim()) }) }

  return <main className="front-blog-page">
    <section className="front-search-hero" aria-label="搜索文章"><form className="front-blog-search" onSubmit={submitSearch}><label htmlFor="blog-search">搜索文章</label><div><span className="front-search-icon" aria-hidden="true" /><input id="blog-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="搜索技术文章、笔记、源码" /><button type="submit">搜索</button></div></form></section>
    <section className="front-filter-panel" aria-label="文章分类">
      <header className="front-category-title"><i aria-hidden="true" /><strong>文章分类</strong></header>
      <div className="front-filter-row"><strong>主题分类</strong><div className="front-filter-options"><button type="button" className={!selectedType ? 'active' : ''} onClick={clearFilters}>全部</button>{groups.map((group) => <button type="button" className={selectedType === group.type.id ? 'active' : ''} key={group.type.id} onClick={() => resetAnd(() => { setSelectedType(group.type.id); setSelectedCategory(0); setQuery(''); setSearchInput('') })}>{group.type.name}<small>{group.categories.length}</small></button>)}</div></div>
      {selectedType > 0 && <div className="front-filter-row front-secondary-filter"><strong>细分类型</strong><div className="front-filter-options"><button type="button" className={!selectedCategory ? 'active' : ''} onClick={() => resetAnd(() => setSelectedCategory(0))}>全部细分</button>{activeChildren.map((category) => <button type="button" className={selectedCategory === category.id ? 'active' : ''} key={category.id} onClick={() => resetAnd(() => setSelectedCategory(category.id))}>{category.name}</button>)}</div></div>}
    </section>
    <section className="front-blog-results" aria-live="polite"><header className="front-results-head"><div><span className="front-results-kicker">ARTICLE INDEX</span><h2>{query ? `“${query}” 的搜索结果` : selectedCategory ? categoryNames.get(selectedCategory) : selectedType ? groups.find((group) => group.type.id === selectedType)?.type.name : '最新文章'}</h2><span>{query ? '为你筛选出的相关内容' : '从最近更新开始，探索团队的故事与经验'}</span></div>{Boolean(query || selectedType) && <button type="button" onClick={clearFilters}>重置筛选 <span aria-hidden="true">↗</span></button>}</header>
      {error && <div className="front-blog-state error"><strong>加载失败</strong><span>{error}</span></div>}{!error && loading && page === 1 && <div className="front-blog-state">正在加载文章...</div>}{!error && !loading && articles.length === 0 && <div className="front-blog-state"><strong>暂时没有找到文章</strong><span>换个分类或关键词试试。</span></div>}
      <div className="front-article-grid">{articles.map((article) => <AppLink className="front-article-card" to={`/blog/${article.id}`} key={article.id}><div className="front-article-cover">{article.coverImage ? <img src={resolveStorageUrl(article.coverImage)} alt={`${article.title}封面`} loading="lazy" /> : <span>{article.title.slice(0, 1)}</span>}</div><div className="front-article-copy"><div className="front-article-kicker"><span>{categoryNames.get(article.categoryID) ?? '未分类'}</span><time>{formatDate(article.createdAt)}</time></div><h3>{article.title}</h3><p>{article.summary || '这篇文章还没有摘要，进入正文继续阅读。'}</p><footer><span className="front-author">{article.authorAvatar ? <img src={resolveStorageUrl(article.authorAvatar)} alt="" /> : <i>{(article.authorName || 'R').slice(0, 1)}</i>}<b>{article.authorName || 'Renai 成员'}</b></span><span className="front-card-metrics"><span>评论 {article.commentCount}</span><span>浏览 {article.viewCount}</span><span>点赞 {article.likeCount}</span></span></footer></div></AppLink>)}</div>{hasMore && !error && <button type="button" className="front-load-more" disabled={loading} onClick={() => setPage((current) => current + 1)}>{loading ? '加载中...' : '加载更多'}</button>}
    </section>
  </main>
}
