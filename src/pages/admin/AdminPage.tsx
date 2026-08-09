import { useState } from 'react'
import { clearAccessToken } from '@/api/http'
import { navigate } from '@/hooks/usePathname'
import './AdminPage.css'

export default function AdminPage() {
  const [notice, setNotice] = useState('')
  const logout = () => {
    clearAccessToken()
    localStorage.removeItem('renai_current_user')
    setNotice('已退出登录')
    window.setTimeout(() => navigate('/login'), 300)
  }
  return <main className="admin-page"><section className="admin-main"><h1>管理后台</h1><p>后台功能正在整理中。</p><button type="button" onClick={logout}>退出登录</button>{notice && <p role="status">{notice}</p>}</section></main>
}
