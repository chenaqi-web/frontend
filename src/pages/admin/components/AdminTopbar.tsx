import { navigate } from '@/hooks/usePathname'
import { TAB_TITLES, type AdminTab } from '@/pages/admin/types'

export default function AdminTopbar({ tab }: { tab: AdminTab }) {
  const currentUser = JSON.parse(localStorage.getItem('renai_current_user') ?? '{}') as { username?: string; role?: string }
  const logout = () => { localStorage.removeItem('renai_access_token'); localStorage.removeItem('renai_current_user'); navigate('/login') }
  return <header className="admin-top"><div className="admin-top-title"><span className="crumb">管理后台 <b>/</b> {TAB_TITLES[tab]}</span><h1>{TAB_TITLES[tab]}</h1></div><div className="admin-user"><button className="top-icon" type="button" aria-label="通知">♢<i /></button><div className="admin-avatar">{(currentUser.username || 'U').slice(0, 1).toUpperCase()}</div><div className="admin-user-name"><b>{currentUser.username || '管理员'}</b><small>{currentUser.role === 'admin' ? '超级管理员' : '社团成员'}</small></div><button type="button" className="admin-logout" onClick={logout}>退出登录</button></div></header>
}
