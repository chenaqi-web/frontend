import { useState, type FormEvent, type ReactNode } from 'react'
import AppLink from '@/components/common/AppLink'
import { authApi } from '@/api/auth'

export default function LoginPage() {
  const [message, setMessage] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setMessage('正在验证基地暗号…')
    try {
      await authApi.login({ account: String(data.get('account')), password: String(data.get('password')) })
      setMessage('登录成功，欢迎回来！')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '登录失败，请稍后重试')
    }
  }

  return <AuthCard title="欢迎回来！" subtitle="输入你的基地暗号，继续未完成的冒险。" decoration="✦ LOG IN ✦">
    <form className="auth-form" onSubmit={submit}>
      <label>邮箱 / 用户名<input name="account" required placeholder="你的秘密身份" /></label>
      <label>密码<input name="password" required type="password" placeholder="••••••••" /></label>
      <div className="auth-options"><label><input type="checkbox" /> 记住我</label><a href="#forgot">忘记暗号？</a></div>
      <button type="submit">进入秘密基地 →</button>{message && <p className="form-message">{message}</p>}
    </form>
    <p className="auth-switch">还没有贴纸通行证？<AppLink to="/register">现在注册</AppLink></p>
  </AuthCard>
}

export function AuthCard({ title, subtitle, decoration, children }: { title: string; subtitle: string; decoration: string; children: ReactNode }) {
  return <main className="auth-page"><section className="auth-card"><span className="auth-tape"/><div className="auth-doodle">♡<br/>☆ﾟ.*<br/>☁</div><header><small>{decoration}</small><h1>{title}</h1><p>{subtitle}</p></header>{children}</section></main>
}
