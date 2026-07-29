export interface LoginRequest {
  account: string
  password: string
}

export interface RegisterRequest {
  nickname: string
  email: string
  password: string
  emailCode: string
}

export interface SendEmailCodeRequest {
  email: string
  scene: 'register' | 'login' | 'reset_password'
}

export interface AuthUser {
  id: string
  nickname: string
  email: string
  avatar?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: AuthUser
}
