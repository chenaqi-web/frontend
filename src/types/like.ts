import type { Article } from '@/types/article'

export interface LikeRequest { userId?: number; objectType: string; objectId: number }
export interface UserLikeListRequest { userId?: number; objectType: string; page?: number; pageSize?: number }
export interface LikeBoolResponse { success: boolean }
export interface LikeStatus { objectId: number; isLiked: boolean }
export interface UserLikeListResponse { articles: Article[]; total: number }
