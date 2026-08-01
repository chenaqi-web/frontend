import { navigate } from '@/hooks/usePathname'
import { TAB_TITLES, type AdminTab } from '@/pages/admin/types'

interface Props {
  tab: AdminTab
}

export default function AdminTopbar({ tab }: Props) {
  const logout = () => {
    localStorage.removeItem('renai_access_token')
    navigate('/login')
  }

  return (
    <header className="admin-top">
      <div>
        <span className="crumb">管理后台 / {TAB_TITLES[tab]}</span>
        <h1>{TAB_TITLES[tab]}</h1>
      </div>
      <div className="admin-user">
        <div>
          <b>站长小爱</b>
          <small>超级管理员</small>
        </div>
        <button type="button" className="admin-logout" onClick={logout}>
          退出登录
        </button>
      </div>
    </header>
  )
}
