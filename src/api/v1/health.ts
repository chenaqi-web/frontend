import { request } from '@/api/http'
import type { PingResponse } from '@/types/health'

export const healthApi = {
  ping() {
    return request<PingResponse>('/v1/health/ping', { method: 'GET', auth: false })
  },
}

export async function pingGateway() {
  return healthApi.ping()
}
