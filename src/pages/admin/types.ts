export type AdminTab =
  | 'dashboard'
  | 'create'
  | 'articles'
  | 'categories'
  | 'users'
  | 'likes'
  | 'settings'

export interface AdminArticle {
  id: string
  title: string
  summary?: string
  coverImage?: string
  authorName?: string
  categoryID?: number
  viewCount?: number
  likeCount?: number
  commentCount?: number
  createdAt?: number
  isTop?: boolean
}

export const ADMIN_MENU: { id: AdminTab; label: string; roles?: string[] }[] = [
  { id: 'dashboard', label: '工作台', roles: ['admin'] },
  { id: 'create', label: '创作内容' },
  { id: 'articles', label: '文章管理' },
  { id: 'categories', label: '分类管理', roles: ['admin'] },
  { id: 'users', label: '用户详情' },
  { id: 'likes', label: '点赞列表' },
  { id: 'settings', label: '系统设置', roles: ['admin'] },
]

export const TAB_TITLES: Record<AdminTab, string> = {
  dashboard: '工作台',
  create: '创作内容',
  articles: '文章管理',
  categories: '分类管理',
  users: '用户详情',
  likes: '点赞列表',
  settings: '系统设置',
}

export const TAB_PATHS: Record<AdminTab, string> = {
  dashboard: '/admin',
  create: '/admin/create',
  articles: '/admin/blog',
  categories: '/admin/categories',
  users: '/admin/users',
  likes: '/admin/likes',
  settings: '/admin/settings',
}
