import { useEffect, useState } from 'react'
import { articleApi } from '@/api/article'
import { categoryApi } from '@/api/category'
import { navigate } from '@/hooks/usePathname'
import type { AdminArticle } from '@/pages/admin/types'
import type { Category, CategoryType } from '@/types/category'
import type { Article } from '@/types/article'

interface Props {
  articles: AdminArticle[]
  onArticlesChange: (articles: AdminArticle[]) => void
  onDelete: (id: string) => void
}

const toAdminArticles = (articles: Article[]): AdminArticle[] => articles.map((article) => ({
  id: article.id,
  title: article.title,
  authorName: article.authorName,
  categoryID: Number(article.categoryID) || undefined,
  viewCount: article.viewCount,
  createdAt: article.createdAt,
  isTop: article.isTop,
}))

export default function ArticlesView({ articles, onArticlesChange, onDelete }: Props) {
  const [types, setTypes] = useState<CategoryType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedType, setSelectedType] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const token = localStorage.getItem('renai_access_token') ?? ''

  const updateArticles = async (loader: () => ReturnType<typeof articleApi.list>) => {
    setLoading(true)
    setError('')
    try {
      const res = await loader()
      onArticlesChange(toAdminArticles(res.articles ?? []))
    } catch {
      setError('文章加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const showAll = () => {
    setSelectedType('')
    setSelectedCategory('')
    setCategories([])
    void updateArticles(() => articleApi.list({ page: 1, pageSize: 100 }, token))
  }

  const selectType = async (typeID: string) => {
    setSelectedType(typeID)
    setSelectedCategory('')
    setError('')
    try {
      const res = await categoryApi.listCategories({ parentID: Number(typeID) }, token)
      setCategories((res.categories ?? []).map((category) => ({
        ...category,
        id: String(category.id),
        parentID: String(category.parentID),
      })))
    } catch {
      setCategories([])
      setError('二级分类加载失败')
    }
  }

  const selectCategory = (categoryID: string) => {
    setSelectedCategory(categoryID)
    void updateArticles(() => articleApi.byCategory(Number(categoryID), { page: 1, pageSize: 100 }, token))
  }

  const search = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    const q = keyword.trim()
    if (!q) {
      showAll()
      return
    }
    setSelectedType('')
    setSelectedCategory('')
    setCategories([])
    void updateArticles(() => articleApi.search(q, { page: 1, pageSize: 100 }, token))
  }

  useEffect(() => {
    categoryApi.listTypes(token)
      .then((res) => setTypes((res.types ?? []).map((type) => ({ ...type, id: String(type.id) }))))
      .catch(() => setError('一级分类加载失败'))
  }, [token])

  return (
    <div className="admin-card table-card articles-manager">
      <form className="article-search" onSubmit={search}>
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索文章标题或内容"
          aria-label="搜索文章"
        />
        <button type="submit">搜索</button>
      </form>

      <div className="article-category-panel">
        <div className="article-category-row">
          <button type="button" className={!selectedType ? 'active' : ''} onClick={showAll}>全部文章</button>
          {types.map((type) => (
            <button
              type="button"
              key={type.id}
              className={selectedType === type.id ? 'active' : ''}
              onClick={() => void selectType(type.id)}
            >
              {type.name}
            </button>
          ))}
        </div>
        {selectedType && (
          <div className="article-category-row article-subcategories">
            {categories.length ? categories.map((category) => (
              <button
                type="button"
                key={category.id}
                className={selectedCategory === category.id ? 'active' : ''}
                onClick={() => selectCategory(category.id)}
              >
                {category.name}
              </button>
            )) : <span>该分类暂无二级分类</span>}
          </div>
        )}
      </div>

      <div className="card-title">
        <div>
          <h2>{selectedCategory ? categories.find((item) => item.id === selectedCategory)?.name : '文章列表'}</h2>
          <small>{loading ? '正在加载…' : `共 ${articles.length} 篇文章`}</small>
        </div>
      </div>
      {error && <div className="article-load-error">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>文章标题</th><th>作者</th><th>浏览</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            {!loading && articles.map((article) => (
              <tr key={article.id}>
                <td><b>{article.isTop && '置顶 · '}{article.title}</b><small>#{article.id}</small></td>
                <td>{article.authorName ?? '匿名'}</td>
                <td>{article.viewCount ?? 0}</td>
                <td><span className="status status-muted">已发布</span></td>
                <td>
                  <button type="button" className="text-button" onClick={() => navigate(`/blog/${article.id}`, { from: 'admin-articles' })}>查看</button>
                  <button type="button" className="text-button" onClick={() => navigate(`/blog/${article.id}`, { from: 'admin-articles' })}>编辑</button>
                  <button type="button" className="text-button danger" onClick={() => onDelete(article.id)}>删除</button>
                </td>
              </tr>
            ))}
            {!loading && !articles.length && <tr><td colSpan={5} className="article-empty">暂无文章</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
