import { request, upload } from '@/api/http'
import type { DeleteUploadRequest, UploadResponse } from '@/types/storage'

const auth = (token?: string) => (token ? { token } : {})

export const storageApi = {
  upload(file: File) {
    return upload<UploadResponse>('/v1/storage/upload', file)
  },

  delete(payload: DeleteUploadRequest, token?: string) {
    return request<null>('/v1/storage/delete', { method: 'POST', body: payload, ...auth(token) })
  },
}
