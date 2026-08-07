import { request } from '@/api/http'
import type { DeleteUploadRequest, UploadResponse } from '@/types/storage'

const options = (token?: string) => ({ token: token || undefined })

export const storageApi = {
  upload(file: File, token?: string) {
    const formData = new FormData()
    formData.set('file', file)
    return request<UploadResponse>('/v1/storage/upload', { method: 'POST', formData, ...options(token) })
  },
  delete(payload: DeleteUploadRequest, token?: string) {
    return request<null>('/v1/storage/delete', { method: 'POST', body: payload, ...options(token) })
  },
}
