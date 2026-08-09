import { navigate } from '@/hooks/usePathname'
import { TAB_TITLES, type AdminTab } from '@/pages/admin/types'

interface Props {
  tab: AdminTab
}

export default function AdminTopbar({ tab }: Props) {
  const currentUser = JSON.parse(localStorage.getItem('renai_current_user') ?? '{}') as { username?: string }
  const username = currentUser.username || '用户'

  const logout = () => {
    localStorage.removeItem('renai_access_token')
    localStorage.removeItem('renai_current_user')
    navigate('/login')
  }

  return (
    <header className="admin-top">
      <div>
        <span className="crumb">管理后台 / {TAB_TITLES[tab]}</span>
        <h1>{TAB_TITLES[tab]}</h1>
      </div>
      <div className="admin-user">
        <div className="admin-user-name">
          <b>{username}</b>
        </div>
        <button type="button" className="admin-logout" onClick={logout}>
          退出登�?
        </button>
      </div>
    </header>
  )
}