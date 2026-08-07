import { useState, type FormEvent, type MouseEvent, type ReactNode } from 'react'
import AppLink from '@/components/common/AppLink'
import { authApi } from '@/api/auth'
import { navigate } from '@/hooks/usePathname'

export default function LoginPage() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const sendCode = async (event: MouseEvent<HTMLButtonElement>) => {
    const email = String(
      new FormData(event.currentTarget.form ?? undefined).get('email') ?? ''
    ).trim()

    if (!email) {
      return setMessage('请先填写 QQ 邮箱地址')
    }

    setSending(true)

    try {
      await authApi.sendEmailCode({ email, purpose: 'login' })
      setMessage('验证码已发送，请在 QQ 邮箱中查收。')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '验证码发送失败')
    } finally {
      setSending(false)
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const data = new FormData(event.currentTarget)
    setMessage('正在验证邮箱…')

    try {
      const auth = await authApi.emailLogin({
        email: String(data.get('email')),
        code: String(data.get('code'))
      })

      localStorage.setItem('renai_access_token', auth.access_token)
      localStorage.setItem('renai_current_user', JSON.stringify(auth.user))
      setMessage('登录成功，正在进入管理后台…')

      window.setTimeout(() => navigate('/admin'), 450)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '登录失败，请稍后重试')
    }
  }

  return (
    <AuthCard title="欢迎回来" subtitle="使用 QQ 邮箱验证码，安全进入你的 Renai 空间。" decoration="邮箱登录">
      <form className="auth-form" onSubmit={submit}>
        <label>
          QQ 邮箱
          <input name="email" required type="email" placeholder="name@qq.com"/>
        </label>

        <label>
          验证码
          <span className="code-input">
            <input name="code" required inputMode="numeric" maxLength={6} placeholder="6 位验证码"/>
            <button type="button" onClick={sendCode} disabled={sending}>
              {sending ? '发送中' : '发送验证码'}
            </button>
          </span>
        </label>

        <button type="submit">
          登录管理后台
        </button>

        {message && (
          <p className="form-message" role="status">
            {message}
          </p>
        )}
      </form>

      <p className="auth-switch">
        还没有账号？
        <AppLink to="/register">立即注册</AppLink>
      </p>
    </AuthCard>
  )
}

export function AuthCard({
  title,
  subtitle,
  decoration,
  children
}: {
  title: string
  subtitle: string
  decoration: string
  children: ReactNode
}) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-doodle" aria-hidden>
          ✦<br />♡<br />☁
        </div>

        <header>
          <small>{decoration}</small>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>

        {children}
      </section>
    </main>
  )
}