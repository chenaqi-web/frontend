import { useEffect, useState, type ReactNode } from 'react'
import AppLink from '@/components/common/AppLink'
import { routes } from '@/router/routes'
import { resolveStorageUrl } from '@/utils/storage'

type CurrentUser = { username?: string; avatar?: string }
type IconName = 'home' | 'diary' | 'blog' | 'assistant' | 'about'

function NavIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 21v-6h6v6" /></>,
    diary: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h5" /></>,
    blog: <><path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /><path d="M7 9h10M7 13h7" /></>,
    assistant: <><path d="M12 3a7 7 0 0 0-7 7v3a3 3 0 0 0 3 3h1v-5H6" /><path d="M12 3a7 7 0 0 1 7 7v3a3 3 0 0 1-3 3h-1v-5h3" /><path d="M10 20h4" /></>,
    about: <><circle cx="12" cy="8" r="3" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  }
  return <svg className="site-nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

const navIcons: Record<string, IconName> = { '/': 'home', '/diary': 'diary', '/blog': 'blog', '/assistant': 'assistant', '/about': 'about' }

export default function SiteLayout({ children, pathname }: { children: ReactNode; pathname: string }) {
  const isHome = pathname === '/'
  const hideFooter = pathname === '/assistant'
  const [hasScrolled, setHasScrolled] = useState(false)
  const currentUser = JSON.parse(localStorage.getItem('renai_current_user') ?? '{}') as CurrentUser
  const loggedIn = Boolean(localStorage.getItem('renai_access_token'))
  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`))
  const avatar = resolveStorageUrl(currentUser.avatar ?? '')
  const initial = (currentUser.username || 'U').slice(0, 1).toUpperCase()
  const logout = () => { localStorage.removeItem('renai_access_token'); localStorage.removeItem('renai_current_user'); window.location.href = '/login' }

  useEffect(() => {
    if (!isHome) {
      setHasScrolled(false)
      return
    }
    const updateHeader = () => setHasScrolled(window.scrollY > 32)
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    return () => window.removeEventListener('scroll', updateHeader)
  }, [isHome])

  return <div className={`site-shell${isHome ? ' site-shell-home' : ''}`}>
    <header className={`site-header${isHome ? ' site-header-home' : ''}${hasScrolled ? ' is-scrolled' : ''}`}>
      <AppLink className="brand" to="/"><strong>Renai</strong><small>TEAM</small></AppLink>
      <nav>{routes.filter((item) => item.showInNav).map((item) => <AppLink key={item.path} className={isActive(item.path) ? 'active' : ''} to={item.path}><NavIcon name={navIcons[item.path] ?? 'home'} /><span>{item.label}</span></AppLink>)}</nav>
      <div className="auth-actions">{loggedIn ? <div className="nav-account"><AppLink className="nav-avatar" to="/admin" aria-label="进入管理后台">{avatar ? <img src={avatar} alt="" /> : initial}</AppLink><div className="nav-account-popover" role="menu"><div className="nav-account-identity"><strong>{currentUser.username || 'Renai 用户'}</strong><span>个人账户</span></div><div className="nav-account-actions"><AppLink role="menuitem" to="/admin/profile">个人中心 <b aria-hidden="true">→</b></AppLink><AppLink role="menuitem" to="/admin/my-articles">文章管理 <b aria-hidden="true">→</b></AppLink><AppLink role="menuitem" to="/admin">管理后台 <b aria-hidden="true">→</b></AppLink></div><button role="menuitem" type="button" onClick={logout}>退出登录 <b aria-hidden="true">→</b></button></div></div> : <><AppLink to="/login">登录</AppLink><AppLink to="/register">注册</AppLink></>}</div>
    </header>
    {children}
    {!hideFooter && <footer className="site-footer">
      <div className="site-footer-brand"><b>RenaiTeam</b><p>一个记录社团生活、创作和灵感的交流空间。<br />在这里，分享值得被认真看见。</p><a className="site-footer-record" href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">浙ICP备2025156531号-1</a></div>
      <nav className="site-footer-links" aria-label="快速导航"><strong>快速导航</strong><AppLink to="/">首页</AppLink><AppLink to="/blog">知识专栏</AppLink><AppLink to="/diary">生活小记</AppLink><AppLink to="/about">关于我们</AppLink></nav>
      <div className="site-footer-support"><strong>支持</strong><AppLink to="/assistant">站内助手</AppLink></div>
    </footer>}
  </div>
}
