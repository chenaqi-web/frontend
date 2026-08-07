import { request } from '@/api/http'
import type {
  CommentBoolResponse,
  CommentListResponse,
  CommentRepliesResponse,
  CreateCommentRequest,
  CreateReplyRequest,
  DeleteCommentRequest,
  GetArticleCommentsRequest,
  GetCommentRepliesRequest,
} from '@/types/comment'

const options = (token?: string) => ({ token: token || undefined })

export const commentApi = {
  list(payload: GetArticleCommentsRequest, token?: string) {
    return request<CommentListResponse>('/v1/comment/list', { method: 'POST', body: payload, ...options(token) })
  },
  replies(payload: GetCommentRepliesRequest, token?: string) {
    return request<CommentRepliesResponse>('/v1/comment/replies', { method: 'POST', body: payload, ...options(token) })
  },
  create(payload: CreateCommentRequest, token?: string) {
    return request<CommentBoolResponse>('/v1/comment/create', { method: 'POST', body: payload, ...options(token) })
  },
  reply(payload: CreateReplyRequest, token?: string) {
    return request<CommentBoolResponse>('/v1/comment/reply', { method: 'POST', body: payload, ...options(token) })
  },
  delete(payload: DeleteCommentRequest, token?: string) {
    return request<CommentBoolResponse>('/v1/comment/delete', { method: 'DELETE', body: payload, ...options(token) })
  },
}
