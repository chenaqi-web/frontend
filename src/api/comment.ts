import { request } from '@/api/http'
import type { PageResponse } from '@/types/api'

export interface CommentAuthor {
  id: string
  nickname: string
  avatar?: string
}

export interface CommentItem {
  id: string
  articleId: string
  userId: string
  parentId: string
  rootId: string
  replyToId: string
  replyToName: string
  content: string
  likeCount: number
  childCount: number
  createdAt: string
  userName: string
  userAvatar: string
  replies?: CommentItem[]
}

export interface CommentListRequest {
  page?: number
  pageSize?: number
}

export interface CommentListResponse extends PageResponse<CommentItem> {}

export interface CreateCommentRequest {
  articleId: number
  userId: number
  content: string
}

export interface CreateReplyRequest {
  rootId: number
  userId: number
  replyToId: number
  replyToName: string
  content: string
}

export const commentApi = {
  list(articleId: string, params: CommentListRequest = {}, token?: string) {
    const search = new URLSearchParams()
    if (params.page !== undefined) search.set('page', String(params.page))
    if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize))
    return request<CommentListResponse>(`/v1/comments/article/${articleId}?${search.toString()}`, {
      method: 'GET',
      token: token || undefined,
    })
  },
  create(payload: CreateCommentRequest, token?: string) {
    return request<{ success: boolean }>('/v1/comments/create', {
      method: 'POST',
      body: payload,
      token: token || undefined,
    })
  },
}
