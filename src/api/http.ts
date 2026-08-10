import { env } from '@/config/env'
import { ACCESS_TOKEN_KEY } from '@/constants/auth'
import type { ApiResponse } from '@/types/api'

export interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
  token?: string | null
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

function headers(auth: boolean, tokenOverride?: string | null) {
  const result = new Headers({ Accept: 'application/json', 'Content-Type': 'application/json' })
  const token = auth ? (tokenOverride === undefined ? getAccessToken() : tokenOverride) : null
  if (token) result.set('Authorization', `Bearer ${token}`)
  return result
}

function unwrap<T>(payload: unknown): T {
  if (typeof payload === 'object' && payload !== null && 'code' in payload && 'msg' in payload) {
    const response = payload as ApiResponse<T>
    if (response.code !== 200) throw new Error(response.msg || '请求失败')
    return response.data
  }
  return payload as T
}

export async function request<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: headers(options.auth !== false, options.token),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: path.startsWith('/v1/auth/') ? 'include' : 'same-origin',
  })
  const payload: unknown = await response.json()
  if (!response.ok) throw new Error((payload as { msg?: string }).msg || `请求失败 (${response.status})`)
  return unwrap<T>(payload)
}

export async function upload<T>(path: string, file: File, fields: Record<string, string> = {}) {
  const form = new FormData()
  form.set('file', file)
  Object.entries(fields).forEach(([key, value]) => form.set(key, value))
  const token = getAccessToken()
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  })
  const payload: unknown = await response.json()
  if (!response.ok) throw new Error((payload as { msg?: string }).msg || `请求失败 (${response.status})`)
  return unwrap<T>(payload)
}
