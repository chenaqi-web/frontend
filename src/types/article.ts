export interface Article {
  id: string
  title: string
  summary: string
  content: string
  coverImage: string
  authorID: string
  categoryID: string
  isTop: boolean
  viewCount: number
  likeCount: number
  commentCount: number
  createdAt: number
  updatedAt: number
  authorName: string
  authorAvatar: string
}

export interface ListArticlesRequest {
  page?: number
  pageSize?: number
}

export interface ListArticlesResponse {
  articles: Article[]
}

export interface CreateArticleRequest {
  authorID: number
  title: string
  summary?: string
  content: string
  coverImage?: string
  categoryID: number
  isTop?: boolean
}

export interface ListMyArticlesRequest extends ListArticlesRequest {
  authorID: number
}

export interface GetArticleRequest {
  id: number
}

export interface GetArticleResponse {
  article: Article
}

export interface DeleteArticleRequest {
  id: number
  authorID: number
}

export interface ArticleBoolResponse {
  success: boolean
}
