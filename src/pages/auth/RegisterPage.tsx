import { useState, type FormEvent, type MouseEvent } from 'react'
import AppLink from '@/components/common/AppLink'
import { authApi } from '@/api/auth'
import { AuthCard } from '@/pages/auth/LoginPage'

export default function RegisterPage() {
  const [message, setMessage] = useState('')

  const sendCode = async (event: MouseEvent<HTMLButtonElement>) => {
    const form = event.currentTarget.form
    const email = String(new FormData(form ?? undefined).get('email') ?? '')
    if (!email) return setMessage('先写下邮箱哦！')
    try {
      await authApi.sendEmailCode({ email, scene: 'register' })
      setMessage('验证码已经飞进邮箱啦！')
    } catch (error) { setMessage(error instanceof Error ? error.message : '发送失败') }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setMessage('正在制作你的通行证…')
    try {
      await authApi.register({ nickname: String(data.get('nickname')), email: String(data.get('email')), password: String(data.get('password')), emailCode: String(data.get('emailCode')) })
      setMessage('注册成功！欢迎加入 RenaiTeam。')
    } catch (error) { setMessage(error instanceof Error ? error.message : '注册失败，请稍后重试') }
  }

  return <AuthCard title="领取通行证" subtitle="成为社团新成员，从写下昵称开始。" decoration="✦ JOIN US ✦">
    <form className="auth-form" onSubmit={submit}>
      <label>昵称<input name="nickname" required placeholder="大家怎么称呼你？" /></label>
      <label>邮箱<input name="email" required type="email" placeholder="hello@example.com" /></label>
      <label>邮箱验证码<span className="code-input"><input name="emailCode" required placeholder="6 位验证码" /><button type="button" onClick={sendCode}>发送</button></span></label>
      <label>设置密码<input name="password" required minLength={8} type="password" placeholder="至少 8 个字符" /></label>
      <button type="submit">制作我的通行证 →</button>{message && <p className="form-message">{message}</p>}
    </form>
    <p className="auth-switch">已经是基地成员？<AppLink to="/login">直接登录</AppLink></p>
  </AuthCard>
}
