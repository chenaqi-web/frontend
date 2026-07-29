import { env } from '@/config/env'
import type { ApiErrorBody, ApiResponse } from '@/types/api'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  token?: string
}

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
      const error = typeof payload === 'object' && payload !== null ? payload as ApiErrorBody : undefined
      throw new ApiError(error?.message ?? `请求失败 (${response.status})`, response.status, error?.code)
    }

    return payload as T
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('请求超时，请稍后重试', 408)
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

export function unwrap<T>(response: ApiResponse<T>): T {
  if (response.code !== 0 && response.code !== 200) {
    throw new ApiError(response.message || '接口返回异常', 200, response.code)
  }
  return response.data
}
