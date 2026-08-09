import { request } from '@/api/http'
import type { CurrentUser } from '@/types/user'

export const userApi = {
  current(token?: string) {
    return request<CurrentUser>('/v1/user/', { method: 'GET', ...(token ? { token } : {}) })
  },
}