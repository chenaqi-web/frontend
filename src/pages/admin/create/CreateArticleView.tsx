import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { articleApi } from '@/api/article'
import { categoryApi } from '@/api/category'
import { storageApi } from '@/api/storage'
import MarkdownView from '@/components/common/MarkdownView'
import type { Category, CategoryType } from '@/types/category'
import { resolveStorageUrl } from '@/utils/storage'

interface Props {
  userID: number
  token: string
  onCreated: () => void
}

interface SelectOption {
  value: string
  label: string
}

function CategorySelect({ value, options, placeholder, disabled, onChange }: {
  value: string
  options: SelectOption[]
  placeholder: string
  disabled?: boolean
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <div className="category-select" onBlur={() => setOpen(false)}>
      <button type="button" className="category-select-trigger" disabled={disabled} aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        <span>{selected?.label ?? placeholder}</span><i aria-hidden />
      </button>
      {open && !disabled && (
        <div className="category-select-menu" role="listbox">
          <button type="button" className={!value ? 'selected' : ''} onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange(''); setOpen(false) }}>{placeholder}</button>
          {options.map((option) => (
            <button type="button" className={value === option.value ? 'selected' : ''} key={option.value} onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange(option.value); setOpen(false) }}>{option.label}</button>
          ))}
        </div>
      )}
    </div>
  )
}

function ArticleOutline({ content }: { content: string }) {
  const items = content.split('\n')
    .map((line) => line.match(/^(#{1,2})\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({ level: match[1].length, text: match[2].trim() }))

  return (
    <aside className="create-outline" aria-label="文章目录">
      <strong>目录</strong>
      {items.length ? (
        <nav>
          {items.map((item, index) => <div className={`outline-level-${item.level}`} key={`${item.text}-${index}`}>{item.text}</div>)}
        </nav>
      ) : (
        <p>为文章添加一级或二级标题后，这里将自动生成目录。</p>
      )}
    </aside>
  )
}

export default function CreateArticleView({ userID, token, onCreated }: Props) {
  const [types, setTypes] = useState<CategoryType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [typeID, setTypeID] = useState('')
  const [categoryID, setCategoryID] = useState('')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editorMode, setEditorMode] = useState<'write' | 'preview' | 'split'>('split')
  const contentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    categoryApi.listTypes(token)
      .then((result) => setTypes(result.types ?? []))
      .catch(() => setMessage('分类加载失败，请稍后重试'))
  }, [token])

  const selectType = async (value: string) => {
    setTypeID(value)
    setCategoryID('')
    setCategories([])
    if (!value) return
    try {
      const result = await categoryApi.listCategories({ parentID: Number(value) }, token)
      setCategories(result.categories ?? [])
    } catch {
      setMessage('子分类加载失败，请稍后重试')
    }
  }

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>, target: 'cover' | 'content') => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMessage('只能上传图片文件')
      return
    }

    setUploading(true)
    setMessage('')
    try {
      const uploaded = await storageApi.upload(file, token)
      const uploadedUrl = resolveStorageUrl(uploaded.url || uploaded.key)
      if (!uploadedUrl) throw new Error('上传接口没有返回有效文件地址')
      if (target === 'cover') {
        setCoverImage(uploadedUrl)
      } else {
        const editor = contentRef.current
        const start = editor?.selectionStart ?? content.length
        const end = editor?.selectionEnd ?? content.length
        const markdownImage = `![${file.name}](${uploadedUrl})`
        setContent((current) => `${current.slice(0, start)}${markdownImage}${current.slice(end)}`)
      }
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : '图片上传失败，请稍后重试')
    } finally {
      setUploading(false)
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userID || !categoryID) {
      setMessage('请选择二级分类后再发布')
      return
    }
    setSubmitting(true)
    setMessage('')
    try {
      const result = await articleApi.create({
        authorID: userID,
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        coverImage: resolveStorageUrl(coverImage.trim()),
        categoryID: Number(categoryID),
      }, token)
      if (!result.success) throw new Error('发布失败')
      onCreated()
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : '发布失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="create-page-layout">
      <section className="admin-card create-article-view">
        <div className="card-title">
          <div>
            <h2>创作内容</h2>
            <small>使用 Markdown 编写文章，可上传封面和插入正文图片。</small>
          </div>
        </div>
        <form className="create-article-form" onSubmit={submit}>
        <section className="create-title-bar">
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} required placeholder="请输入文章标题（5～100个字）" aria-label="文章标题" />
        </section>
        <div className="create-writing-shell">
          <div className="markdown-editor-header">
            <span>正文（Markdown）</span>
            <div className="editor-mode-switcher" role="tablist" aria-label="编辑器显示模式">
              <button type="button" className={editorMode === 'write' ? 'active' : ''} onClick={() => setEditorMode('write')}>编写</button>
              <button type="button" className={editorMode === 'preview' ? 'active' : ''} onClick={() => setEditorMode('preview')}>查看</button>
              <button type="button" className={editorMode === 'split' ? 'active' : ''} onClick={() => setEditorMode('split')}>各一半</button>
              <label className="upload-button upload-button-small">插入图片<input type="file" accept="image/*" onChange={(event) => void uploadImage(event, 'content')} /></label>
            </div>
          </div>
          <div className="create-writing-workspace">
            <div className={`create-editor-split editor-mode-${editorMode}`}>
            {(editorMode === 'write' || editorMode === 'split') && (
              <div className="create-editor-pane">
                <div className="create-pane-label">编写</div>
                <textarea ref={contentRef} className="create-article-content" value={content} onChange={(event) => setContent(event.target.value)} required={editorMode === 'write'} placeholder={'# 开始创作\n\n支持 Markdown 语法。点击“插入图片”后会自动写入图片语法。'} />
              </div>
            )}
            {(editorMode === 'preview' || editorMode === 'split') && (
              <div className="create-preview-pane">
                <div className="create-pane-label">查看</div>
                <div className="create-preview-scroll">
                  <MarkdownView content={content || '开始输入内容后，这里会显示文章预览。'} className="create-markdown-preview markdown-body" />
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
        <section className="create-article-basics">
          <label>文章摘要<textarea value={summary} onChange={(event) => setSummary(event.target.value)} maxLength={300} placeholder="摘要会显示在文章列表，帮助读者快速了解内容" /></label>
          <div className="create-article-grid">
            <label>一级分类<CategorySelect value={typeID} options={types.map((type) => ({ value: type.id, label: type.name }))} placeholder="请选择一级分类" onChange={(value) => void selectType(value)} /></label>
            <label>二级分类<CategorySelect value={categoryID} options={categories.map((category) => ({ value: category.id, label: category.name }))} placeholder="请选择二级分类" disabled={!typeID || !categories.length} onChange={setCategoryID} /></label>
          </div>
          <div className="create-cover-row">
            <div className="create-cover-field">
              <span className="create-field-label">文章封面（可选）</span>
              <label className={`create-cover-frame ${coverImage ? 'has-cover' : ''}`}>
                {coverImage ? <img src={coverImage} alt="文章封面预览" /> : <><b>＋</b><span>{uploading ? '封面上传中…' : '点击上传封面'}</span><small>建议尺寸 16:9</small></>}
                <input type="file" accept="image/*" onChange={(event) => void uploadImage(event, 'cover')} disabled={uploading} />
              </label>
              {coverImage && <label className="cover-replace-button">重新选择图片<input type="file" accept="image/*" onChange={(event) => void uploadImage(event, 'cover')} disabled={uploading} /></label>}
            </div>
          </div>
        </section>
        <div className="create-article-footer"><span>{message || (uploading ? '图片上传中…' : '')}</span><button type="submit" disabled={submitting || uploading}>{submitting ? '发布中…' : '发布博客'}</button></div>
        </form>
      </section>
      <ArticleOutline content={content} />
    </div>
  )
}
