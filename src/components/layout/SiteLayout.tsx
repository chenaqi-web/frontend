import type { ReactNode } from 'react'
import AppLink from '@/components/common/AppLink'
import { navigate } from '@/hooks/usePathname'
import { routes } from '@/router/routes'
import { resolveStorageUrl } from '@/utils/storage'

interface SiteLayoutProps {
  children: ReactNode
  pathname: string
}

export default function SiteLayout({ children, pathname }: SiteLayoutProps) {
  const currentUser = JSON.parse(localStorage.getItem('renai_current_user') ?? '{}') as { id?: number; username?: string; avatar?: string }
  const isLoggedIn = Boolean(localStorage.getItem('renai_access_token'))
  const avatar = resolveStorageUrl(currentUser.avatar ?? '')

  return (
    <div className="site-shell">
      <div className="paper-noise" aria-hidden="true" />
      <header className="site-header">
        <AppLink className="brand" to="/">
          <span aria-hidden="true">✦</span>
          <div>
            <strong>Renai</strong>
            <small>TEAM</small>
          </div>
        </AppLink>
        <nav>
          {routes.filter((route) => route.showInNav).map((route) => (
            <AppLink className={pathname === route.path ? 'active' : ''} key={route.path} to={route.path}>{route.label}</AppLink>
          ))}
        </nav>
        <div className="auth-actions">
          {isLoggedIn ? (
            <button type="button" className="site-user-avatar" title="进入管理后台" onClick={() => navigate('/admin')}>
              {avatar ? <img src={avatar} alt={currentUser.username ?? '用户头像'} /> : <span>{(currentUser.username ?? '用').slice(0, 1).toUpperCase()}</span>}
            </button>
          ) : (
            <><AppLink to="/login">登录</AppLink><AppLink className="signup" to="/register">加入我们</AppLink></>
          )}
        </div>
      </header>
      {children}
      <footer className="site-footer"><b>RenaiTeam</b><span>Made with crayons, candies & a little chaos.</span><i>© 2026</i></footer>
    </div>
  )
}
