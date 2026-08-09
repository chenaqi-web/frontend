export type EmailCodePurpose = 'register' | 'login' | 'forgot_password'

export interface SendEmailCodeRequest {
  email: string
  purpose: EmailCodePurpose
}

export interface LoginRequest {
  username: string
  password: string
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

export interface ForgotPasswordRequest {
  email: string
  code: string
  new_password: string
  confirm_password: string
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
  auth_version: number
}

export interface AuthResponse {
  access_token: string
  access_expires_in: number
  user: AuthUser
}
