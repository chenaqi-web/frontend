import type { ReactNode } from 'react'
import AppLink from '@/components/common/AppLink'
import { routes } from '@/router/routes'

export default function SiteLayout({ children, pathname }: { children: ReactNode; pathname: string }) {
  const loggedIn = Boolean(localStorage.getItem('renai_access_token'))
  return <div className="site-shell"><header className="site-header"><AppLink className="brand" to="/"><strong>Renai</strong><small>TEAM</small></AppLink><nav>{routes.filter((item) => item.showInNav).map((item) => <AppLink key={item.path} className={pathname === item.path ? 'active' : ''} to={item.path}>{item.label}</AppLink>)}</nav><div className="auth-actions">{loggedIn ? <AppLink to="/admin">管理后台</AppLink> : <><AppLink to="/login">登录</AppLink><AppLink to="/register">注册</AppLink></>}</div></header>{children}<footer className="site-footer"><b>RenaiTeam</b><span>Made with care.</span></footer></div>
}
