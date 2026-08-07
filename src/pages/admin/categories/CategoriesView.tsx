import { useCallback, useEffect, useState } from 'react'
import { categoryApi } from '@/api/category'
import type { Category, CategoryType } from '@/types/category'
import AdminConfirmDialog from '@/pages/admin/components/AdminConfirmDialog'

interface CategoriesState {
  types: CategoryType[]
  children: Category[]
  selectedType: string
  notice: string
  loadChildren: (id: string) => Promise<void>
  addType: (name: string) => Promise<void>
  deleteType: (id: string) => Promise<void>
  addCategory: (name: string) => Promise<void>
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

  const addType = useCallback(async (name: string) => {
    if (!name.trim()) return
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

  const addCategory = useCallback(async (name: string) => {
    if (!selectedType || !name.trim()) return
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

type ModalMode = 'type' | 'category'
type DeleteTarget = { id: string; kind: 'type' | 'category' } | null

interface Props {
  types: CategoryType[]
  selected: string
  categories: Category[]
  onSelect: (id: string) => void | Promise<void>
  onAddType: (value: string) => void | Promise<void>
  onDeleteType: (id: string) => void | Promise<void>
  onAddCategory: (value: string) => void | Promise<void>
  onDeleteCategory: (id: string) => void | Promise<void>
}

export default function CategoriesView({
  types, selected, categories, onSelect, onAddType, onDeleteType, onAddCategory, onDeleteCategory,
}: Props) {
  const [modalMode, setModalMode] = useState<ModalMode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null)
  const [name, setName] = useState('')
  const selectedName = types.find((type) => type.id === selected)?.name ?? '请选择'
  const modalTitle = modalMode === 'type' ? '新增一级分类' : '新增子分类'

  const openModal = (mode: ModalMode) => {
    setName('')
    setModalMode(mode)
  }

  const closeModal = () => {
    setModalMode(null)
    setName('')
  }

  const submitModal = async () => {
    const value = name.trim()
    if (!value || !modalMode) return
    if (modalMode === 'type') await onAddType(value)
    else await onAddCategory(value)
    closeModal()
  }

  return (
    <div className="admin-card category-admin">
      <div className="card-title">
        <div>
          <h2>分类管理</h2>
          <small>一级与二级分类的新增、查询、删除</small>
        </div>
        <button type="button" className="minimal-button" onClick={() => openModal('type')}>＋ 新增一级分类</button>
      </div>

      <div className="type-grid">
        {types.map((type) => (
          <div className={`type-item ${selected === type.id ? 'selected' : ''}`} key={type.id}>
            <button type="button" onClick={() => onSelect(type.id)}>
              <b>{type.name}</b>
              <small>一级分类</small>
            </button>
            <button type="button" className="category-delete" title="删除一级分类" onClick={() => setDeleteTarget({ id: type.id, kind: 'type' })}>×</button>
          </div>
        ))}
      </div>

      <div className="children-box">
        <div className="children-title">
          <h3>{selectedName} 的子分类</h3>
          <button type="button" className="minimal-button" disabled={!selected} onClick={() => openModal('category')}>＋ 新增子分类</button>
        </div>
        {categories.length ? (
          categories.map((category) => (
            <span key={category.id}>
              {category.name}{' '}
              <button type="button" title="删除子分类" onClick={() => setDeleteTarget({ id: category.id, kind: 'category' })}>×</button>
            </span>
          ))
        ) : (
          <p>这里还没有子分类，可以点击右上角新增。</p>
        )}
      </div>

      {deleteTarget && (
        <AdminConfirmDialog
          title={deleteTarget.kind === 'type' ? '删除一级分类' : '删除子分类'}
          message={deleteTarget.kind === 'type' ? '删除一级分类可能影响其子分类，确定继续吗？' : '删除后无法恢复，确定要删除这个子分类吗？'}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (deleteTarget.kind === 'type') await onDeleteType(deleteTarget.id)
            else await onDeleteCategory(deleteTarget.id)
            setDeleteTarget(null)
          }}
        />
      )}

      {modalMode && (
        <div className="category-modal-backdrop" role="presentation" onMouseDown={closeModal}>
          <div className="category-modal" role="dialog" aria-modal="true" aria-labelledby="category-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="category-modal-header">
              <div>
                <span className="category-modal-eyebrow">分类管理</span>
                <h3 id="category-modal-title">{modalTitle}</h3>
              </div>
              <button type="button" className="category-modal-close" aria-label="关闭弹窗" onClick={closeModal}>×</button>
            </div>
            <label className="category-modal-label" htmlFor="category-name">分类名称</label>
            <input
              id="category-name"
              className="category-modal-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void submitModal()
                if (event.key === 'Escape') closeModal()
              }}
              placeholder={modalMode === 'type' ? '例如：技术交流' : '例如：前端开发'}
              autoFocus
              maxLength={30}
            />
            <div className="category-modal-actions">
              <button type="button" className="category-modal-cancel" onClick={closeModal}>取消</button>
              <button type="button" className="category-modal-submit" disabled={!name.trim()} onClick={() => void submitModal()}>确认新增</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
