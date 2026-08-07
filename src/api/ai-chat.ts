import { request } from '@/api/http'
import type { AiChatChatRequest, AiChatListSessionsResponse, AiChatMessage, AiChatSession } from '@/types/ai-chat'

const options = (token: string) => ({ token })

export const aiChatApi = {
  createSession(token: string) {
    return request<AiChatSession>('/v1/ai-chat/session', { method: 'POST', ...options(token) })
  },
  listSessions(page = 1, pageSize = 20, token: string) {
    return request<AiChatListSessionsResponse>(`/v1/ai-chat/sessions?page=${page}&page_size=${pageSize}`, { method: 'GET', ...options(token) })
  },
  getSession(id: string, token: string) {
    return request<AiChatSession>(`/v1/ai-chat/session/${encodeURIComponent(id)}`, { method: 'GET', ...options(token) })
  },
  listMessages(id: string, token: string) {
    return request<AiChatMessage[]>(`/v1/ai-chat/session/${encodeURIComponent(id)}/messages`, { method: 'GET', ...options(token) })
  },
  chat(payload: AiChatChatRequest, token: string) {
    return fetch('/api' + '/v1/ai-chat/chat', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  },
}
