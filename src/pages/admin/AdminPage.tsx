import { useEffect, useState } from 'react'
import { clearAccessToken } from '@/api/http'
import { navigate, usePathname } from '@/hooks/usePathname'
import AdminSidebar from '@/pages/admin/components/AdminSidebar'
import AdminTopbar from '@/pages/admin/components/AdminTopbar'
import CategoriesView from '@/pages/admin/categories/CategoriesView'
import CreateArticleView from '@/pages/admin/create/CreateArticleView'
import ArticlesView from '@/pages/admin/articles/ArticlesView'
import ArticleManagementView from '@/pages/admin/articles/ArticleManagementView'
import LikesView from '@/pages/admin/likes/LikesView'
import ProfileView from '@/pages/admin/profile/ProfileView'
import SettingsView from '@/pages/admin/settings/SettingsView'
import KnowledgeView from '@/pages/admin/knowledge/KnowledgeView'
import UsersView from '@/pages/admin/users/UsersView'
import { TAB_PATHS, TAB_TITLES, type AdminTab } from '@/pages/admin/types'
import './AdminPage.css'

const activities = [
  { title: '社团开放日：和新成员见面', type: '文章发布', time: '今天 09:42', color: 'coral' },
  { title: '「摄影」分类新增 3 篇文章', type: '内容更新', time: '昨天 16:28', color: 'blue' },
  { title: '林默赞了你的文章', type: '互动消息', time: '昨天 11:06', color: 'green' },
  { title: '知识库空间已创建', type: '系统动态', time: '周一 18:20', color: 'purple' },
]

function Dashboard() {
  return <div className="dashboard">
    <section className="welcome-panel"><div><span className="eyebrow">周三，2026 年 8 月 10 日</span><h2>早上好，开始整理今天的内容吧。</h2><p>这里是 Renai 社团的内容工作台，记录灵感、发布文章，也和成员保持连接。</p></div><div className="welcome-orbit"><span>R</span></div></section>
    <div className="stat-grid"><div className="stat-card"><span>已发布文章</span><strong>128</strong><small className="positive">↑ 12.5% <em>较上月</em></small></div><div className="stat-card"><span>本月阅读量</span><strong>24,680</strong><small className="positive">↑ 8.2% <em>较上月</em></small></div><div className="stat-card"><span>社团成员</span><strong>1,286</strong><small className="neutral">保持稳定</small></div><div className="stat-card"><span>待处理互动</span><strong>16</strong><small className="warning">需要你的关注</small></div></div>
    <div className="dashboard-columns"><section className="content-panel"><div className="panel-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h3>最近动态</h3></div><button className="text-action" type="button">查看全部 →</button></div><div className="activity-list">{activities.map((item) => <div className="activity-item" key={item.title}><span className={`activity-mark ${item.color}`} /><div><b>{item.title}</b><small>{item.type} · {item.time}</small></div><span className="activity-more">···</span></div>)}</div></section><section className="content-panel quick-panel"><div className="panel-heading"><div><span className="eyebrow">QUICK ACTIONS</span><h3>快捷操作</h3></div></div><button className="quick-action primary" type="button"><span>✎</span><div><b>写一篇新文章</b><small>分享社团的鲜活内容</small></div><i>→</i></button><button className="quick-action" type="button"><span>☷</span><div><b>整理内容分类</b><small>让文章更容易被发现</small></div><i>→</i></button><button className="quick-action" type="button"><span>◌</span><div><b>进入知识库</b><small>即将上线的内容空间</small></div><i>→</i></button></section></div>
  </div>
}

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
