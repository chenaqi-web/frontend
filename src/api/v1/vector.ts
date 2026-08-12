import { request } from '@/api/http'
import type { VectorCollection, VectorDocumentPage } from '@/types/vector'

export const vectorApi = {
  collections: () => request<VectorCollection[]>('/v1/vector/collections'),
  createCollection: (name: string) => request<VectorCollection>(`/v1/vector/collections/${encodeURIComponent(name)}`, { method: 'POST' }),
  deleteCollection: (name: string) => request<void>(`/v1/vector/collections/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  documents: (name: string, page = 1, pageSize = 5) => request<VectorDocumentPage>(`/v1/vector/collections/${encodeURIComponent(name)}/documents?page=${page}&page_size=${pageSize}`),
}
