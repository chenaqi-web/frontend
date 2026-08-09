export type AdminTab = 'dashboard' | 'create' | 'articles' | 'categories' | 'users' | 'likes' | 'settings'
export interface AdminArticle { id: string | number; title: string; authorName?: string; categoryID?: number; viewCount?: number; createdAt?: number }
export const TAB_PATHS: Record<AdminTab, string> = { dashboard: '/admin', create: '/admin/create', articles: '/admin/blog', categories: '/admin/categories', users: '/admin/users', likes: '/admin/likes', settings: '/admin/settings' }
export const TAB_TITLES: Record<AdminTab, string> = { dashboard: '控制台', create: '创建文章', articles: '文章管理', categories: '分类管理', users: '用户管理', likes: '点赞记录', settings: '系统设置' }
export const ADMIN_MENU = (Object.keys(TAB_PATHS) as AdminTab[]).map((id) => ({ id, label: TAB_TITLES[id], roles: undefined as string[] | undefined }))
