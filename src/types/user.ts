import type { AuthUser } from '@/types/auth'

export type CurrentUser = AuthUser

export interface UserProfile {
  id: number
  username: string
  email: string
  phone: string
  avatar: string
  sex: string
  age: number
  role: string
  status: string
  like_count: number
  receive_like_count: number
}

export interface UpdateProfileRequest {
  username: string
  phone: string
  sex: '' | 'male' | 'female'
  age: number
}
