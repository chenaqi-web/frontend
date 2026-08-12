import { useEffect, useMemo, useRef, useState } from 'react'
import { articleApi } from '@/api/v1/article'
import { categoryApi } from '@/api/v1/category'
import { storageApi } from '@/api/v1/storage'
import MarkdownView from '@/components/common/MarkdownView'
import type { Category, CategoryType } from '@/types/category'
import type { UploadResponse } from '@/types/storage'
import { logRequestError } from '@/utils/request-error'
import './CreateArticleView.css'

type Point = { x: number; y: number }
type ImageSize = { width: number; height: number }

const COVER_RATIO = 16 / 9

export default function CreateArticleView() {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [categoryID, setCategoryID] = useState(0)
  const [categoryGroups, setCategoryGroups] = useState<Array<{ type: CategoryType; categories: Category[] }>>([])
  const [categoryTypeID, setCategoryTypeID] = useState(0)
  const [openCategoryMenu, setOpenCategoryMenu] = useState<'type' | 'category' | null>(null)
  const [cover, setCover] = useState<UploadResponse | null>(null)
  const [contentImages, setContentImages] = useState<UploadResponse[]>([])
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>('edit')
  const [busy, setBusy] = useState<'cover' | 'content' | 'publish' | ''>('')
  const [notice, setNotice] = useState('')
  const [cropUrl, setCropUrl] = useState<string | null>(null)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [cropSize, setCropSize] = useState<ImageSize | null>(null)
  const [cropScale, setCropScale] = useState(1)
  const [cropOffset, setCropOffset] = useState<Point>({ x: 0, y: 0 })
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const cropStageRef = useRef<HTMLDivElement>(null)
  const cropPreviewRef = useRef<HTMLDivElement>(null)
  const cropImageRef = useRef<HTMLImageElement>(null)
  const dragStartRef = useRef<{ point: Point; offset: Point } | null>(null)
  const categorySelectsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void categoryApi.listTypes().then(async ({ types }) => {
      const groups = await Promise.all(types.map((item) => categoryApi.listCategories({ parentID: item.id })))
      setCategoryGroups(types.map((type, index) => ({ type, categories: groups[index].categories ?? [] })))
    }).catch((error: unknown) => { logRequestError('加载文章分类失败', error); setNotice('加载分类失败，请稍后重试') })
  }, [])

  useEffect(() => () => { if (cropUrl) URL.revokeObjectURL(cropUrl) }, [cropUrl])

  useEffect(() => {
    const closeMenu = (event: PointerEvent) => { if (!categorySelectsRef.current?.contains(event.target as Node)) setOpenCategoryMenu(null) }
    document.addEventListener('pointerdown', closeMenu)
    return () => document.removeEventListener('pointerdown', closeMenu)
  }, [])

  const headings = useMemo(() => Array.from(content.matchAll(/^(#{1,3})\s+(.+)$/gm)).map((match) => ({ level: match[1].length, text: match[2].trim(), index: match.index ?? 0 })), [content])
  const wordCount = content.replace(/\s/g, '').length

  const closeCrop = () => {
    setCropUrl(null)
    setCropFile(null)
    setCropSize(null)
    setCropScale(1)
    setCropOffset({ x: 0, y: 0 })
  }

  const openCrop = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setNotice('请选择图片文件'); return }
    setCropFile(file)
    setCropUrl(URL.createObjectURL(file))
    setCropSize(null)
    setCropScale(1)
    setCropOffset({ x: 0, y: 0 })
  }

  const cropMetrics = (scale = cropScale) => {
    const stage = cropStageRef.current
    if (!stage || !cropSize) return null
    const { width, height } = stage.getBoundingClientRect()
    const baseScale = Math.max(width / cropSize.width, height / cropSize.height)
    const imageWidth = cropSize.width * baseScale * scale
    const imageHeight = cropSize.height * baseScale * scale
    return { width, height, imageWidth, imageHeight }
  }

  const clampCropOffset = (next: Point, scale = cropScale) => {
    const metrics = cropMetrics(scale)
    if (!metrics) return next
    const limitX = Math.max(0, (metrics.imageWidth - metrics.width) / 2)
    const limitY = Math.max(0, (metrics.imageHeight - metrics.height) / 2)
    return { x: Math.max(-limitX, Math.min(limitX, next.x)), y: Math.max(-limitY, Math.min(limitY, next.y)) }
  }

  const changeCropScale = (amount: number) => {
    const next = Math.max(0.7, Math.min(2.5, Number((cropScale + amount).toFixed(2))))
    setCropScale(next)
    setCropOffset((current) => clampCropOffset(current, next))
  }

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!cropSize) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStartRef.current = { point: { x: event.clientX, y: event.clientY }, offset: cropOffset }
  }

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current
    if (!start) return
    setCropOffset(clampCropOffset({ x: start.offset.x + event.clientX - start.point.x, y: start.offset.y + event.clientY - start.point.y }))
  }

  const finishDrag = () => { dragStartRef.current = null }

  const confirmCover = async () => {
    const image = cropImageRef.current
    const metrics = cropMetrics()
    if (!image || !cropFile || !metrics) return
    try {
      setBusy('cover')
      const canvas = document.createElement('canvas')
      canvas.width = 1600
      canvas.height = Math.round(canvas.width / COVER_RATIO)
      const context = canvas.getContext('2d')
      if (!context) throw new Error('无法处理图片，请重试')
      const outputScale = canvas.width / metrics.width
      const drawWidth = metrics.imageWidth * outputScale
      const drawHeight = metrics.imageHeight * outputScale
      const drawX = (canvas.width - drawWidth) / 2 + cropOffset.x * outputScale
      const drawY = (canvas.height - drawHeight) / 2 + cropOffset.y * outputScale
      context.drawImage(image, drawX, drawY, drawWidth, drawHeight)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
      if (!blob) throw new Error('图片裁剪失败，请重试')
      const name = `${cropFile.name.replace(/\.[^.]+$/, '') || 'cover'}-cover.jpg`
      setCover(await storageApi.uploadCover(new File([blob], name, { type: 'image/jpeg' })))
      setNotice('封面已上传')
      closeCrop()
    } catch (error) { logRequestError('上传封面失败', error); setNotice('上传封面失败，请稍后重试') } finally { setBusy('') }
  }

  const uploadContentImage = async (file?: File) => {
    if (!file) return
    try {
      setBusy('content')
      const result = await storageApi.uploadContent(file)
      const textarea = editorRef.current
      const start = textarea?.selectionStart ?? content.length
      const markdown = `\n![${file.name}](${result.url})\n`
      setContent((current) => current.slice(0, start) + markdown + current.slice(start))
      setContentImages((current) => [...current, result])
      setNotice('图片已插入正文')
    } catch (error) { logRequestError('上传正文图片失败', error); setNotice('上传图片失败，请稍后重试') } finally { setBusy('') }
  }

  const removeContentImage = async (image: UploadResponse) => {
    try {
      await storageApi.delete({ key: image.key })
      setContent((current) => current.replace(new RegExp(`!?\\[[^\\]]*\\]\\(${image.url.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\)\\n?`, 'g'), ''))
      setContentImages((current) => current.filter((item) => item.key !== image.key))
      setNotice('正文图片已删除')
    } catch (error) { logRequestError('删除正文图片失败', error); setNotice('删除图片失败，请稍后重试') }
  }

  const publish = async () => {
    if (!title.trim() || !content.trim() || !categoryID) { setNotice('请填写标题、正文并选择分类'); return }
    try {
      setBusy('publish')
      const result = await articleApi.create({ title: title.trim(), summary: summary.trim(), content, coverImage: cover?.url, categoryID })
      if (!result.success) throw new Error('文章发布失败')
      setTitle(''); setSummary(''); setContent(''); setCategoryID(0); setCategoryTypeID(0); setCover(null); setContentImages([])
      setNotice('文章已发布')
    } catch (error) { logRequestError('发布文章失败', error); setNotice('发布失败，请稍后重试') } finally { setBusy('') }
  }

  const jumpToHeading = (index: number) => {
    setEditorMode('edit')
    requestAnimationFrame(() => { editorRef.current?.focus(); editorRef.current?.setSelectionRange(index, index); editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) })
  }

  const imageStyle = (() => {
    const metrics = cropMetrics()
    return metrics ? { width: metrics.imageWidth, height: metrics.imageHeight, transform: `translate(calc(-50% + ${cropOffset.x}px), calc(-50% + ${cropOffset.y}px))` } : undefined
  })()
  const previewImageStyle = (() => {
    if (!cropSize || !cropStageRef.current || !cropPreviewRef.current) return undefined
    const stage = cropStageRef.current.getBoundingClientRect()
    const preview = cropPreviewRef.current.getBoundingClientRect()
    const baseScale = Math.max(preview.width / cropSize.width, preview.height / cropSize.height)
    return { width: cropSize.width * baseScale * cropScale, height: cropSize.height * baseScale * cropScale, transform: `translate(calc(-50% + ${cropOffset.x * preview.width / stage.width}px), calc(-50% + ${cropOffset.y * preview.height / stage.height}px))` }
  })()

  return <section className="editor-page">
    {notice && <div className="editor-notice" role="status">{notice}<button type="button" aria-label="关闭提示" onClick={() => setNotice('')}>×</button></div>}
    <div className="editor-layout">
      <main className="editor-canvas">
        <div className="editor-title-row"><div><span>NEW ARTICLE</span><h2>创建文章</h2></div><div className="editor-status"><i />未发布</div></div>
        <label className="editor-field"><span>文章标题</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="输入一个清晰的标题" maxLength={120} /></label>
        <div className="markdown-editor"><div className="editor-toolbar"><div className="mode-switch"><button type="button" className={editorMode === 'edit' ? 'active' : ''} onClick={() => setEditorMode('edit')}>编辑</button><button type="button" className={editorMode === 'preview' ? 'active' : ''} onClick={() => setEditorMode('preview')}>预览</button><button type="button" className={editorMode === 'split' ? 'active' : ''} onClick={() => setEditorMode('split')}>分栏</button></div><label className="image-insert"><input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif" onChange={(event) => { void uploadContentImage(event.target.files?.[0]); event.currentTarget.value = '' }} disabled={busy !== ''} />{busy === 'content' ? '上传中...' : '插入图片'}</label></div>{editorMode === 'preview' ? <MarkdownView content={content || '*预览内容会显示在这里*'} className="editor-preview markdown-body" /> : editorMode === 'split' ? <div className="editor-split"><textarea ref={editorRef} className="markdown-input" value={content} onChange={(event) => setContent(event.target.value)} placeholder="从这里开始写作..." /><MarkdownView content={content || '*预览内容会显示在这里*'} className="editor-preview markdown-body" /></div> : <textarea ref={editorRef} className="markdown-input" value={content} onChange={(event) => setContent(event.target.value)} placeholder={'从这里开始写作...\n\n## 第一个章节\n\n支持 Markdown，也可以通过右上角插入图片。'} />}</div>
        <section className="article-details" aria-label="文章发布信息">
          <div className="details-intro"><span>ARTICLE DETAILS</span><h3>补充发布信息</h3><p>完成正文后，再选择分类、补充摘要和封面。</p></div>
          <div className="details-form">
            <div className="details-row media-row"><div className="details-label"><span>添加封面</span><small>16:9，可裁剪</small></div><div className="details-control media-controls"><label className={cover ? 'compact-cover has-cover' : 'compact-cover'}>{cover ? <img src={cover.url} alt="文章封面预览" /> : <div><b>+</b><span>从本地上传</span></div>}<input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif" onChange={(event) => { openCrop(event.target.files?.[0]); event.currentTarget.value = '' }} disabled={busy !== ''} /><em>{cover ? '重新裁剪' : '选择图片'}</em></label></div></div>
            <label className="details-row"><span className="details-label">文章摘要</span><span className="details-control"><textarea className="summary-input" value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="用一两句话概括文章内容（可选）" maxLength={240} /></span></label>
            <div className="details-row"><span className="details-label">文章分类</span><div className="details-control category-selects" ref={categorySelectsRef}><div className="category-select"><span>一级分类</span><button type="button" aria-haspopup="listbox" aria-expanded={openCategoryMenu === 'type'} onClick={() => setOpenCategoryMenu((current) => current === 'type' ? null : 'type')}>{categoryGroups.find((group) => group.type.id === categoryTypeID)?.type.name ?? '选择一级分类'}<i aria-hidden="true" /></button>{openCategoryMenu === 'type' && <div className="category-select-menu" role="listbox">{categoryGroups.length ? categoryGroups.map((group) => <button type="button" role="option" aria-selected={group.type.id === categoryTypeID} className={group.type.id === categoryTypeID ? 'selected' : ''} key={group.type.id} onClick={() => { setCategoryTypeID(group.type.id); setCategoryID(0); setOpenCategoryMenu(null) }}>{group.type.name}</button>) : <p>暂无一级分类</p>}</div>}</div><div className="category-select"><span>二级分类</span><button type="button" disabled={!categoryTypeID} aria-haspopup="listbox" aria-expanded={openCategoryMenu === 'category'} onClick={() => setOpenCategoryMenu((current) => current === 'category' ? null : 'category')}>{categoryGroups.find((group) => group.type.id === categoryTypeID)?.categories.find((item) => item.id === categoryID)?.name ?? (categoryTypeID ? '选择二级分类' : '请先选择一级分类')}<i aria-hidden="true" /></button>{openCategoryMenu === 'category' && <div className="category-select-menu" role="listbox">{categoryGroups.find((group) => group.type.id === categoryTypeID)?.categories.length ? categoryGroups.find((group) => group.type.id === categoryTypeID)?.categories.map((item) => <button type="button" role="option" aria-selected={item.id === categoryID} className={item.id === categoryID ? 'selected' : ''} key={item.id} onClick={() => { setCategoryID(item.id); setOpenCategoryMenu(null) }}>{item.name}</button>) : <p>暂无二级分类</p>}</div>}</div></div></div>
            <div className="details-row publish-row"><span className="details-label">发布文章</span><div className="details-control detail-publish"><div className="article-metrics"><span>{wordCount}<small>字</small></span><span>{headings.length}<small>章节</small></span><span>{contentImages.length}<small>图片</small></span></div><button className="publish-button" type="button" disabled={busy !== ''} onClick={() => void publish()}>{busy === 'publish' ? '正在发布...' : '发布文章'}</button></div></div>
          </div>
        </section>
      </main>
      <aside className="editor-aside"><nav className="toc-panel" aria-label="文章目录"><div className="aside-heading"><span>OUTLINE</span><h3>文章目录</h3></div>{headings.length ? headings.map((heading, index) => <button type="button" key={`${heading.index}-${index}`} className={`toc-level-${heading.level}`} onClick={() => jumpToHeading(heading.index)}><i>{String(index + 1).padStart(2, '0')}</i>{heading.text}</button>) : <p>使用 `#`、`##` 或 `###` 标题后，目录会自动生成。</p>}</nav><section className="article-images-panel" aria-label="文章图片"><div className="aside-heading"><span>ARTICLE IMAGES</span><h3>文章图片</h3></div>{contentImages.length ? <div>{contentImages.map((image) => <article key={image.key}><img src={image.url} alt="正文上传图片" /><button type="button" aria-label="删除图片" onClick={() => void removeContentImage(image)}>×</button></article>)}</div> : <p>通过编辑器右上角插入的图片会显示在这里。</p>}</section></aside>
    </div>
    {cropUrl && <div className="crop-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && busy !== 'cover') closeCrop() }}><section className="crop-modal" role="dialog" aria-modal="true" aria-labelledby="crop-title"><header><div><span>IMAGE EDITOR</span><h3 id="crop-title">图片编辑</h3></div><button type="button" aria-label="关闭图片编辑" disabled={busy === 'cover'} onClick={closeCrop}>×</button></header><div className="crop-workspace"><div className="crop-stage" ref={cropStageRef} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag}><img ref={cropImageRef} src={cropUrl} alt="待裁剪封面" draggable={false} style={imageStyle} onLoad={(event) => { const image = event.currentTarget; setCropSize({ width: image.naturalWidth, height: image.naturalHeight }) }} /></div><div className="crop-side"><span>封面预览</span><div className="crop-preview" ref={cropPreviewRef}><img src={cropUrl} alt="封面裁剪预览" style={previewImageStyle} /></div><div className="zoom-controls"><span>缩放</span><div><button type="button" aria-label="缩小图片" onClick={() => changeCropScale(-0.1)} disabled={cropScale <= 0.7}>−</button><output>{Math.round(cropScale * 100)}%</output><button type="button" aria-label="放大图片" onClick={() => changeCropScale(0.1)} disabled={cropScale >= 2.5}>+</button></div></div></div></div><footer><p>拖动图片调整位置，裁剪区域固定为 16:9。</p><div><button type="button" className="crop-cancel" disabled={busy === 'cover'} onClick={closeCrop}>取消</button><button type="button" className="crop-confirm" disabled={!cropSize || busy === 'cover'} onClick={() => void confirmCover()}>{busy === 'cover' ? '上传中...' : '确认上传'}</button></div></footer></section></div>}
  </section>
}
