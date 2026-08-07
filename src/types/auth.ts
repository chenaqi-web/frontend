export type EmailCodePurpose = 'register' | 'login'

export interface SendEmailCodeRequest {
  email: string
  purpose: EmailCodePurpose
}

export interface EmailLoginRequest {
  email: string
  code: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  code: string
}

export interface AuthUser {
  id: number
  username: string
  email: string
  phone: string
  avatar: string
  sex: string
  age: number
  role: string
  status: string
  authVersion: number
}

export interface AuthResponse {
  access_token: string
  access_expires_in: number
  user: AuthUser
}
