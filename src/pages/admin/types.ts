export type AdminTab = 'profile' | 'create' | 'myArticles' | 'likes' | 'dashboard' | 'articles' | 'categories' | 'users' | 'settings'

export interface AdminArticle { id: string | number; title: string; authorName?: string; categoryID?: number; viewCount?: number; createdAt?: number }

export const TAB_PATHS: Record<AdminTab, string> = { profile: '/admin/profile', create: '/admin/create', myArticles: '/admin/my-articles', likes: '/admin/likes', dashboard: '/admin', articles: '/admin/blog', categories: '/admin/categories', users: '/admin/users', settings: '/admin/settings' }
export const TAB_TITLES: Record<AdminTab, string> = { profile: '个人信息', create: '创建文章', myArticles: '我的文章', likes: '点赞列表', dashboard: '工作台', articles: '文章管理', categories: '分类管理', users: '用户管理', settings: '系统设置' }

export interface AdminMenuGroup { label: string; items: { id: AdminTab; label: string }[]; adminOnly?: boolean; collapsible?: boolean }
export const ADMIN_MENU: AdminMenuGroup[] = [
  { label: '工作台', items: [{ id: 'dashboard', label: '工作台' }] },
  { label: '内容创作', collapsible: true, items: [{ id: 'myArticles', label: '我的文章' }, { id: 'create', label: '创建文章' }] },
  { label: '互动反馈', items: [{ id: 'likes', label: '点赞列表' }] },
  { label: '系统管理', adminOnly: true, collapsible: true, items: [{ id: 'articles', label: '文章管理' }, { id: 'categories', label: '分类管理' }, { id: 'users', label: '用户管理' }, { id: 'settings', label: '系统设置' }] },
]
