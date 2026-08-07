import { useState, type FormEvent, type MouseEvent } from 'react'
import AppLink from '@/components/common/AppLink'
import { authApi } from '@/api/auth'
import { AuthCard } from '@/pages/auth/LoginPage'
import { navigate } from '@/hooks/usePathname'

export default function RegisterPage() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const sendCode = async (event: MouseEvent<HTMLButtonElement>) => {
    const email = String(new FormData(event.currentTarget.form ?? undefined).get('email') ?? '').trim()
    if (!email) return setMessage('请先填写 QQ 邮箱地址')
    setSending(true)
    try {
      await authApi.sendEmailCode({ email, purpose: 'register' })
      setMessage('验证码已发送，请在 QQ 邮箱中查收。')
    } catch (error) { setMessage(error instanceof Error ? error.message : '发送失败') } finally { setSending(false) }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setMessage('正在创建账号…')
    try {
      await authApi.register({ username: String(data.get('username')), email: String(data.get('email')), password: String(data.get('password')), code: String(data.get('code')) })
      setMessage('注册成功，正在跳转到登录页…')
      window.setTimeout(() => navigate('/login'), 800)
    } catch (error) { setMessage(error instanceof Error ? error.message : '注册失败，请稍后重试') }
  }

  return <AuthCard title="创建账号" subtitle="验证 QQ 邮箱后，即可创建你的 Renai 账号。" decoration="邮箱注册">
    <form className="auth-form" onSubmit={submit}>
      <label>昵称<input name="username" required minLength={2} maxLength={50} placeholder="大家怎么称呼你？" /></label>
      <label>QQ 邮箱<input name="email" required type="email" placeholder="name@qq.com" /></label>
      <label>验证码<span className="code-input"><input name="code" required inputMode="numeric" maxLength={6} placeholder="6 位验证码" /><button type="button" onClick={sendCode} disabled={sending}>{sending ? '发送中' : '发送验证码'}</button></span></label>
      <label>设置密码<input name="password" required minLength={6} type="password" placeholder="至少 6 个字符" /></label>
      <button type="submit">创建账号</button>{message && <p className="form-message" role="status">{message}</p>}
    </form>
    <p className="auth-switch">已有账号？<AppLink to="/login">去登录</AppLink></p>
  </AuthCard>
}
