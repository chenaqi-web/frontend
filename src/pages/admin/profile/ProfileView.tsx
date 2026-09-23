import { useEffect, useRef, useState, type FormEvent } from 'react'
import { storageApi } from '@/shared/api/v1/storage'
import { userApi, type UpdateProfilePayload } from '@/shared/api/v1/user'
import type { CurrentUser } from '@/shared/types/user'
import { logRequestError } from '@/shared/lib/request-error'
import './ProfileView.css'

const emptyProfile: CurrentUser = { id: 0, username: '', email: '', phone: '', avatar: '', sex: '', age: 0, role: 'user', status: 'approved' }
const sexOptions = [{ value: '', label: '未设置' }, { value: 'male', label: '男' }, { value: 'female', label: '女' }] as const
const sexLabel = (value: string) => sexOptions.find((item) => item.value === value)?.label ?? '未设置'
const saveCurrentUser = (user: CurrentUser) => localStorage.setItem('renai_current_user', JSON.stringify(user))

export default function ProfileView() {
  const [profile, setProfile] = useState<CurrentUser>(() => ({ ...emptyProfile, ...JSON.parse(localStorage.getItem('renai_current_user') ?? '{}') }))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [sexOpen, setSexOpen] = useState(false)
  const sexMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => { void userApi.getProfile().then((user) => { setProfile(user); saveCurrentUser(user) }).catch((error) => { logRequestError('加载个人资料失败', error); setNotice({ message: '个人资料加载失败，当前显示本地信息。', type: 'error' }) }).finally(() => setLoading(false)) }, [])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(null), 5000); return () => window.clearTimeout(timer) }, [notice])
  useEffect(() => { const closeMenu = (event: MouseEvent) => { if (!sexMenuRef.current?.contains(event.target as Node)) setSexOpen(false) }; document.addEventListener('mousedown', closeMenu); return () => document.removeEventListener('mousedown', closeMenu) }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload: UpdateProfilePayload = { username: profile.username.trim(), phone: profile.phone.trim(), sex: profile.sex === 'male' || profile.sex === 'female' ? profile.sex : '', age: Number(profile.age) || 0 }
    if (payload.username.length < 2) { setNotice({ message: '用户名至少需要 2 个字符。', type: 'error' }); return }
    setSaving(true)
    try { const user = await userApi.updateProfile(payload); setProfile(user); saveCurrentUser(user); setNotice({ message: '个人资料已保存。', type: 'success' }) } catch (error) { logRequestError('保存个人资料失败', error); setNotice({ message: '个人资料保存失败，请稍后重试。', type: 'error' }) } finally { setSaving(false) }
  }

  const uploadAvatar = async (file?: File) => {
    if (!file) return
    setUploading(true)
    try { await storageApi.uploadAvatar(file); const user = await userApi.getProfile(); setProfile(user); saveCurrentUser(user); setNotice({ message: '头像已更新。', type: 'success' }) } catch (error) { logRequestError('更新头像失败', error); setNotice({ message: '头像更新失败，请稍后重试。', type: 'error' }) } finally { setUploading(false) }
  }

  return <><section className="profile-workspace"><aside className="profile-summary"><div className="profile-avatar">{profile.avatar ? <img src={profile.avatar} alt="当前头像" /> : <span>{(profile.username || 'U').slice(0, 1).toUpperCase()}</span>}</div><h2>{profile.username || '未设置用户名'}</h2><p>{profile.email || '未绑定邮箱'}</p><span className="profile-role">{profile.role === 'admin' ? '管理员' : '普通用户'}</span><label className="avatar-change"><input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif" disabled={uploading} onChange={(event) => void uploadAvatar(event.target.files?.[0])} />{uploading ? '正在上传...' : '更换头像'}</label></aside><form className="profile-editor" onSubmit={(event) => void submit(event)}><header><span className="eyebrow">ACCOUNT SETTINGS</span><h1>编辑资料</h1><p>修改你的个人信息。</p></header><div className="profile-fields"><label>昵称<input value={profile.username} minLength={2} maxLength={50} disabled={loading || saving} onChange={(event) => setProfile((current) => ({ ...current, username: event.target.value }))} /></label><label>邮箱<input value={profile.email} disabled /></label><label>手机<input value={profile.phone} maxLength={20} disabled={loading || saving} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} /></label><label className="profile-select-label">性别<div className="profile-select" ref={sexMenuRef}><button type="button" className="profile-select-trigger" aria-haspopup="listbox" aria-expanded={sexOpen} disabled={loading || saving} onClick={() => setSexOpen((open) => !open)}><span>{sexLabel(profile.sex)}</span><i aria-hidden="true" /></button>{sexOpen && <div className="profile-select-menu" role="listbox" aria-label="性别">{sexOptions.map((option) => <button type="button" role="option" aria-selected={profile.sex === option.value} className={profile.sex === option.value ? 'selected' : ''} key={option.value || 'unset'} onClick={() => { setProfile((current) => ({ ...current, sex: option.value })); setSexOpen(false) }}>{option.label}</button>)}</div>}</div></label><label>年龄<input value={profile.age || ''} min={0} max={150} type="number" disabled={loading || saving} onChange={(event) => setProfile((current) => ({ ...current, age: Number(event.target.value) || 0 }))} /></label></div><footer><button className="profile-save" type="submit" disabled={loading || saving}>{saving ? '保存中...' : '保存资料'}</button></footer></form></section>{notice && <div className={`profile-toast ${notice.type}`} role="status"><span>{notice.type === 'success' ? '✓' : '!'}</span>{notice.message}<button type="button" onClick={() => setNotice(null)} aria-label="关闭提示">×</button></div>}</>
}
