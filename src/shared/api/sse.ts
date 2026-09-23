import { env } from '@/config/env'
import { getAccessToken } from '@/api/http'

export async function requestStream(path: string, body: unknown) {
  const token = getAccessToken()
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`请求失败 (${response.status})`)
  return response
}
