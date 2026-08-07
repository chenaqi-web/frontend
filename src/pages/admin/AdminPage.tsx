import { useEffect, useState } from 'react'
import { request } from '@/api/http'
import { categoryApi } from '@/api/category'
import { articleApi } from '@/api/article'
import type { Category, CategoryType } from '@/types/category'
import AdminSidebar from '@/pages/admin/components/AdminSidebar'
import AdminTopbar from '@/pages/admin/components/AdminTopbar'
import DashboardView from '@/pages/admin/dashboard/DashboardView'
import ArticlesView from '@/pages/admin/articles/ArticlesView'
import CategoriesView from '@/pages/admin/categories/CategoriesView'
import UsersView from '@/pages/admin/users/UsersView'
import LikesView from '@/pages/admin/likes/LikesView'
import SettingsView from '@/pages/admin/settings/SettingsView'
import CreateArticleView from '@/pages/admin/create/CreateArticleView'
import { type AdminArticle, type AdminTab } from '@/pages/admin/types'
import './AdminPage.css'

const demoArticles: AdminArticle[] = [
  { id: '101', title: '夏日社团活动记录', authorName: '小爱', categoryID: 1, viewCount: 1280, createdAt: Date.now() / 1000 },
  { id: '102', title: '给新手的内容发布指南', authorName: 'Mio', categoryID: 2, viewCount: 826, createdAt: Date.now() / 1000 - 86400 },
  { id: '103', title: 'RenaiTeam 本周资讯', authorName: '小凛', categoryID: 3, viewCount: 456, createdAt: Date.now() / 1000 - 172800 },
]

export default function AdminPage() {
  const pathname = window.location.pathname
  const initialTab: AdminTab = pathname.startsWith('/admin/create')
    ? 'create'
    : pathname.startsWith('/admin/blog')
      ? 'articles'
      : pathname.startsWith('/admin/categories')
      ? 'categories'
      : pathname.startsWith('/admin/users')
        ? 'users'
        : pathname.startsWith('/admin/likes')
          ? 'likes'
          : pathname.startsWith('/admin/settings')
            ? 'settings'
            : 'dashboard'
  const currentUser = JSON.parse(localStorage.getItem('renai_current_user') ?? '{}') as { id?: number; role?: string }
  const role = currentUser.role ?? 'user'
  const userID = currentUser.id ?? 0
  const token = localStorage.getItem('renai_access_token') ?? ''
  const canManageAllArticles = role === 'admin'
  const [tab, setTab] = useState<AdminTab>(initialTab)
  const [articles, setArticles] = useState<AdminArticle[]>(demoArticles)
  const [types, setTypes] = useState<CategoryType[]>([])
  const [children, setChildren] = useState<Category[]>([])
  const [selectedType, setSelectedType] = useState('')
  const [notice, setNotice] = useState('')

  const loadChildren = async (id: string) => {
    setSelectedType(id)
    try {
      const res = await categoryApi.listCategories({ parentID: Number(id) }, token)
      setChildren((res.categories ?? [])
        .filter((c) => c.name?.trim())
        .map((c) => ({
          ...c,
          id: String(c.id),
          parentID: String(c.parentID),
          name: c.name.trim(),
        })))
    } catch {
      setChildren([])
      setNotice('子分类加载失败')
    }
  }

  useEffect(() => {
    const articleLoader = canManageAllArticles
      ? articleApi.list({ page: 1, pageSize: 100 }, token)
      : articleApi.listByUser({ authorID: userID, page: 1, pageSize: 100 }, token)

    articleLoader
      .then((res) => {
        if (res.articles?.length) {
          setArticles(res.articles.map((article) => ({
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
          })))
        }
      })
      .catch(() => undefined)

    categoryApi
      .listTypes(token)
      .then((res) => {
        const nextTypes = (res.types ?? [])
          .filter((t) => t.name?.trim())
          .map((t) => ({ ...t, id: String(t.id), name: t.name.trim() }))
        setTypes(nextTypes)
        if (nextTypes[0]) {
          setSelectedType(nextTypes[0].id)
          void loadChildren(nextTypes[0].id)
        }
      })
      .catch(() => setNotice('一级分类加载失败，请检查分类服务'))
  }, [canManageAllArticles, token, userID])

  const refreshTypes = async () => {
    const res = await categoryApi.listTypes(token)
    setTypes((res.types ?? [])
      .filter((t) => t.name?.trim())
      .map((t) => ({ ...t, id: String(t.id), name: t.name.trim() })))
  }

  const addType = async (name: string) => {
    if (!name.trim()) return
    try {
      const res = await categoryApi.createType({ name }, token)
      if (!res.success) throw new Error()
      await refreshTypes()
      setNotice('一级分类已添加')
    } catch {
      setNotice('新增一级分类失败')
    }
  }

  const deleteType = async (id: string) => {
    try {
      const res = await categoryApi.deleteType({ id: Number(id) }, token)
      if (!res.success) throw new Error()
      await refreshTypes()
      setChildren([])
      setNotice('一级分类已删除')
    } catch {
      setNotice('删除一级分类失败')
    }
  }

  const addCategory = async (name: string) => {
    if (!selectedType || !name.trim()) return
    try {
      const res = await categoryApi.createCategory({ parentID: Number(selectedType), name }, token)
      if (!res.success) throw new Error()
      await loadChildren(selectedType)
      setNotice('子分类已添加')
    } catch {
      setNotice('新增子分类失败')
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const res = await categoryApi.deleteCategory({ id: Number(id) }, token)
      if (!res.success) throw new Error()
      await loadChildren(selectedType)
      setNotice('子分类已删除')
    } catch {
      setNotice('删除子分类失败')
    }
  }

  const removeArticle = async (id: string) => {
    try {
      await request('/v1/article/del', { method: 'DELETE', body: { id: Number(id), authorID: 0 }, token })
      setArticles(articles.filter((item) => item.id !== id))
      setNotice('文章已删除')
    } catch {
      setNotice('删除失败，请确认登录身份')
    }
  }

  useEffect(() => {
    const allowedTabs: AdminTab[] = canManageAllArticles
      ? ['dashboard', 'create', 'articles', 'categories', 'users', 'likes', 'settings']
      : ['create', 'articles', 'users', 'likes']
    if (!allowedTabs.includes(tab)) setTab(allowedTabs[0])
  }, [canManageAllArticles, tab])

  useEffect(() => {
    const path = tab === 'dashboard' ? '/admin' : tab === 'create' ? '/admin/create' : tab === 'articles' ? '/admin/blog' : tab === 'categories' ? '/admin/categories' : tab === 'users' ? '/admin/users' : tab === 'likes' ? '/admin/likes' : '/admin/settings'
    if (window.location.pathname !== path) window.history.replaceState({}, '', path)
  }, [tab])

  return (
    <main className="admin-page">
      <div className="admin-noise" aria-hidden />
      <AdminSidebar tab={tab} role={role} onChange={setTab} />
      <section className="admin-main">
        <AdminTopbar tab={tab} />
        {notice && <div className="admin-notice">{notice}</div>}

        {tab === 'dashboard' && canManageAllArticles && <DashboardView articles={articles} onJump={setTab} />}
        {tab === 'create' && <CreateArticleView userID={userID} token={token} onCreated={() => { setTab('articles'); window.location.reload() }} />}
        {tab === 'articles' && (
          <ArticlesView
            articles={articles}
            onArticlesChange={setArticles}
            onDelete={removeArticle}
            canManageAll={canManageAllArticles}
            userID={userID}
            token={token}
          />
        )}
        {tab === 'categories' && (
          <CategoriesView
            types={types}
            selected={selectedType}
            categories={children}
            onSelect={loadChildren}
            onAddType={addType}
            onDeleteType={deleteType}
            onAddCategory={addCategory}
            onDeleteCategory={deleteCategory}
          />
        )}
        {tab === 'users' && <UsersView />}
        {tab === 'likes' && <LikesView />}
        {tab === 'settings' && <SettingsView />}
      </section>
    </main>
  )
}
