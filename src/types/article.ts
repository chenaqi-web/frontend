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
