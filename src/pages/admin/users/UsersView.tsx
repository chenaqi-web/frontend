import { useEffect, useState } from 'react'
import { userApi } from '@/api/v1/user'
import type { ManagedUser } from '@/types/user'
import { logRequestError } from '@/utils/request-error'
import './UsersView.css'

const statusLabel: Record<ManagedUser['status'], string> = { approved: '已通过', blocked: '已拉黑' }

export default function UsersView() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [keyword, setKeyword] = useState('')
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updatingID, setUpdatingID] = useState<number | null>(null)
  const [notice, setNotice] = useState('')

  const loadUsers = async (search = keyword) => {
    setLoading(true)
    try {
      const result = await userApi.list(search)
      if (!Array.isArray(result?.users)) {
        throw new Error('用户列表响应格式不正确')
      }
      setUsers(result.users)
      setTotal(Number.isFinite(result.total) ? result.total : result.users.length)
      setNotice('')
    } catch (error) {
      logRequestError('加载用户列表失败', error)
      setNotice('用户列表加载失败，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadUsers('') }, [])

  const updateStatus = async (user: ManagedUser, status: ManagedUser['status']) => {
    if (user.status === status) return
    const action = status === 'blocked' ? '拉黑' : '恢复'
    if (!window.confirm(`确认${action}用户“${user.username}”吗？`)) return
    setUpdatingID(user.id)
    try {
      const updated = await userApi.updateStatus(user.id, status)
      setUsers((current) => current.map((item) => item.id === user.id ? updated : item))
      setNotice(status === 'blocked' ? '已拉黑该用户，其现有登录凭证已立即失效。' : '已恢复该用户的登录权限。')
    } catch (error) {
      logRequestError('更新用户状态失败', error)
      setNotice('状态更新失败，请稍后重试。')
    } finally {
      setUpdatingID(null)
    }
  }

  return <section className="users-view">
    <header className="users-header"><div><span className="eyebrow">USER MANAGEMENT</span><h2>用户管理</h2><p>查看账号状态，并管理成员的访问权限。</p></div><strong>{total} 位用户</strong></header>
    <form className="users-filter" onSubmit={(event) => { event.preventDefault(); void loadUsers() }}><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索用户名或邮箱" aria-label="搜索用户名或邮箱" /><button className="primary-button" type="submit" disabled={loading}>搜索</button></form>
    {notice && <p className="settings-notice" role="status">{notice}</p>}
    <div className="users-table-wrap"><table className="users-table"><thead><tr><th>用户</th><th>角色</th><th>状态</th><th>获赞</th><th>操作</th></tr></thead><tbody>{loading ? <tr><td colSpan={5} className="users-state">正在加载用户...</td></tr> : users.length === 0 ? <tr><td colSpan={5} className="users-state">未找到符合条件的用户。</td></tr> : users.map((user) => <tr key={user.id}>
      <td><div className="user-identity"><div className="user-avatar">{user.avatar ? <img src={user.avatar} alt="" /> : user.username.slice(0, 1).toUpperCase()}</div><div><strong>{user.username}</strong><small>{user.email || '未填写邮箱'}</small></div></div></td><td>{user.role === 'admin' ? '管理员' : '普通用户'}</td><td><span className={`user-status ${user.status}`}>{statusLabel[user.status]}</span></td><td>{user.receive_like_count}</td><td>{user.role === 'admin' ? <span className="user-protected">受保护</span> : <div className="user-actions"><button type="button" className="user-approve" disabled={updatingID === user.id || user.status === 'approved'} onClick={() => void updateStatus(user, 'approved')}>恢复</button><button type="button" className="user-block" disabled={updatingID === user.id || user.status === 'blocked'} onClick={() => void updateStatus(user, 'blocked')}>{updatingID === user.id ? '处理中...' : '拉黑'}</button></div>}</td>
    </tr>)}</tbody></table></div>
  </section>
}
