import { useEffect, useState } from 'react'
import { articleApi } from '@/api/article'
import { categoryApi } from '@/api/category'
import { navigate } from '@/hooks/usePathname'
import { resolveStorageUrl } from '@/utils/storage'
import type { AdminArticle } from '@/pages/admin/types'
import type { Category, CategoryType } from '@/types/category'
import type { Article } from '@/types/article'
import AdminConfirmDialog from '@/pages/admin/components/AdminConfirmDialog'

interface Props {
  articles: AdminArticle[]
  token: string
  userID: number
  canManageAll: boolean
  onArticlesChange: (articles: AdminArticle[]) => void
  onDelete: (id: string) => void | Promise<void>
}

const toAdminArticles = (articles: Article[]): AdminArticle[] => articles.map((article) => ({
  id: article.id,
  title: article.title,
  summary: article.summary,
  coverImage: article.coverImage,
  authorName: article.authorName,
  categoryID: Number(article.categoryID) || undefined,
  viewCount: article.viewCount,
  likeCount: article.likeCount,
  commentCount: article.commentCount,
  createdAt: article.createdAt,
  isTop: article.isTop,
}))

export default function ArticlesView({ articles, userID, canManageAll, token, onArticlesChange, onDelete }: Props) {
  const [types, setTypes] = useState<CategoryType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedType, setSelectedType] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null)

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
    void updateArticles(() => canManageAll
      ? articleApi.list({ page: 1, pageSize: 100 }, token)
      : articleApi.listByUser({ authorID: userID, page: 1, pageSize: 100 }, token))
  }

  const selectType = async (typeID: string) => {
    setSelectedType(typeID)
    setSelectedCategory('')
    setError('')
    setLoading(true)
    try {
      const res = await categoryApi.listCategories({ parentID: Number(typeID) }, token)
      const nextCategories = (res.categories ?? []).map((category) => ({
        ...category,
        id: String(category.id),
        parentID: String(category.parentID),
      }))
      setCategories(nextCategories)
      const results = await Promise.all(
        nextCategories.map((category) => articleApi.byCategory(Number(category.id), { page: 1, pageSize: 100 }, token)),
      )
      const merged = results.flatMap((result) => result.articles ?? [])
      onArticlesChange(toAdminArticles(Array.from(new Map(merged.map((article) => [article.id, article])).values())))
    } catch {
      setCategories([])
      setError('分类文章加载失败')
    } finally {
      setLoading(false)
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
    if (!canManageAll) return
    categoryApi.listTypes(token)
      .then((res) => setTypes((res.types ?? []).map((type) => ({ ...type, id: String(type.id) }))))
      .catch(() => setError('一级分类加载失败'))
  }, [canManageAll, token])

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

      {canManageAll && <div className="article-category-panel">
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
      </div>}

      <div className="card-title">
        <div>
          <h2>{selectedCategory ? categories.find((item) => item.id === selectedCategory)?.name : '文章列表'}</h2>
          <small>{loading ? '正在加载…' : `共 ${articles.length} 篇文章`}</small>
        </div>
      </div>
      {error && <div className="article-load-error">{error}</div>}
      <div className="admin-article-list">
        {!loading && articles.map((article) => (
          <article className="admin-article-item" key={article.id} onClick={() => navigate(`/blog/${article.id}`, { from: 'admin-articles' })}>
            {article.coverImage && (
              <div className="admin-article-cover">
                <img src={resolveStorageUrl(article.coverImage)} alt="" />
              </div>
            )}
            <div className="admin-article-content">
              <h3>{article.isTop && <span className="admin-article-top">置顶</span>}{article.title}</h3>
              <p>{article.summary || '暂无文章摘要'}</p>
              <div className="admin-article-meta">
                <span>{article.authorName ?? '匿名'}</span>
                <span>{new Date(article.createdAt * 1000).toLocaleDateString()}</span>
                <span>{article.viewCount ?? 0} 阅读</span>
                <span>{article.likeCount ?? 0} 点赞</span>
                <span>{article.commentCount ?? 0} 评论</span>
              </div>
            </div>
            <div className="admin-article-actions" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="text-button" onClick={() => navigate(`/blog/${article.id}`, { from: 'admin-articles' })}>查看</button>
              <button type="button" className="text-button" onClick={() => navigate(`/blog/${article.id}`, { from: 'admin-articles' })}>编辑</button>
              <button type="button" className="text-button danger" onClick={() => setArticleToDelete(article.id)}>删除</button>
            </div>
          </article>
        ))}
        {!loading && !articles.length && <div className="article-empty">暂无文章</div>}
      </div>

      {articleToDelete && (
        <AdminConfirmDialog
          title="删除文章"
          message="删除后无法恢复，确定要删除这篇文章吗？"
          onCancel={() => setArticleToDelete(null)}
          onConfirm={async () => {
            await onDelete(articleToDelete)
            setArticleToDelete(null)
          }}
        />
      )}
    </div>
  )
}
