import { request } from '@/api/http'
import type {
  ArticleBoolResponse,
  DeleteArticleRequest,
  GetArticleRequest,
  GetArticleResponse,
  ListArticlesRequest,
  ListArticlesResponse,
} from '@/types/article'

export const articleApi = {
  list(params: ListArticlesRequest = {}, token?: string) {
    return request<ListArticlesResponse>('/v1/article/list', {
      method: 'POST',
      body: params,
      token: token || undefined,
    })
  },
  byCategory(categoryID: number, params: ListArticlesRequest = {}, token?: string) {
    return request<ListArticlesResponse>('/v1/article/list/by_cate', {
      method: 'POST',
      body: { categoryID, ...params },
      token: token || undefined,
    })
  },
  search(q: string, params: ListArticlesRequest = {}, token?: string) {
    return request<ListArticlesResponse>('/v1/article/search', {
      method: 'POST',
      body: { q, ...params },
      token: token || undefined,
    })
  },
  detail(payload: GetArticleRequest, token?: string) {
    return request<GetArticleResponse>('/v1/article/message', {
      method: 'POST',
      body: payload,
      token: token || undefined,
    })
  },
  delete(payload: DeleteArticleRequest, token?: string) {
    return request<ArticleBoolResponse>('/v1/article/del', {
      method: 'DELETE',
      body: payload,
      token: token || undefined,
    })
  },
}
