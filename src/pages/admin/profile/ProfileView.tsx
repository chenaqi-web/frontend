import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { articleApi } from '@/shared/api/v1/article'
import { likeApi } from '@/shared/api/v1/like'
import { userApi, type UpdateProfilePayload } from '@/shared/api/v1/user'
import { navigate } from '@/shared/hooks/usePathname'
import PublicHeader from '@/shared/ui/PublicHeader'
import type { Article } from '@/shared/types/article'
import type { CurrentUser } from '@/shared/types/user'
import { logRequestError } from '@/shared/lib/request-error'
import { readCurrentUser, saveCurrentUser } from '@/shared/lib/current-user'
import { resolveStorageUrl } from '@/shared/lib/storage'
import './ProfileView.css'
import './ProfileSpace.css'

type ProfileTab = 'home' | 'likes' | 'favorites' | 'submissions' | 'settings' | 'admin'
type ProfileViewMode = 'owner' | 'visitor'
interface ProfileViewProps {
  userID?: number
  publicView?: boolean
  hideHeader?: boolean
}
type ProfileCounts = Partial<CurrentUser> & {
  collection_count?: number
  collectionCount?: number
  favorite_count?: number
  favoriteCount?: number
  follow_count?: number
  followCount?: number
  follower_count?: number
  followerCount?: number
}

const emptyProfile: CurrentUser = {
  id: 0,
  username: '',
  email: '',
  phone: '',
  avatar: '',
  sex: '',
  birthday: '',
  signature: '',
  role: 'user',
  status: 'approved',
  article_count: 0,
  followers_count: 0,
  following_count: 0,
  like_count: 0,
  receive_like_count: 0,
  favor_count: 0,
  receive_favor_count: 0,
}
const sexOptions = [{ value: '', label: '未设置' }, { value: 'male', label: '男' }, { value: 'female', label: '女' }] as const
const sexLabel = (value: string) => sexOptions.find((item) => item.value === value)?.label ?? '未设置'
const formatCount = (value = 0) => new Intl.NumberFormat('zh-CN').format(value)
const birthdayWeekdays = ['一', '二', '三', '四', '五', '六', '日']
const pad2 = (value: number) => String(value).padStart(2, '0')
const normalizeBirthday = (value = '') => {
  const match = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (!match) return ''
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const parsed = new Date(year, month - 1, day)
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day ? `${year}-${pad2(month)}-${pad2(day)}` : ''
}
const getBirthdayDate = (value = '') => {
  const normalized = normalizeBirthday(value)
  if (!normalized) return null
  const [year, month, day] = normalized.split('-').map(Number)
  return new Date(year, month - 1, day)
}
const getCalendarMonth = (value = '') => {
  const selected = getBirthdayDate(value) ?? new Date()
  return new Date(selected.getFullYear(), selected.getMonth(), 1)
}
const formatBirthdayLabel = (value = '') => normalizeBirthday(value).replaceAll('-', '/') || '选择生日'
const toBirthdayValue = (date: Date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
const sameDay = (left: Date | null, right: Date) => Boolean(left && left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate())
const addMonths = (date: Date, offset: number) => new Date(date.getFullYear(), date.getMonth() + offset, 1)
const addYears = (date: Date, offset: number) => new Date(date.getFullYear() + offset, date.getMonth(), 1)
const getCalendarDays = (month: Date) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const startOffset = (first.getDay() + 6) % 7
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - startOffset)
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
    return { date, inMonth: date.getMonth() === month.getMonth() }
  })
}

function SpaceTabIcon({ tab }: { tab: ProfileTab }) {
  const paths: Record<ProfileTab, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 21v-6h6v6" /></>,
    likes: <path d="M12 20.5 4.8 13.7A4.6 4.6 0 0 1 11.3 7L12 7.8l.7-.8a4.6 4.6 0 0 1 6.5 6.7L12 20.5Z" />,
    favorites: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
    submissions: <><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M8 9h8M8 13h5" /></>,
    settings: <><rect x="4" y="5" width="16" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M13 10h4M13 14h4M7 16c.7-1.2 3.3-1.2 4 0" /></>,
    admin: <><path d="M12 3 5 6v5c0 4.2 2.9 8.1 7 10 4.1-1.9 7-5.8 7-10V6l-7-3Z" /><path d="M9.5 12.5 11 14l3.5-4" /></>,
  }
  return <svg className="space-tab-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">{paths[tab]}</svg>
}

function readCount(profile: ProfileCounts, keys: Array<keyof ProfileCounts>) {
  for (const key of keys) {
    const value = profile[key]
    if (typeof value === 'number') return value
  }
  return 0
}

function ArticleCard({ article }: { article: Article }) {
  return <article className="space-work-card" role="link" tabIndex={0} onClick={() => navigate(`/blog/${article.id}`)} onKeyDown={(event) => { if (event.key === 'Enter') navigate(`/blog/${article.id}`) }}>
    <div className="space-work-cover">{article.coverImage ? <img src={resolveStorageUrl(article.coverImage)} alt="" /> : <span>作品</span>}</div>
    <h3>{article.title || '未命名作品'}</h3>
    <p>{article.summary || '作者还没有写简介。'}</p>
    <footer><span>阅读 {formatCount(article.viewCount)}</span><span>点赞 {formatCount(article.likeCount)}</span></footer>
  </article>
}

export default function ProfileView({ userID, publicView = false, hideHeader = false }: ProfileViewProps = {}) {
  const canLoadPublicProfile = publicView && Boolean(userID)
  const [profile, setProfile] = useState<CurrentUser>(() => publicView ? emptyProfile : { ...emptyProfile, ...readCurrentUser() })
  const [articles, setArticles] = useState<Article[]>([])
  const [likedArticles, setLikedArticles] = useState<Article[]>([])
  const [activeTab, setActiveTab] = useState<ProfileTab>('home')
  const [viewMode, setViewMode] = useState<ProfileViewMode>(publicView ? 'visitor' : 'owner')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [sexOpen, setSexOpen] = useState(false)
  const [birthdayOpen, setBirthdayOpen] = useState(false)
  const [birthdayMonth, setBirthdayMonth] = useState(() => getCalendarMonth(profile.birthday))
  const sexMenuRef = useRef<HTMLDivElement>(null)
  const birthdayMenuRef = useRef<HTMLDivElement>(null)

  const profileCounts = profile as ProfileCounts
  const favoriteCount = readCount(profileCounts, ['favor_count', 'collection_count', 'collectionCount', 'favorite_count', 'favoriteCount'])
  const followCount = readCount(profileCounts, ['following_count', 'follow_count', 'followCount'])
  const followerCount = readCount(profileCounts, ['followers_count', 'follower_count', 'followerCount'])
  const articleCount = readCount(profileCounts, ['article_count']) || articles.length
  const likeCount = readCount(profileCounts, ['like_count'])
  const totalLikes = readCount(profileCounts, ['receive_like_count']) || articles.reduce((sum, item) => sum + (item.likeCount ?? 0), 0)
  const receiveFavorCount = readCount(profileCounts, ['receive_favor_count'])
  const totalViews = useMemo(() => articles.reduce((sum, item) => sum + (item.viewCount ?? 0), 0), [articles])
  const selectedBirthday = useMemo(() => getBirthdayDate(profile.birthday), [profile.birthday])
  const birthdayDays = useMemo(() => getCalendarDays(birthdayMonth), [birthdayMonth])
  const publicBirthday = normalizeBirthday(profile.birthday).replaceAll('-', '/') || '未设置'
  const publicMetrics = [
    { label: '关注', value: followCount },
    { label: '粉丝', value: followerCount },
    { label: '点赞', value: likeCount },
    { label: '获赞', value: totalLikes },
    { label: '收藏', value: favoriteCount },
    { label: '获藏', value: receiveFavorCount },
  ]
  const tabs = useMemo(() => {
    const ownerOnly = viewMode === 'owner'
    return [
      { id: 'home' as const, label: '主页', count: undefined },
      ...(ownerOnly ? [{ id: 'likes' as const, label: '点赞', count: likedArticles.length }] : []),
      ...(ownerOnly ? [{ id: 'favorites' as const, label: '收藏', count: favoriteCount }] : []),
      { id: 'submissions' as const, label: '投稿', count: articleCount },
      ...(ownerOnly ? [{ id: 'settings' as const, label: '个人资料', count: undefined }] : []),
      ...(ownerOnly && profile.role === 'admin' ? [{ id: 'admin' as const, label: '管理员设置', count: undefined }] : []),
    ]
  }, [articleCount, favoriteCount, likedArticles.length, profile.role, viewMode])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        if (canLoadPublicProfile && userID) {
          const user = await userApi.getPublicProfile(userID)
          setProfile({ ...emptyProfile, ...user })
          setLikedArticles([])
          setViewMode('visitor')
          const userArticles = await articleApi.listByUser({ authorID: userID, page: 1, pageSize: 50 }, null).catch((error) => {
            logRequestError('加载用户投稿失败', error)
            return { articles: [] }
          })
          setArticles(userArticles.articles ?? [])
          return
        }

        const user = await userApi.getProfile()
        setProfile(user)
        saveCurrentUser(user)
        const [myArticles, likes] = await Promise.all([
          articleApi.listByUser({ page: 1, pageSize: 50 }).catch((error) => {
            logRequestError('加载我的投稿失败', error)
            return { articles: [] }
          }),
          likeApi.list({ objectType: 'article', page: 1, pageSize: 50 }).catch((error) => {
            logRequestError('加载点赞列表失败', error)
            return { articles: [], total: 0 }
          }),
        ])
        setArticles(myArticles.articles ?? [])
        setLikedArticles(likes.articles ?? [])
      } catch (error) {
        logRequestError(canLoadPublicProfile ? '加载用户主页失败' : '加载个人中心失败', error)
        setNotice({ message: canLoadPublicProfile ? '用户主页加载失败，请稍后重试。' : '个人中心加载失败，当前显示本地信息。', type: 'error' })
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [canLoadPublicProfile, userID])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(null), 5000); return () => window.clearTimeout(timer) }, [notice])
  useEffect(() => {
    const updateHeader = () => setHasScrolled(window.scrollY > 32)
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    return () => window.removeEventListener('scroll', updateHeader)
  }, [])
  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      const target = event.target as Node
      if (!sexMenuRef.current?.contains(target)) setSexOpen(false)
      if (!birthdayMenuRef.current?.contains(target)) setBirthdayOpen(false)
    }
    document.addEventListener('mousedown', closeMenu)
    return () => document.removeEventListener('mousedown', closeMenu)
  }, [])
  useEffect(() => {
    if (!birthdayOpen) setBirthdayMonth(getCalendarMonth(profile.birthday))
  }, [birthdayOpen, profile.birthday])
  useEffect(() => { if (!tabs.some((item) => item.id === activeTab)) setActiveTab('home') }, [activeTab, tabs])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload: UpdateProfilePayload = {
      username: profile.username.trim(),
      phone: profile.phone.trim(),
      sex: profile.sex === 'male' || profile.sex === 'female' ? profile.sex : '',
      birthday: profile.birthday.trim(),
      signature: profile.signature.trim(),
    }
    if (payload.username.length < 2) { setNotice({ message: '用户名至少需要 2 个字符。', type: 'error' }); return }
    setSaving(true)
    try {
      const user = await userApi.updateProfile(payload)
      setProfile(user)
      saveCurrentUser(user)
      setNotice({ message: '个人资料已保存。', type: 'success' })
    } catch (error) {
      logRequestError('保存个人资料失败', error)
      setNotice({ message: '个人资料保存失败，请稍后重试。', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const uploadAvatar = async (file?: File) => {
    if (!file) return
    setUploading(true)
    try {
      await userApi.updateAvatar(file)
      const user = await userApi.getProfile()
      setProfile(user)
      saveCurrentUser(user)
      setNotice({ message: '头像已更新。', type: 'success' })
    } catch (error) {
      logRequestError('更新头像失败', error)
      setNotice({ message: '头像更新失败，请稍后重试。', type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const renderWorks = (items: Article[], emptyTitle: string, emptyText: string) => loading
    ? <div className="space-empty">正在加载...</div>
    : items.length
      ? <div className="space-work-grid">{items.map((article) => <ArticleCard article={article} key={article.id} />)}</div>
      : <div className="space-empty"><strong>{emptyTitle}</strong><span>{emptyText}</span></div>

  const canEditProfile = viewMode === 'owner' && !publicView

  return <section className="space-page">
    {!hideHeader && <PublicHeader pathname="/admin/profile" overlay scrolled={hasScrolled} />}
    <header className="space-hero">
      <div className="space-hero-bg" />
      <div className="space-profile">
        <label className={`space-avatar${canEditProfile ? ' editable' : ''}`}>{profile.avatar ? <img src={resolveStorageUrl(profile.avatar)} alt="当前头像" /> : <span>{(profile.username || 'U').slice(0, 1).toUpperCase()}</span>}{canEditProfile && <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif" disabled={uploading} onChange={(event) => void uploadAvatar(event.target.files?.[0])} />}</label>
        <div className="space-identity"><div><h1>{profile.username || '未设置用户名'}</h1><span>{profile.role === 'admin' ? '管理员' : '社团成员'}</span></div><p>{profile.signature || '这个用户还没有留下个性签名'}</p></div>
      </div>
      {!publicView && <div className="space-view-switch" aria-label="视角切换"><button type="button" className={viewMode === 'owner' ? 'active' : ''} onClick={() => setViewMode('owner')}>本人视角</button><button type="button" className={viewMode === 'visitor' ? 'active' : ''} onClick={() => setViewMode('visitor')}>访客视角</button></div>}
    </header>
    <nav className="space-tabs" aria-label="个人中心导航">{tabs.map((item) => <button key={item.id} type="button" className={activeTab === item.id ? 'active' : ''} onClick={() => item.id === 'admin' ? navigate('/admin/blog') : setActiveTab(item.id)}><SpaceTabIcon tab={item.id} /><span>{item.label}</span>{typeof item.count === 'number' && <small>{formatCount(item.count)}</small>}</button>)}<div className="space-stats"><span><b>{formatCount(followCount)}</b>关注</span><span><b>{formatCount(followerCount)}</b>粉丝</span><span><b>{formatCount(totalLikes)}</b>获赞</span>{!publicView && <span><b>{formatCount(totalViews)}</b>阅读</span>}</div></nav>
    <div className="space-body">
      <main className="space-main">
        {activeTab === 'home' && <>
          {publicView ? <section className="space-public-card"><header><div><span>PUBLIC PROFILE</span><h2>公开资料</h2></div><strong>用户 ID：{profile.id || userID}</strong></header><div className="space-public-fields"><span><b>性别</b>{sexLabel(profile.sex)}</span><span><b>生日</b>{publicBirthday}</span><span><b>个性签名</b>{profile.signature || '这个用户还没有留下个性签名'}</span></div><div className="space-public-metrics">{publicMetrics.map((item) => <span key={item.label}><b>{formatCount(item.value)}</b>{item.label}</span>)}</div></section> : <section className="space-pinned"><div className="space-mascot" aria-hidden="true">R</div><div><h2>{viewMode === 'owner' ? '置顶你的代表作品' : '代表作品'}</h2><p>{viewMode === 'owner' ? '选择最想展示给访客的投稿，让大家第一眼看到你的创作。' : '这里会展示用户最想被看见的作品。'}</p></div>{viewMode === 'owner' && <div className="space-inline-actions"><button type="button" onClick={() => navigate('/admin/create')}>发布作品</button><button type="button" onClick={() => navigate('/admin/my-articles')}>内容管理</button></div>}</section>}
          <section className="space-section"><header><div><h2>最近投稿</h2><span>{formatCount(articleCount)} 个作品</span></div><button type="button" onClick={() => setActiveTab('submissions')}>查看更多</button></header>{renderWorks(articles.slice(0, 6), '还没有投稿', viewMode === 'owner' ? '去创作中心发布第一篇作品吧。' : '这个用户还没有公开作品。')}</section>
        </>}
        {activeTab === 'likes' && <section className="space-section"><header><div><h2>点赞</h2><span>{likedArticles.length} 条记录</span></div></header>{renderWorks(likedArticles, '还没有点赞内容', viewMode === 'owner' ? '点过赞的作品会出现在这里。' : '访客暂时看不到更多点赞内容。')}</section>}
        {activeTab === 'favorites' && <section className="space-section"><header><div><h2>收藏</h2><span>{formatCount(favoriteCount)} 个收藏</span></div></header><div className="space-empty"><strong>收藏功能待开放</strong><span>后端返回收藏数后，这里会展示收藏夹列表。</span></div></section>}
        {activeTab === 'submissions' && <section className="space-section"><header><div><h2>投稿</h2><span>{formatCount(articleCount)} 个作品</span></div>{viewMode === 'owner' && <button type="button" onClick={() => navigate('/admin/create')}>发布作品</button>}</header>{renderWorks(articles, '还没有投稿', '发布后的作品会出现在这里。')}</section>}
        {activeTab === 'settings' && <form className="space-settings" onSubmit={(event) => void submit(event)}><header><span>PROFILE DETAILS</span><h2>个人资料</h2><p>完善你的基础信息，这些内容会展示在个人空间和后台资料中。</p></header><div className="profile-fields"><label>昵称<input value={profile.username} minLength={2} maxLength={50} disabled={loading || saving} onChange={(event) => setProfile((current) => ({ ...current, username: event.target.value }))} /></label><label>邮箱<input value={profile.email} disabled /></label><label>手机<input value={profile.phone} maxLength={20} disabled={loading || saving} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} /></label><label className="profile-select-label">性别<div className="profile-select" ref={sexMenuRef}><button type="button" className="profile-select-trigger" aria-haspopup="listbox" aria-expanded={sexOpen} disabled={loading || saving} onClick={() => setSexOpen((open) => !open)}><span>{sexLabel(profile.sex)}</span><i aria-hidden="true" /></button>{sexOpen && <div className="profile-select-menu" role="listbox" aria-label="性别">{sexOptions.map((option) => <button type="button" role="option" aria-selected={profile.sex === option.value} className={profile.sex === option.value ? 'selected' : ''} key={option.value || 'unset'} onClick={() => { setProfile((current) => ({ ...current, sex: option.value })); setSexOpen(false) }}>{option.label}</button>)}</div>}</div></label><label className="profile-date-label">生日<div className="profile-date" ref={birthdayMenuRef}><button type="button" className="profile-date-trigger" aria-haspopup="dialog" aria-expanded={birthdayOpen} disabled={loading || saving} onClick={() => setBirthdayOpen((open) => !open)}><span className={profile.birthday ? '' : 'placeholder'}>{formatBirthdayLabel(profile.birthday)}</span><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg></button>{birthdayOpen && <div className="profile-date-menu" role="dialog" aria-label="选择生日"><div className="profile-date-head"><button type="button" aria-label="上一年" className="year" onClick={() => setBirthdayMonth((month) => addYears(month, -1))}>«</button><button type="button" aria-label="上个月" onClick={() => setBirthdayMonth((month) => addMonths(month, -1))}>‹</button><strong>{birthdayMonth.getFullYear()}年{pad2(birthdayMonth.getMonth() + 1)}月</strong><button type="button" aria-label="下个月" onClick={() => setBirthdayMonth((month) => addMonths(month, 1))}>›</button><button type="button" aria-label="下一年" className="year" onClick={() => setBirthdayMonth((month) => addYears(month, 1))}>»</button></div><div className="profile-date-week">{birthdayWeekdays.map((day) => <span key={day}>{day}</span>)}</div><div className="profile-date-grid">{birthdayDays.map(({ date, inMonth }) => { const selected = sameDay(selectedBirthday, date); const today = sameDay(new Date(), date); return <button type="button" key={toBirthdayValue(date)} className={`${inMonth ? '' : 'outside'}${selected ? ' selected' : ''}${today ? ' today' : ''}`} onClick={() => { setProfile((current) => ({ ...current, birthday: toBirthdayValue(date) })); setBirthdayOpen(false) }}>{date.getDate()}</button> })}</div><div className="profile-date-actions"><button type="button" onClick={() => setProfile((current) => ({ ...current, birthday: '' }))}>清除</button><button type="button" onClick={() => { const today = new Date(); setProfile((current) => ({ ...current, birthday: toBirthdayValue(today) })); setBirthdayMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setBirthdayOpen(false) }}>今天</button></div></div>}</div></label><label>签名<input value={profile.signature} maxLength={255} disabled={loading || saving} onChange={(event) => setProfile((current) => ({ ...current, signature: event.target.value }))} /></label></div><footer><button className="profile-save" type="submit" disabled={loading || saving}>{saving ? '保存中...' : '保存资料'}</button></footer></form>}
      </main>
    </div>
    {notice && <div className={`profile-toast ${notice.type}`} role="status"><span>{notice.type === 'success' ? '✓' : '!'}</span>{notice.message}<button type="button" onClick={() => setNotice(null)} aria-label="关闭提示">×</button></div>}
  </section>
}
