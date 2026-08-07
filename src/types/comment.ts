export interface CommentItem {
  id: number
  articleId: number
  userId: number
  parentId: number
  rootId: number
  replyToId: number
  content: string
  likeCount: number
  childCount: number
  createdAt: string
  userName: string
  userAvatar: string
  isLiked: boolean
}

export interface CreateCommentRequest {
  articleId: number
  userId: number
  content: string
}

export interface CreateReplyRequest {
  articleId: number
  parentId: number
  userId: number
  replyToId?: number
  content: string
}

export interface DeleteCommentRequest {
  id: number
  userId: number
}

export interface GetArticleCommentsRequest {
  articleId: number
  page?: number
  size?: number
}

export interface GetCommentRepliesRequest {
  parentId: number
  page?: number
  size?: number
}

export interface CommentListResponse {
  comments: CommentItem[]
  page: number
  size: number
}

export interface CommentRepliesResponse {
  replies: CommentItem[]
  page: number
  size: number
}

export interface CommentBoolResponse {
  success: boolean
}
