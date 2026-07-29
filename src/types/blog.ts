import type { PageRequest } from '@/types/api'

export interface BlogCategory {
  id: string
  name: string
  slug: string
  color?: string
  articleCount?: number
}

export interface BlogAuthor {
  id: string
  nickname: string
  avatar?: string
}

export interface BlogPost {
  id: string
  title: string
  summary: string
  content?: string
  cover?: string
  category: BlogCategory
  author: BlogAuthor
  tags: string[]
  commentCount: number
  likeCount: number
  publishedAt: string
}

export interface BlogComment {
  id: string
  postId: string
  author: BlogAuthor
  content: string
  createdAt: string
  replies?: BlogComment[]
}

export interface BlogListRequest extends PageRequest {
  categoryId?: string
  keyword?: string
}

export interface CreateCommentRequest {
  content: string
  parentId?: string
}
