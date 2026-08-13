import { request } from '@/api/http'
import type { CurrentUser, UpdateProfileRequest, UserProfile } from '@/types/user'

export const userApi = {
  current(token?: string) {
    return request<CurrentUser>('/v1/user/', { method: 'GET', ...(token ? { token } : {}) })
  },

  profile() {
    return request<UserProfile>('/v1/user/profile', { method: 'GET' })
  },

  updateProfile(payload: UpdateProfileRequest) {
    return request<UserProfile>('/v1/user/profile', { method: 'PUT', body: payload })
  },
}
