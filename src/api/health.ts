import { env } from '@/config/env'

export async function pingGateway(): Promise<unknown> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), env.requestTimeout)

  try {
    const response = await fetch(`${env.apiBaseUrl}/v1/health/ping`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Gateway health check failed: ${response.status}`)
    }

    const contentType = response.headers.get('content-type')
    return contentType?.includes('application/json') ? response.json() : response.text()
  } finally {
    window.clearTimeout(timeout)
  }
}
