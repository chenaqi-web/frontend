export type AdminTab =
  | 'dashboard'
  | 'articles'
  | 'categories'
  | 'users'
  | 'likes'
  | 'settings'

export interface AdminArticle {
  id: string
  title: string
  authorName?: string
  categoryID?: number
  viewCount?: number
  createdAt?: number
  isTop?: boolean
}

export const ADMIN_MENU: { id: AdminTab; label: string; icon: string }[] = [
  { id: 'dashboard', label: '工作台', icon: '◐' },
  { id: 'articles', label: '文章管理', icon: '▤' },
  { id: 'categories', label: '分类管理', icon: '▦' },
  { id: 'users', label: '用户详情', icon: '◔' },
  { id: 'likes', label: '点赞列表', icon: '♥' },
  { id: 'settings', label: '系统设置', icon: '⚙' },
]

export const TAB_TITLES: Record<AdminTab, string> = {
  dashboard: '工作台',
  articles: '文章管理',
  categories: '分类管理',
  users: '用户详情',
  likes: '点赞列表',
  settings: '系统设置',
}
