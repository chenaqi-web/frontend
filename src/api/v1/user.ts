import { request } from '@/api/http'
import type { CurrentUser, ManagedUser, UserListResponse } from '@/types/user'

export interface UpdateProfilePayload {
  username: string
  phone: string
  sex: '' | 'male' | 'female'
  age: number
}

export const userApi = {
  current(token?: string) {
    return request<CurrentUser>('/v1/user/', { method: 'GET', ...(token ? { token } : {}) })
  },

  getProfile() {
    return request<CurrentUser>('/v1/user/profile')
  },

  updateProfile(payload: UpdateProfilePayload) {
    return request<CurrentUser>('/v1/user/profile', { method: 'PUT', body: payload })
  },

  updateAvatar(avatar: string) {
    return request<CurrentUser>('/v1/user/avatar', { method: 'PUT', body: { avatar } })
  },

  list(keyword = '', page = 1, pageSize = 20) {
    const query = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (keyword.trim()) query.set('keyword', keyword.trim())
    return request<UserListResponse>(`/v1/user/list?${query.toString()}`)
  },

  updateStatus(userID: number, status: ManagedUser['status']) {
    return request<ManagedUser>(`/v1/user/${userID}/status`, { method: 'PUT', body: { status } })
  },
}
