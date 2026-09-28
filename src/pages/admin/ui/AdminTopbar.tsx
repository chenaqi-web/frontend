import { useEffect, useState } from 'react'
import { CURRENT_USER_KEY } from '@/shared/config/auth'
import { navigate } from '@/shared/hooks/usePathname'
import { TAB_TITLES, type AdminTab } from '@/pages/admin/menu'
import { resolveStorageUrl } from '@/shared/lib/storage'

type TopbarUser = { username?: string; role?: string; avatar?: string }

function readCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) ?? '{}') as TopbarUser
  } catch {
    return {} as TopbarUser
  }
}

export default function AdminTopbar({ tab }: { tab: AdminTab }) {
  const [currentUser, setCurrentUser] = useState<TopbarUser>(readCurrentUser)
  const logout = () => { localStorage.removeItem('renai_access_token'); localStorage.removeItem(CURRENT_USER_KEY); navigate('/login') }
  const avatar = resolveStorageUrl(currentUser.avatar ?? '')

  useEffect(() => {
    const updateUser = () => setCurrentUser(readCurrentUser())
    window.addEventListener('renai:user-updated', updateUser)
    return () => window.removeEventListener('renai:user-updated', updateUser)
  }, [])

  return <header className="admin-top"><div className="admin-top-title"><span className="crumb">管理后台 <b>/</b> {TAB_TITLES[tab]}</span><h1>{TAB_TITLES[tab]}</h1></div><div className="admin-user"><div className="admin-avatar">{avatar ? <img src={avatar} alt="用户头像" /> : (currentUser.username || 'U').slice(0, 1).toUpperCase()}</div><div className="admin-user-name"><b>{currentUser.username || '管理员'}</b><small>{currentUser.role === 'admin' ? '超级管理员' : '社团成员'}</small></div><button type="button" className="admin-return" onClick={() => navigate('/')}>前台首页</button><button type="button" className="admin-logout" onClick={logout}>退出登录</button></div></header>
}
