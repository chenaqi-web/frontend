import type { ReactNode } from 'react'
import AboutPage from '@/pages/about/AboutPage'
import BlogPage from '@/pages/blog/BlogPage'
import DiaryPage from '@/pages/diary/DiaryPage'
import HomePage from '@/pages/home/HomePage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import AssistantPage from '@/pages/assistant/AssistantPage'
import AdminPage from '@/pages/admin/AdminPage'

export interface AppRoute {
  path: string
  label: string
  element: ReactNode
  showInNav?: boolean
}

export const routes: AppRoute[] = [
  { path: '/', label: '首页', element: <HomePage />, showInNav: true },
  { path: '/diary', label: '生活小记', element: <DiaryPage />, showInNav: true },
  { path: '/blog', label: '社团博客', element: <BlogPage />, showInNav: true },
  { path: '/assistant', label: '社团助手', element: <AssistantPage />, showInNav: true },
  { path: '/about', label: '关于我们', element: <AboutPage />, showInNav: true },
  { path: '/login', label: '登录', element: <LoginPage /> },
  { path: '/register', label: '注册', element: <RegisterPage /> },
  { path: '/admin', label: '后台管理', element: <AdminPage /> },
]
