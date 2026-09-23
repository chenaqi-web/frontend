import { request } from '@/api/http'
import type {
  ArticleBoolResponse,
  CreateArticleRequest,
  DeleteArticleRequest,
  GetArticleRequest,
  GetArticleResponse,
  ListArticlesRequest,
  ListArticlesResponse,
  ListByCategoryRequest,
  ListMyArticlesRequest,
  SearchArticlesRequest,
} from '@/types/article'

const auth = (token?: string) => (token ? { token } : {})

export const articleApi = {
  list(params: ListArticlesRequest = {}, token?: string) {
    return request<ListArticlesResponse>('/v1/article/list', { method: 'POST', body: params, ...auth(token) })
  },

  byCategory(categoryID: number, params: ListArticlesRequest = {}, token?: string) {
    const body: ListByCategoryRequest = { categoryID, ...params }
    return request<ListArticlesResponse>('/v1/article/list/by_cate', { method: 'POST', body, ...auth(token) })
  },

  search(q: string, params: ListArticlesRequest = {}, token?: string) {
    const body: SearchArticlesRequest = { q, ...params }
    return request<ListArticlesResponse>('/v1/article/search', { method: 'POST', body, ...auth(token) })
  },

  detail(payload: GetArticleRequest, token?: string) {
    return request<GetArticleResponse>('/v1/article/message', { method: 'POST', body: payload, ...auth(token) })
  },

  create(payload: CreateArticleRequest, token?: string) {
    return request<ArticleBoolResponse>('/v1/article/create', { method: 'POST', body: payload, ...auth(token) })
  },

  listByUser(params: ListMyArticlesRequest = {}, token?: string) {
    return request<ListArticlesResponse>('/v1/article/list/by_user_id', { method: 'POST', body: params, ...auth(token) })
  },

  delete(payload: DeleteArticleRequest, token?: string) {
    return request<ArticleBoolResponse>('/v1/article/del', { method: 'DELETE', body: payload, ...auth(token) })
  },
}
