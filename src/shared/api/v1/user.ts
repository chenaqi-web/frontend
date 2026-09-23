import { request } from '@/shared/api/http'
import type { CurrentUser, UserListResponse } from '@/shared/types/user'

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

  updateBlacklist(userID: number, blacklisted: boolean) {
    return request<{ success: boolean }>('/v1/user/status', { method: 'PUT', body: { user_id: userID, blacklisted } })
  },
}
