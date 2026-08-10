import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { articleApi } from '@/api/v1/article'
import { commentApi } from '@/api/v1/comment'
import { likeApi } from '@/api/v1/like'
import AppLink from '@/components/common/AppLink'
import MarkdownView from '@/components/common/MarkdownView'
import { navigate } from '@/hooks/usePathname'
import type { Article } from '@/types/article'
import type { CommentItem } from '@/types/comment'
import { resolveStorageUrl } from '@/utils/storage'
import './BlogPage.css'

const formatDateTime = (value: string | number) => {
  const date = typeof value === 'number' ? new Date(value > 1_000_000_000_000 ? value : value * 1000) : new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const Avatar = ({ src, name, small = false }: { src?: string; name: string; small?: boolean }) => (
  <span className={small ? 'front-comment-avatar small' : 'front-comment-avatar'}>
    {src ? <img src={resolveStorageUrl(src)} alt="" /> : name.slice(0, 1).toUpperCase()}
  </span>
)

function ActionIcon({ name }: { name: 'view' | 'comment' | 'like' | 'top' }) {
  const paths = name === 'view'
    ? <><path d="M2.5 12s3.4-5 9.5-5 9.5 5 9.5 5-3.4 5-9.5 5-9.5-5-9.5-5Z" /><circle cx="12" cy="12" r="2.5" /></>
    : name === 'comment'
      ? <><path d="M4 5.5h16v11H9l-5 3v-14Z" /><path d="M8 10h8M8 13h5" /></>
      : name === 'like'
        ? <path d="M12 20.5 4.8 13.7A4.6 4.6 0 0 1 11.3 7L12 7.8l.7-.8a4.6 4.6 0 0 1 6.5 6.7L12 20.5Z" />
        : <><path d="m6 10 6-6 6 6" /><path d="M12 4v16" /></>
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
}

export default function BlogDetailPage() {
  const articleID = Number(window.location.pathname.split('/').filter(Boolean).at(-1))
  const [article, setArticle] = useState<Article | null>(null)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [replies, setReplies] = useState<Record<number, CommentItem[]>>({})
  const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({})
  const [commentText, setCommentText] = useState('')
  const [replyTarget, setReplyTarget] = useState<CommentItem | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [liked, setLiked] = useState(false)
  const [liking, setLiking] = useState(false)
  const loggedIn = Boolean(localStorage.getItem('renai_access_token'))
  const currentUser = JSON.parse(localStorage.getItem('renai_current_user') ?? '{}') as { username?: string; avatar?: string }

  const loadComments = async () => {
    if (!articleID) return
    setCommentsLoading(true)
    try {
      const result = await commentApi.list({ articleId: articleID, page: 1, size: 50 })
      setComments(result.comments ?? [])
    } catch (reason) {
      setMessage((reason as Error).message)
    } finally {
      setCommentsLoading(false)
    }
  }

  useEffect(() => {
    if (!articleID) {
      setLoading(false)
      return
    }
    void articleApi.detail({ id: articleID }).then((result) => setArticle(result.article)).catch((reason: Error) => setMessage(reason.message)).finally(() => setLoading(false))
    void loadComments()
    if (loggedIn) {
      void likeApi.list({ objectType: 'article', page: 1, pageSize: 100 })
        .then((result) => setLiked((result.articles ?? []).some((item) => item.id === articleID)))
        .catch(() => undefined)
    }
  }, [articleID, loggedIn])

  const headings = useMemo(() => article ? Array.from(article.content.matchAll(/^(#{1,3})\s+(.+)$/gm)).map((match) => ({ level: match[1].length, text: match[2].trim() })) : [], [article])
  const readingMinutes = useMemo(() => Math.max(1, Math.ceil((article?.content.replace(/[#*`_>\s]/g, '').length ?? 0) / 450)), [article])
  const jumpToHeading = (index: number) => document.querySelectorAll('.front-article-body h1,.front-article-body h2,.front-article-body h3').item(index)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const submitComment = async (event: FormEvent) => {
    event.preventDefault()
    if (!loggedIn) return navigate('/login')
    if (!commentText.trim()) return
    try {
      setSubmitting(true)
      const result = await commentApi.create({ articleId: articleID, content: commentText.trim() })
      if (!result.success) throw new Error('评论发布失败')
      setCommentText('')
      setMessage('评论已发布')
      await loadComments()
    } catch (reason) {
      setMessage((reason as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleReplies = async (comment: CommentItem) => {
    if (expandedReplies[comment.id]) {
      setExpandedReplies((current) => ({ ...current, [comment.id]: false }))
      return
    }
    setExpandedReplies((current) => ({ ...current, [comment.id]: true }))
    if (replies[comment.id]) return
    try {
      const result = await commentApi.replies({ parentId: comment.id, page: 1, size: 50 })
      setReplies((current) => ({ ...current, [comment.id]: result.replies ?? [] }))
    } catch (reason) {
      setMessage((reason as Error).message)
    }
  }

  const submitReply = async (event: FormEvent) => {
    event.preventDefault()
    if (!replyTarget || !replyText.trim()) return
    if (!loggedIn) return navigate('/login')
    try {
      setSubmitting(true)
      const result = await commentApi.reply({ articleId: articleID, parentId: replyTarget.rootId || replyTarget.id, replyToId: replyTarget.id, content: replyText.trim() })
      if (!result.success) throw new Error('回复发布失败')
      setReplyText('')
      setReplyTarget(null)
      await loadComments()
    } catch (reason) {
      setMessage((reason as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleArticleLike = async () => {
    if (!loggedIn) return navigate('/login')
    if (!article || liking) return
    setLiking(true)
    try {
      const result = liked
        ? await likeApi.cancelThumbUp({ objectType: 'article', objectId: article.id })
        : await likeApi.thumbUp({ objectType: 'article', objectId: article.id })
      if (!result.success) throw new Error('点赞操作失败')
      setArticle({ ...article, likeCount: Math.max(0, article.likeCount + (liked ? -1 : 1)) })
      setLiked(!liked)
    } catch (reason) {
      setMessage((reason as Error).message)
    } finally {
      setLiking(false)
    }
  }

  if (loading) return <main className="front-detail-state">正在打开文章...</main>
  if (!article) return <main className="front-detail-state"><strong>没有找到这篇文章</strong><AppLink to="/blog">返回博客列表</AppLink>{message && <span>{message}</span>}</main>

  return <main className="front-detail-page">
    <article className="front-reading-column">
      <header className="front-detail-header">
        <AppLink to="/blog" className="front-back-link">返回博客</AppLink>
        <h1>{article.title}</h1>
        <div className="front-detail-author"><Avatar src={article.authorAvatar} name={article.authorName || 'R'} /><div><strong>{article.authorName || 'Renai 成员'}</strong><span>{formatDateTime(article.createdAt)} · 约 {readingMinutes} 分钟阅读</span></div></div>
      </header>
      {article.coverImage && <img className="front-detail-cover" src={resolveStorageUrl(article.coverImage)} alt={`${article.title}封面`} />}
      <section className="front-article-body"><MarkdownView content={article.content} /></section>
      <section className="front-comments" id="comments">
        <header><div><span>一起交流</span><h2>评论</h2></div><strong>{comments.length} 条</strong></header>
        {loggedIn ? <form className="front-comment-form" onSubmit={submitComment}><Avatar src={currentUser.avatar} name={currentUser.username || '我'} /><div><label htmlFor="new-comment">写下你的想法</label><textarea id="new-comment" value={commentText} maxLength={1000} onChange={(event) => setCommentText(event.target.value)} placeholder="友善交流，让讨论更有价值。" /><footer><span>{commentText.length}/1000</span><button type="submit" disabled={submitting || !commentText.trim()}>{submitting ? '发布中...' : '发布评论'}</button></footer></div></form> : <div className="front-comment-login"><span>登录后参与评论，与社团成员继续讨论。</span><button type="button" onClick={() => navigate('/login')}>去登录</button></div>}
        {message && <p className="front-comment-message" role="status">{message}</p>}
        {commentsLoading ? <div className="front-comments-state">正在加载评论...</div> : comments.length === 0 ? <div className="front-comments-state"><strong>还没有评论</strong><span>成为第一个参与讨论的人。</span></div> : <div className="front-comment-list">{comments.map((comment) => <article className="front-comment" key={comment.id}><Avatar src={comment.userAvatar} name={comment.userName || 'R'} /><div><header><strong>{comment.userName || 'Renai 成员'}</strong><time>{formatDateTime(comment.createdAt)}</time></header><p>{comment.content}</p><div className="front-comment-actions"><button type="button" onClick={() => loggedIn ? setReplyTarget(comment) : navigate('/login')}>回复</button>{comment.childCount > 0 && <button type="button" onClick={() => void toggleReplies(comment)}>{expandedReplies[comment.id] ? '收起回复' : `查看 ${comment.childCount} 条回复`}</button>}</div>{expandedReplies[comment.id] && <div className="front-replies">{replies[comment.id] ? replies[comment.id].map((reply) => <article key={reply.id}><Avatar src={reply.userAvatar} name={reply.userName || 'R'} small /><div><header><strong>{reply.userName || 'Renai 成员'}</strong><time>{formatDateTime(reply.createdAt)}</time></header><p>{reply.content}</p><button type="button" onClick={() => loggedIn ? setReplyTarget(reply) : navigate('/login')}>回复</button></div></article>) : <span>正在加载回复...</span>}</div>}</div></article>)}</div>}
      </section>
    </article>
    <aside className="front-detail-aside">
      <nav aria-label="文章目录"><span>文章导航</span><h2>目录</h2>{headings.length ? headings.map((heading, index) => <button type="button" className={`level-${heading.level}`} key={`${heading.text}-${index}`} onClick={() => jumpToHeading(index)}>{heading.text}</button>) : <p>文章暂无章节标题</p>}</nav>
      <div className="front-article-actions" aria-label="文章互动"><span className="front-action-item" title={`${article.viewCount} 次浏览`}><ActionIcon name="view" /><b>{article.viewCount}</b></span><a className="front-action-item" href="#comments" aria-label={`${article.commentCount} 条评论`} title={`${article.commentCount} 条评论`}><ActionIcon name="comment" /><b>{article.commentCount}</b></a><button type="button" className={liked ? 'liked' : ''} disabled={liking} onClick={() => void toggleArticleLike()} aria-label={`${article.likeCount} 个点赞`} title={liked ? '取消点赞' : '点赞'}><ActionIcon name="like" /><b>{article.likeCount}</b></button><button type="button" className="front-action-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="返回顶部" title="返回顶部"><ActionIcon name="top" /></button></div>
    </aside>
    {replyTarget && <div className="front-reply-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReplyTarget(null) }}><form className="front-reply-dialog" role="dialog" aria-modal="true" aria-labelledby="reply-title" onSubmit={submitReply}><header><div><span>回复</span><strong id="reply-title">{replyTarget.userName}</strong></div><button type="button" aria-label="关闭回复" onClick={() => setReplyTarget(null)}>×</button></header><blockquote>{replyTarget.content}</blockquote><label htmlFor="reply-content">回复内容</label><textarea id="reply-content" autoFocus value={replyText} maxLength={1000} onChange={(event) => setReplyText(event.target.value)} /><footer><span>{replyText.length}/1000</span><button type="submit" disabled={submitting || !replyText.trim()}>{submitting ? '发布中...' : '发布回复'}</button></footer></form></div>}
  </main>
}
