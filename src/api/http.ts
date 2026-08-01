import { env } from '@/config/env.ts'
import type { ApiResponse } from '@/types/api.ts'

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  token?: string
}

function isApiEnvelope(payload: unknown): payload is ApiResponse<unknown> {
  return typeof payload === 'object'
    && payload !== null
    && 'code' in payload
    && 'msg' in payload
    && 'data' in payload
}

function failMsg(payload: unknown, fallback: string) {
  if (typeof payload === 'object' && payload !== null && 'msg' in payload) {
    const msg = (payload as { msg?: unknown }).msg
    if (typeof msg === 'string' && msg) return msg
  }
  return fallback
}

/** 统一请求：成功时解析 { code, msg, data } 并返回 data；失败按 HTTP 状态抛错。 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), env.requestTimeout)
  const headers = new Headers(options.headers)

  headers.set('Accept', 'application/json')
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`)

  try {
    const response = await fetch(`${env.apiBaseUrl}${path}`, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    })
    const isJson = response.headers.get('content-type')?.includes('application/json')
    const payload: unknown = isJson ? await response.json() : await response.text()

    if (!response.ok) {
      throw new Error(failMsg(payload, `请求失败 (${response.status})`))
    }

    if (isApiEnvelope(payload)) {
      if (payload.code !== 200) {
        throw new Error(payload.msg || `请求失败 (${payload.code})`)
      }
      return payload.data as T
    }

    return payload as T
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试')
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}
