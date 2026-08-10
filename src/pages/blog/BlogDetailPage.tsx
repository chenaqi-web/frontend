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
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const Avatar = ({ src, name, small = false }: { src?: string; name: string; small?: boolean }) => <span className={small ? 'front-comment-avatar small' : 'front-comment-avatar'}>{src ? <img src={resolveStorageUrl(src)} alt="" /> : name.slice(0, 1).toUpperCase()}</span>

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
    try { const result = await commentApi.list({ articleId: articleID, page: 1, size: 50 }); setComments(result.comments ?? []) }
    catch (reason) { setMessage((reason as Error).message) }
    finally { setCommentsLoading(false) }
  }

  useEffect(() => {
    if (!articleID) { setLoading(false); return }
    void articleApi.detail({ id: articleID }).then((result) => setArticle(result.article)).catch((reason: Error) => setMessage(reason.message)).finally(() => setLoading(false))
    void loadComments()
  }, [articleID])

  const headings = useMemo(() => article ? Array.from(article.content.matchAll(/^(#{1,3})\s+(.+)$/gm)).map((match) => ({ level: match[1].length, text: match[2].trim() })) : [], [article])

  const submitComment = async (event: FormEvent) => {
    event.preventDefault()
    if (!loggedIn) { navigate('/login'); return }
    if (!commentText.trim()) return
    try { setSubmitting(true); const result = await commentApi.create({ articleId: articleID, content: commentText.trim() }); if (!result.success) throw new Error('评论发布失败'); setCommentText(''); setMessage('评论已发布'); await loadComments() }
    catch (reason) { setMessage((reason as Error).message) }
    finally { setSubmitting(false) }
  }

  const toggleReplies = async (comment: CommentItem) => {
    if (expandedReplies[comment.id]) { setExpandedReplies((current) => ({ ...current, [comment.id]: false })); return }
    setExpandedReplies((current) => ({ ...current, [comment.id]: true }))
    if (replies[comment.id]) return
    try { const result = await commentApi.replies({ parentId: comment.id, page: 1, size: 50 }); setReplies((current) => ({ ...current, [comment.id]: result.replies ?? [] })) }
    catch (reason) { setMessage((reason as Error).message) }
  }

  const submitReply = async (event: FormEvent) => {
    event.preventDefault()
    if (!replyTarget || !replyText.trim()) return
    if (!loggedIn) { navigate('/login'); return }
    try { setSubmitting(true); const result = await commentApi.reply({ articleId: articleID, parentId: replyTarget.rootId || replyTarget.id, replyToId: replyTarget.id, content: replyText.trim() }); if (!result.success) throw new Error('回复发布失败'); setReplyText(''); const rootID = replyTarget.rootId || replyTarget.id; setReplies((current) => { const next = { ...current }; delete next[rootID]; return next }); setExpandedReplies((current) => ({ ...current, [rootID]: true })); setReplyTarget(null); const refreshed = await commentApi.replies({ parentId: rootID, page: 1, size: 50 }); setReplies((current) => ({ ...current, [rootID]: refreshed.replies ?? [] })); await loadComments() }
    catch (reason) { setMessage((reason as Error).message) }
    finally { setSubmitting(false) }
  }

  const jumpToHeading = (index: number) => document.querySelectorAll('.front-article-body h1,.front-article-body h2,.front-article-body h3').item(index)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const toggleArticleLike = async () => {
    if (!loggedIn) { navigate('/login'); return }
    if (!article || liking) return
    setLiking(true)
    try {
      const result = await likeApi.thumbUp({ objectType: 'article', objectId: article.id })
      if (!result.success) throw new Error('点赞操作失败')
      setArticle({ ...article, likeCount: article.likeCount + 1 })
      setLiked(true)
    } catch (reason) { setMessage((reason as Error).message) }
    finally { setLiking(false) }
  }

  if (loading) return <main className="front-detail-state">正在打开文章...</main>
  if (!article) return <main className="front-detail-state"><strong>没有找到这篇文章</strong><AppLink to="/blog">返回博客列表</AppLink>{message && <span>{message}</span>}</main>

  return <main className="front-detail-page">
    <article className="front-reading-column"><header className="front-detail-header"><AppLink to="/blog" className="front-back-link">← 返回博客</AppLink><div className="front-detail-label">{formatDateTime(article.createdAt)}</div><h1>{article.title}</h1>{article.summary && <p>{article.summary}</p>}<div className="front-detail-author"><Avatar src={article.authorAvatar} name={article.authorName || 'R'} /><div><strong>{article.authorName || 'Renai 成员'}</strong><span>发布于 {formatDateTime(article.createdAt)}</span></div><div className="front-detail-stats"><span>浏览 {article.viewCount}</span><span>评论 {article.commentCount}</span><button type="button" className={liked ? 'liked' : ''} disabled={liking || liked} onClick={() => void toggleArticleLike()}>{liked ? '♥ 已点赞' : '♡ 点赞'} {article.likeCount}</button></div></div>{article.coverImage && <img className="front-detail-cover" src={resolveStorageUrl(article.coverImage)} alt={`${article.title}封面`} />}</header>

      <section className="front-article-body"><MarkdownView content={article.content} /></section>

      <section className="front-comments" id="comments"><header><div><span>一起交流</span><h2>评论</h2></div><strong>{comments.length} 条</strong></header>{loggedIn ? <form className="front-comment-form" onSubmit={submitComment}><Avatar src={currentUser.avatar} name={currentUser.username || '我'} /><div><label htmlFor="new-comment">写下你的想法</label><textarea id="new-comment" value={commentText} maxLength={1000} onChange={(event) => setCommentText(event.target.value)} placeholder="友善交流，让讨论更有价值。" /><footer><span>{commentText.length}/1000</span><button type="submit" disabled={submitting || !commentText.trim()}>{submitting ? '发布中...' : '发布评论'}</button></footer></div></form> : <div className="front-comment-login"><span>登录后参与评论，与社团成员继续讨论。</span><button type="button" onClick={() => navigate('/login')}>去登录</button></div>}{message && <p className="front-comment-message" role="status">{message}</p>}
        {commentsLoading ? <div className="front-comments-state">正在加载评论...</div> : comments.length === 0 ? <div className="front-comments-state"><strong>还没有评论</strong><span>成为第一个参与讨论的人。</span></div> : <div className="front-comment-list">{comments.map((comment) => <article className="front-comment" key={comment.id}><Avatar src={comment.userAvatar} name={comment.userName || 'R'} /><div><header><strong>{comment.userName || 'Renai 成员'}</strong><time>{formatDateTime(comment.createdAt)}</time></header><p>{comment.content}</p><div className="front-comment-actions"><button type="button" onClick={() => loggedIn ? setReplyTarget(comment) : navigate('/login')}>回复</button>{comment.childCount > 0 && <button type="button" onClick={() => void toggleReplies(comment)}>{expandedReplies[comment.id] ? '收起回复' : `查看 ${comment.childCount} 条回复`}</button>}</div>{expandedReplies[comment.id] && <div className="front-replies">{replies[comment.id] ? replies[comment.id].map((reply) => <article key={reply.id}><Avatar src={reply.userAvatar} name={reply.userName || 'R'} small /><div><header><strong>{reply.userName || 'Renai 成员'}</strong><time>{formatDateTime(reply.createdAt)}</time></header><p>{reply.content}</p><button type="button" onClick={() => loggedIn ? setReplyTarget(reply) : navigate('/login')}>回复</button></div></article>) : <span>正在加载回复...</span>}</div>}</div></article>)}</div>}
      </section>
    </article>

    <aside className="front-detail-aside"><nav aria-label="文章目录"><span>快速导航</span><h2>文章目录</h2>{headings.length ? headings.map((heading, index) => <button type="button" className={`level-${heading.level}`} key={`${heading.text}-${index}`} onClick={() => jumpToHeading(index)}>{heading.text}</button>) : <p>文章暂无章节标题</p>}</nav><a href="#comments" className="front-discussion-link">加入评论讨论 <span>→</span></a></aside>

    {replyTarget && <div className="front-reply-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReplyTarget(null) }}><form className="front-reply-dialog" role="dialog" aria-modal="true" aria-labelledby="reply-title" onSubmit={submitReply}><header><div><span>回复</span><strong id="reply-title">{replyTarget.userName}</strong></div><button type="button" aria-label="关闭回复" onClick={() => setReplyTarget(null)}>×</button></header><blockquote>{replyTarget.content}</blockquote><label htmlFor="reply-content">回复内容</label><textarea id="reply-content" autoFocus value={replyText} maxLength={1000} onChange={(event) => setReplyText(event.target.value)} /><footer><span>{replyText.length}/1000</span><button type="submit" disabled={submitting || !replyText.trim()}>{submitting ? '发布中...' : '发布回复'}</button></footer></form></div>}
  </main>
}
