import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { storageApi } from '@/api/v1/storage'
import { userApi } from '@/api/v1/user'
import { CURRENT_USER_KEY } from '@/constants/auth'
import type { AuthUser } from '@/types/auth'
import type { UpdateProfileRequest, UserProfile } from '@/types/user'
import { logRequestError } from '@/utils/request-error'
import { resolveStorageUrl } from '@/utils/storage'
import './ProfileView.css'

type ProfileForm = UpdateProfileRequest

const emptyForm: ProfileForm = { username: '', phone: '', sex: '', age: 0 }

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) ?? '{}') as Partial<AuthUser>
  } catch {
    return {} as Partial<AuthUser>
  }
}

function toForm(profile: Pick<UserProfile, 'username' | 'phone' | 'sex' | 'age'>): ProfileForm {
  return {
    username: profile.username ?? '',
    phone: profile.phone ?? '',
    sex: profile.sex === 'male' || profile.sex === 'female' ? profile.sex : '',
    age: profile.age ?? 0,
  }
}

function syncStoredUser(profile: UserProfile) {
  const current = readStoredUser()
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...current, ...profile }))
  window.dispatchEvent(new CustomEvent('renai:user-updated'))
}

export default function ProfileView() {
  const storedUser = readStoredUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [form, setForm] = useState<ProfileForm>(() => ({
    ...emptyForm,
    username: storedUser.username ?? '',
    phone: storedUser.phone ?? '',
    sex: storedUser.sex === 'male' || storedUser.sex === 'female' ? storedUser.sex : '',
    age: storedUser.age ?? 0,
  }))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState('')
  const [noticeType, setNoticeType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    let active = true
    const loadProfile = async () => {
      try {
        const result = await userApi.profile()
        if (!active) return
        setProfile(result)
        setForm(toForm(result))
        syncStoredUser(result)
      } catch (error) {
        if (!active) return
        logRequestError('读取个人资料失败', error)
        setNoticeType('error')
        setNotice('资料读取失败，请确认 Gateway 和 Core 已启动。')
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadProfile()
    return () => { active = false }
  }, [])

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: name === 'age' ? Math.max(0, Number(value) || 0) : value,
    }))
  }

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const username = form.username.trim()
    if (username.length < 2) {
      setNoticeType('error')
      setNotice('用户名至少需要 2 个字符。')
      return
    }
    try {
      setSaving(true)
      setNotice('')
      const result = await userApi.updateProfile({
        username,
        phone: form.phone.trim(),
        sex: form.sex,
        age: form.age,
      })
      setProfile(result)
      setForm(toForm(result))
      syncStoredUser(result)
      setNoticeType('success')
      setNotice('个人资料已保存。')
    } catch (error) {
      logRequestError('更新个人资料失败', error)
      setNoticeType('error')
      setNotice(error instanceof Error ? error.message : '保存失败，请稍后重试。')
    } finally {
      setSaving(false)
    }
  }

  const uploadAvatar = async (file?: File) => {
    if (!file) return
    try {
      setUploading(true)
      setNotice('')
      const result = await storageApi.uploadAvatar(file)
      const nextProfile = profile
        ? { ...profile, avatar: result.url }
        : { ...storedUser, ...form, id: storedUser.id ?? 0, email: storedUser.email ?? '', avatar: result.url, role: storedUser.role ?? '', status: storedUser.status ?? '', like_count: 0, receive_like_count: 0 } as UserProfile
      setProfile(nextProfile)
      syncStoredUser(nextProfile)
      setNoticeType('success')
      setNotice('头像已更新。')
    } catch (error) {
      logRequestError('上传头像失败', error)
      setNoticeType('error')
      setNotice(error instanceof Error ? error.message : '头像上传失败，请稍后重试。')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const avatar = resolveStorageUrl(profile?.avatar ?? storedUser.avatar ?? '')
  const username = (profile?.username ?? form.username) || 'U'
  const role = profile?.role ?? storedUser.role ?? 'user'
  const email = profile?.email ?? storedUser.email ?? ''
  const status = profile?.status ?? storedUser.status ?? 'active'

  return (
    <section className="profile-view">
      <div className="profile-header">
        <span>MEMBER PROFILE</span>
        <h2>个人中心</h2>
        <p>维护公开资料和个人头像，邮箱与账号权限保持只读。</p>
      </div>

      <div className="profile-content" aria-busy={loading}>
        <div className="avatar-setting">
          <div className="avatar-preview">
            {avatar ? <img src={avatar} alt="当前头像" /> : <span>{username.slice(0, 1).toUpperCase()}</span>}
          </div>
          <div className="avatar-copy">
            <h3>个人头像</h3>
            <p>支持 JPG、PNG、GIF、WebP 和 AVIF，上传成功后会直接保存到用户资料。</p>
            <label className="avatar-upload">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                disabled={uploading || loading}
                onChange={(event) => void uploadAvatar(event.target.files?.[0])}
              />
              {uploading ? '正在上传...' : '更换头像'}
            </label>
          </div>
        </div>

        <form className="profile-form" onSubmit={saveProfile}>
          <div className="profile-section-heading">
            <div>
              <h3>基本信息</h3>
              <p>用户名会显示在文章和评论中。</p>
            </div>
            <span className={`account-state ${status === 'active' ? 'active' : ''}`}>{status === 'active' ? '账号正常' : status}</span>
          </div>

          <div className="profile-form-grid">
            <label>
              <span>用户名</span>
              <input name="username" value={form.username} minLength={2} maxLength={50} required disabled={loading || saving} onChange={updateField} />
            </label>
            <label>
              <span>邮箱</span>
              <input value={email} disabled readOnly />
              <small>邮箱修改需要单独验证，暂不在此处开放。</small>
            </label>
            <label>
              <span>手机号</span>
              <input name="phone" value={form.phone} maxLength={20} placeholder="未设置" disabled={loading || saving} onChange={updateField} />
            </label>
            <label>
              <span>性别</span>
              <select name="sex" value={form.sex} disabled={loading || saving} onChange={updateField}>
                <option value="">未设置</option>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </label>
            <label>
              <span>年龄</span>
              <input name="age" type="number" value={form.age || ''} min={0} max={150} placeholder="未设置" disabled={loading || saving} onChange={updateField} />
            </label>
            <div className="profile-readonly-field">
              <span>成员身份</span>
              <strong>{role === 'admin' ? '超级管理员' : '社团成员'}</strong>
            </div>
          </div>

          <div className="profile-actions">
            {notice && <p className={`profile-notice ${noticeType}`} role="status">{notice}</p>}
            <button type="submit" disabled={loading || saving || uploading}>{saving ? '正在保存...' : '保存资料'}</button>
          </div>
        </form>
      </div>
    </section>
  )
}
