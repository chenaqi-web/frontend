import { useMemo, useState } from 'react'
import { useArticles } from '@/pages/admin/articles/ArticlesView'
import { useCategories } from '@/pages/admin/categories/CategoriesView'
import type { AdminTab } from '@/pages/admin/types'
import AdminSidebar from '@/pages/admin/components/AdminSidebar'
import AdminTopbar from '@/pages/admin/components/AdminTopbar'
import DashboardView from '@/pages/admin/dashboard/DashboardView'
import ArticlesView from '@/pages/admin/articles/ArticlesView'
import CategoriesView from '@/pages/admin/categories/CategoriesView'
import UsersView from '@/pages/admin/users/UsersView'
import LikesView from '@/pages/admin/likes/LikesView'
import SettingsView from '@/pages/admin/settings/SettingsView'
import './AdminPage.css'

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('dashboard')
  const token = localStorage.getItem('renai_access_token') ?? ''

  const articles = useArticles(token)
  const categories = useCategories(token)

  const notice = useMemo(() => articles.notice || categories.notice, [articles.notice, categories.notice])

  return (
    <main className="admin-page">
      <AdminSidebar tab={tab} onChange={setTab} />
      <section className="admin-main">
        <AdminTopbar tab={tab} />
        {notice && <div className="admin-notice">{notice}</div>}

        {tab === 'dashboard' && <DashboardView articles={articles.articles} onJump={setTab} />}
        {tab === 'articles' && <ArticlesView articles={articles.articles} onDelete={articles.removeArticle} />}
        {tab === 'categories' && (
          <CategoriesView
            types={categories.types}
            selected={categories.selectedType}
            categories={categories.children}
            onSelect={categories.loadChildren}
            onAddType={categories.addType}
            onDeleteType={categories.deleteType}
            onAddCategory={categories.addCategory}
            onDeleteCategory={categories.deleteCategory}
          />
        )}
        {tab === 'users' && <UsersView />}
        {tab === 'likes' && <LikesView />}
        {tab === 'settings' && <SettingsView />}
      </section>
    </main>
  )
}
