import { request } from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/types/api'
import type { BlogCategory, BlogComment, BlogListRequest, BlogPost, CreateCommentRequest } from '@/types/blog'

function toQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value))
  })
  return query.toString()
}

export const blogApi = {
  categories() {
    return request<ApiResponse<BlogCategory[]>>('/v1/blog/categories')
  },
  posts(params: BlogListRequest) {
    return request<ApiResponse<PageResponse<BlogPost>>>(`/v1/blog/posts?${toQuery({
      page: params.page,
      pageSize: params.pageSize,
      categoryId: params.categoryId,
      keyword: params.keyword,
    })}`)
  },
  postDetail(id: string) {
    return request<ApiResponse<BlogPost>>(`/v1/blog/posts/${id}`)
  },
  comments(postId: string, params: BlogListRequest) {
    return request<ApiResponse<PageResponse<BlogComment>>>(`/v1/blog/posts/${postId}/comments?${toQuery({
      page: params.page,
      pageSize: params.pageSize,
      categoryId: params.categoryId,
      keyword: params.keyword,
    })}`)
  },
  createComment(postId: string, payload: CreateCommentRequest, token: string) {
    return request<ApiResponse<BlogComment>>(`/v1/blog/posts/${postId}/comments`, {
      method: 'POST', body: payload, token,
    })
  },
}
