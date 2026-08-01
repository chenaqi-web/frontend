export interface CategoryType {
  id: string
  name: string
}

export interface Category {
  id: string
  parentID: string
  name: string
}

export interface CreateTypeRequest { name: string }
export interface CreateTypeResponse { success: boolean }
export interface DeleteTypeRequest { id: number }
export interface DeleteTypeResponse { success: boolean }
export interface ListTypesRequest {}
export interface ListTypesResponse { types: CategoryType[] }

export interface CreateCategoryRequest {
  parentID: number
  name: string
}
export interface CreateCategoryResponse { success: boolean }
export interface DeleteCategoryRequest { id: number }
export interface DeleteCategoryResponse { success: boolean }
export interface ListCategoriesRequest { parentID: number }
export interface ListCategoriesResponse { categories: Category[] }
