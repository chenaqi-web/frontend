import { request } from '@/api/http'
import type { LikeBoolResponse, LikeRequest, LikeStatus, UserLikeListRequest, UserLikeListResponse } from '@/types/like'

const options = (token?: string) => ({ token: token || undefined })

export const likeApi = {
  thumbUp(payload: LikeRequest, token?: string) {
    return request<LikeBoolResponse>('/v1/like/thumb_up', { method: 'POST', body: payload, ...options(token) })
  },
  cancelThumbUp(payload: LikeRequest, token?: string) {
    return request<LikeBoolResponse>('/v1/like/cancel_thumb_up', { method: 'POST', body: payload, ...options(token) })
  },
  list(payload: UserLikeListRequest, token?: string) {
    return request<UserLikeListResponse>('/v1/like/list', { method: 'POST', body: payload, ...options(token) })
  },
}
