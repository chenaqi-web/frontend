import { useState } from 'react'
import { storageApi } from '@/api/v1/storage'
import { logRequestError } from '@/utils/request-error'
import './ProfileView.css'

export default function ProfileView() {
  const currentUser = JSON.parse(localStorage.getItem('renai_current_user') ?? '{}') as { username?: string; role?: string; avatar?: string }
  const [avatar, setAvatar] = useState(currentUser.avatar ?? '')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const uploadAvatar = async (file?: File) => { if (!file) return; try { setBusy(true); const result = await storageApi.uploadAvatar(file); setAvatar(`${result.url}?v=${Date.now()}`); localStorage.setItem('renai_current_user', JSON.stringify({ ...currentUser, avatar: result.url })); setNotice('头像已更新') } catch (error) { logRequestError('上传头像失败', error); setNotice('头像上传失败，请稍后重试') } finally { setBusy(false) } }
  return <section className="profile-view"><div className="profile-header"><span>MEMBER PROFILE</span><h2>个人中心</h2><p>管理你的公开身份和个人头像。</p></div><div className="profile-content"><div className="avatar-setting"><div className="avatar-preview">{avatar ? <img src={avatar} alt="当前头像" /> : <span>{(currentUser.username || 'U').slice(0, 1).toUpperCase()}</span>}</div><div><h3>个人头像</h3><p>支持 JPG、PNG、GIF、WebP 和 AVIF。</p><label className="avatar-upload"><input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif" disabled={busy} onChange={(event) => void uploadAvatar(event.target.files?.[0])} />{busy ? '正在上传...' : '更换头像'}</label>{notice && <small role="status">{notice}</small>}</div></div><dl><div><dt>用户名</dt><dd>{currentUser.username || '未设置'}</dd></div><div><dt>成员身份</dt><dd>{currentUser.role === 'admin' ? '超级管理员' : '社团成员'}</dd></div></dl></div></section>
}
