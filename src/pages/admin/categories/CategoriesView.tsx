import { useCallback, useEffect, useState } from 'react'
import { categoryApi } from '@/api/category'
import type { Category, CategoryType } from '@/types/category'

interface CategoriesState {
  types: CategoryType[]
  children: Category[]
  selectedType: string
  notice: string
  loadChildren: (id: string) => Promise<void>
  addType: () => Promise<void>
  deleteType: (id: string) => Promise<void>
  addCategory: () => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

export function useCategories(token: string): CategoriesState {
  const [types, setTypes] = useState<CategoryType[]>([])
  const [children, setChildren] = useState<Category[]>([])
  const [selectedType, setSelectedType] = useState('')
  const [notice, setNotice] = useState('')

  const refreshTypes = useCallback(async () => {
    const res = await categoryApi.listTypes(token)
    setTypes((res.types ?? []).map((t) => ({ ...t, id: String(t.id) })))
  }, [token])

  const loadChildren = useCallback(async (id: string) => {
    setSelectedType(id)
    try {
      const res = await categoryApi.listCategories({ parentID: Number(id) }, token)
      setChildren((res.categories ?? []).map((c) => ({
        ...c,
        id: String(c.id),
        parentID: String(c.parentID),
      })))
    } catch {
      setChildren([])
      setNotice('子分类加载失败')
    }
  }, [token])

  useEffect(() => {
    categoryApi
      .listTypes(token)
      .then((res) => {
        const nextTypes = (res.types ?? []).map((t) => ({ ...t, id: String(t.id) }))
        setTypes(nextTypes)
        if (nextTypes[0]) {
          setSelectedType(nextTypes[0].id)
          void loadChildren(nextTypes[0].id)
        }
      })
      .catch(() => setNotice('一级分类加载失败，请检查分类服务'))
  }, [token, loadChildren])

  const addType = useCallback(async () => {
    const name = window.prompt('请输入一级分类名称')?.trim()
    if (!name) return
    try {
      const res = await categoryApi.createType({ name }, token)
      if (!res.success) throw new Error()
      await refreshTypes()
      setNotice('一级分类已添加')
    } catch {
      setNotice('新增一级分类失败')
    }
  }, [token, refreshTypes])

  const deleteType = useCallback(async (id: string) => {
    if (!window.confirm('删除一级分类可能影响其子分类，确定继续吗？')) return
    try {
      const res = await categoryApi.deleteType({ id: Number(id) }, token)
      if (!res.success) throw new Error()
      await refreshTypes()
      setChildren([])
      setNotice('一级分类已删除')
    } catch {
      setNotice('删除一级分类失败')
    }
  }, [token, refreshTypes])

  const addCategory = useCallback(async () => {
    if (!selectedType) return
    const name = window.prompt('请输入子分类名称')?.trim()
    if (!name) return
    try {
      const res = await categoryApi.createCategory({ parentID: Number(selectedType), name }, token)
      if (!res.success) throw new Error()
      await loadChildren(selectedType)
      setNotice('子分类已添加')
    } catch {
      setNotice('新增子分类失败')
    }
  }, [selectedType, token, loadChildren])

  const deleteCategory = useCallback(async (id: string) => {
    if (!window.confirm('确定删除这个子分类吗？')) return
    try {
      const res = await categoryApi.deleteCategory({ id: Number(id) }, token)
      if (!res.success) throw new Error()
      await loadChildren(selectedType)
      setNotice('子分类已删除')
    } catch {
      setNotice('删除子分类失败')
    }
  }, [selectedType, token, loadChildren])

  return { types, children, selectedType, notice, loadChildren, addType, deleteType, addCategory, deleteCategory }
}

const TYPE_ICONS = ['🌸', '🍬', '🎮', '⭐', '☁']

interface Props {
  types: CategoryType[]
  selected: string
  categories: Category[]
  onSelect: (id: string) => void
  onAddType: () => void
  onDeleteType: (id: string) => void
  onAddCategory: () => void
  onDeleteCategory: (id: string) => void
}

export default function CategoriesView({
  types, selected, categories, onSelect, onAddType, onDeleteType, onAddCategory, onDeleteCategory,
}: Props) {
  const selectedName = types.find((type) => type.id === selected)?.name ?? '请选择'

  return (
    <div className="admin-card category-admin">
      <div className="card-title">
        <div>
          <h2>分类管理</h2>
          <small>一级与二级分类的新增、查询、删除</small>
        </div>
        <button type="button" className="minimal-button" onClick={onAddType}>＋ 新增一级分类</button>
      </div>

      <div className="type-grid">
        {types.map((type) => (
          <div className={`type-item ${selected === type.id ? 'selected' : ''}`} key={type.id}>
            <button type="button" onClick={() => onSelect(type.id)}>
              <span>{TYPE_ICONS[Number(type.id) % TYPE_ICONS.length]}</span>
              <b>{type.name}</b>
              <small>一级分类</small>
            </button>
            <button type="button" className="category-delete" title="删除一级分类" onClick={() => onDeleteType(type.id)}>×</button>
          </div>
        ))}
      </div>

      <div className="children-box">
        <div className="children-title">
          <h3>↳ {selectedName} 的子分类</h3>
          <button type="button" className="minimal-button" disabled={!selected} onClick={onAddCategory}>＋ 新增子分类</button>
        </div>
        {categories.length ? (
          categories.map((category) => (
            <span key={category.id}>
              {category.name}{' '}
              <button type="button" title="删除子分类" onClick={() => onDeleteCategory(category.id)}>×</button>
            </span>
          ))
        ) : (
          <p>这里还没有子分类，可以点击右上角新增。</p>
        )}
      </div>
    </div>
  )
}
