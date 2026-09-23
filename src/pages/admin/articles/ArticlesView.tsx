import { useEffect, useState } from 'react'
import { articleApi } from '@/shared/api/v1/article'
import { navigate } from '@/shared/hooks/usePathname'
import type { Article } from '@/shared/types/article'
import { logRequestError } from '@/shared/lib/request-error'
import './ArticlesView.css'

const formatCount = (value: number) => new Intl.NumberFormat('zh-CN').format(value ?? 0)

export default function ArticlesView() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const loadArticles = async () => { try { setLoading(true); const result = await articleApi.listByUser({ page: 1, pageSize: 30 }); setArticles(result.articles ?? []) } catch (error) { logRequestError('加载我的文章失败', error); setMessage('加载失败，请稍后重试') } finally { setLoading(false) } }
  useEffect(() => { void loadArticles() }, [])
  const removeArticle = async (article: Article) => { if (!window.confirm(`确定要删除《${article.title}》吗？\n\n删除后这篇文章及其评论、点赞记录都无法恢复。`)) return; try { await articleApi.delete({ id: article.id }); setArticles((current) => current.filter((item) => item.id !== article.id)) } catch (error) { logRequestError('删除我的文章失败', error); setMessage('删除失败，请稍后重试') } }
  return <section className="articles-view"><div className="articles-head"><div><span className="eyebrow">MY ARTICLES</span><h2>我的文章</h2><p>管理你发布的文章，随时查看内容表现。</p></div><button className="articles-refresh" type="button" onClick={() => void loadArticles()} disabled={loading}>刷新列表</button></div>{message && <p className="articles-message" role="alert">{message}</p>}{loading ? <div className="articles-empty">正在加载文章...</div> : articles.length === 0 ? <div className="articles-empty"><strong>还没有发布文章</strong><span>完成一篇创作后，它会出现在这里。</span></div> : <div className="article-list">{articles.map((article) => <article className="article-row" key={article.id} role="link" tabIndex={0} onClick={() => navigate(`/blog/${article.id}`)} onKeyDown={(event) => { if (event.key === 'Enter') navigate(`/blog/${article.id}`) }}><div className="article-cover">{article.coverImage ? <img src={article.coverImage} alt="文章封面" /> : <span>NO COVER</span>}</div><div className="article-info"><h3>{article.title || '未命名文章'}</h3><p>{article.summary || '暂无摘要'}</p><div className="article-meta"><span>{new Date(article.createdAt * 1000).toLocaleDateString('zh-CN')}</span><span>浏览 {formatCount(article.viewCount)}</span><span>评论 {formatCount(article.commentCount)}</span><span>点赞 {formatCount(article.likeCount)}</span></div></div><button className="article-delete" type="button" onClick={(event) => { event.stopPropagation(); void removeArticle(article) }}>删除</button></article>)}</div>}</section>
}
