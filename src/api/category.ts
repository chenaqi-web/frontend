import { request } from '@/api/http'
import type {
  CreateCategoryRequest,
  CreateCategoryResponse,
  CreateTypeRequest,
  CreateTypeResponse,
  DeleteCategoryRequest,
  DeleteCategoryResponse,
  DeleteTypeRequest,
  DeleteTypeResponse,
  ListCategoriesRequest,
  ListCategoriesResponse,
  ListTypesResponse,
} from '@/types/category'

const options = (token?: string) => ({ token: token || undefined })

export const categoryApi = {
  createType(payload: CreateTypeRequest, token?: string) {
    return request<CreateTypeResponse>('/v1/types/create', {
      method: 'POST', body: payload, ...options(token),
    })
  },
  deleteType(payload: DeleteTypeRequest, token?: string) {
    return request<DeleteTypeResponse>('/v1/types/del', {
      method: 'DELETE', body: payload, ...options(token),
    })
  },
  listTypes(token?: string) {
    return request<ListTypesResponse>('/v1/types/list', {
      method: 'GET', ...options(token),
    })
  },
  createCategory(payload: CreateCategoryRequest, token?: string) {
    return request<CreateCategoryResponse>('/v1/types/category/create', {
      method: 'POST', body: payload, ...options(token),
    })
  },
  deleteCategory(payload: DeleteCategoryRequest, token?: string) {
    return request<DeleteCategoryResponse>('/v1/types/category/del', {
      method: 'DELETE', body: payload, ...options(token),
    })
  },
  listCategories(payload: ListCategoriesRequest, token?: string) {
    return request<ListCategoriesResponse>('/v1/types/category/list', {
      method: 'POST', body: payload, ...options(token),
    })
  },
}
