import { request } from '@/api/http'
import { requestStream } from '@/api/sse'
import type {
  AiChatChatRequest,
  AiChatListSessionsQuery,
  AiChatMessage,
  AiChatSession,
} from '@/types/ai-chat'

function toQuery(params: AiChatListSessionsQuery) {
  const query = new URLSearchParams()
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.page_size !== undefined) query.set('page_size', String(params.page_size))
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

export const aiChatApi = {
  createSession() {
    return request<AiChatSession>('/v1/ai-chat/session', { method: 'POST' })
  },

  listSessions(params: AiChatListSessionsQuery = {}) {
    return request<AiChatSession[]>(`/v1/ai-chat/sessions${toQuery(params)}`, { method: 'GET' })
  },

  getSession(id: string) {
    return request<AiChatSession>(`/v1/ai-chat/session/${encodeURIComponent(id)}`, { method: 'GET' })
  },

  listMessages(id: string) {
    return request<AiChatMessage[]>(`/v1/ai-chat/session/${encodeURIComponent(id)}/messages`, { method: 'GET' })
  },

  chat(payload: AiChatChatRequest) {
    return requestStream('/v1/ai-chat/chat', payload)
  },
}
