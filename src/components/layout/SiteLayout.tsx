import type { ReactNode } from 'react'
import AppLink from '@/components/common/AppLink'
import { routes } from '@/router/routes'

interface SiteLayoutProps {
  children: ReactNode
  pathname: string
}

export default function SiteLayout({ children, pathname }: SiteLayoutProps) {
  return (
    <div className="site-shell">
      <div className="paper-noise" aria-hidden="true" />
      <header className="site-header">
        <AppLink className="brand" to="/"><span>R</span> RenaiTeam!</AppLink>
        <nav>
          {routes.filter((route) => route.showInNav).map((route) => (
            <AppLink className={pathname === route.path ? 'active' : ''} key={route.path} to={route.path}>{route.label}</AppLink>
          ))}
        </nav>
        <div className="auth-actions"><AppLink to="/login">登录</AppLink><AppLink className="signup" to="/register">加入我们</AppLink></div>
      </header>
      {children}
      <footer className="site-footer"><b>RenaiTeam</b><span>Made with crayons, candies & a little chaos.</span><i>© 2026</i></footer>
    </div>
  )
}
