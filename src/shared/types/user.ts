import type { AuthUser } from '@/types/auth'

export type CurrentUser = AuthUser

export interface ManagedUser {
  id: number
  username: string
  email: string
  phone: string
  avatar: string
  sex: string
  age: number
  role: string
  status: 'approved' | 'blocked'
  like_count: number
  receive_like_count: number
}

export interface UserListResponse {
  users: ManagedUser[]
  total: number
}
