import { useEffect, useState } from 'react'
import { clearAccessToken } from '@/shared/api/http'
import { navigate, usePathname } from '@/shared/hooks/usePathname'
import AdminSidebar from '@/pages/admin/ui/AdminSidebar'
import AdminTopbar from '@/pages/admin/ui/AdminTopbar'
import CategoriesView from '@/pages/admin/categories/CategoriesView'
import CreateArticleView from '@/pages/admin/create/CreateArticleView'
import ArticlesView from '@/pages/admin/articles/ArticlesView'
import ArticleManagementView from '@/pages/admin/articles/ArticleManagementView'
import LikesView from '@/pages/admin/likes/LikesView'
import ProfileView from '@/pages/admin/profile/ProfileView'
import SettingsView from '@/pages/admin/settings/SettingsView'
import KnowledgeView from '@/pages/admin/knowledge/KnowledgeView'
import UsersView from '@/pages/admin/users/UsersView'
import Dashboard from '@/pages/admin/Dashboard'
import { TAB_PATHS, TAB_TITLES, type AdminTab } from '@/pages/admin/menu'
import './AdminPage.css'

const tabFromPath = (path: string) => (Object.keys(TAB_PATHS).find((key) => TAB_PATHS[key as AdminTab] === path) ?? 'profile') as AdminTab

export default function AdminPage() {
  const path = usePathname()
  const [tab, setTab] = useState<AdminTab>(() => tabFromPath(path))
  const currentUser = JSON.parse(localStorage.getItem('renai_current_user') ?? '{}') as { role?: string }

  useEffect(() => setTab(tabFromPath(path)), [path])

  const logout = () => {
    clearAccessToken()
    localStorage.removeItem('renai_current_user')
    navigate('/login')
  }

  const changeTab = (nextTab: AdminTab) => {
    setTab(nextTab)
    navigate(TAB_PATHS[nextTab])
  }

  return (
    <main className="admin-page">
      <AdminSidebar tab={tab} role={currentUser.role ?? 'user'} onChange={changeTab} />
      <section className="admin-main">
        <AdminTopbar tab={tab} />
        <div className="admin-content">
          {tab === 'dashboard'
            ? <Dashboard />
            : tab === 'categories'
              ? <CategoriesView />
			: tab === 'articles'
			  ? <ArticleManagementView />
              : tab === 'create'
                ? <CreateArticleView />
                : tab === 'myArticles'
                  ? <ArticlesView />
                  : tab === 'likes'
                    ? <LikesView />
                    : tab === 'profile'
                      ? <ProfileView />
                      : tab === 'settings'
                        ? <SettingsView />
                        : tab === 'knowledge'
                          ? <KnowledgeView />
                          : tab === 'users'
                            ? <UsersView />
                      : <section className="admin-card"><div className="admin-card-head"><div><span className="eyebrow">COMING SOON</span><h2>{TAB_TITLES[tab]}</h2><p>这个工作区正在准备中，后续会接入完整的内容与知识库管理能力。</p></div><button className="primary-button" type="button" onClick={logout}>退出当前账号</button></div></section>}
        </div>
      </section>
    </main>
  )
}
