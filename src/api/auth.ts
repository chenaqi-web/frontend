import { request } from '@/api/http.ts'
import type { AuthResponse, LoginRequest, RegisterRequest, SendEmailCodeRequest } from '@/types/auth'

export const authApi = {
  sendEmailCode(payload: SendEmailCodeRequest) {
    return request<null>('/v1/auth/send-email-code', { method: 'POST', body: payload })
  },
  login(payload: LoginRequest) {
    return request<AuthResponse>('/v1/auth/login', { method: 'POST', body: payload })
  },
  register(payload: RegisterRequest) {
    return request<AuthResponse>('/v1/auth/register', { method: 'POST', body: payload })
  },
  logout(token: string) {
    return request<null>('/v1/auth/logout', { method: 'POST', token })
  },
}
