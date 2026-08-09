export interface Article {
  id: number
  title: string
  summary: string
  content: string
  coverImage: string
  authorID: number
  categoryID: number
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

export interface ListByCategoryRequest extends ListArticlesRequest {
  categoryID: number
}

export interface SearchArticlesRequest extends ListArticlesRequest {
  q: string
}

export interface ListArticlesResponse {
  articles: Article[]
}

export interface CreateArticleRequest {
  title: string
  summary?: string
  content: string
  coverImage?: string
  categoryID: number
  isTop?: boolean
  /** 由服务端�?token 注入，无需传�?*/
  authorID?: number
}

export interface ListMyArticlesRequest extends ListArticlesRequest {}

export interface GetArticleRequest {
  id: number
}

export interface GetArticleResponse {
  article: Article
}

export interface DeleteArticleRequest {
  id: number
  /** 由服务端�?token 注入，无需传�?*/
  authorID?: number
}

export interface ArticleBoolResponse {
  success: boolean
}
