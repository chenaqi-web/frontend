import { useCallback, useEffect, useState } from 'react'
import { articleApi } from '@/api/article'
import type { Article } from '@/types/article'
import type { AdminArticle } from '@/pages/admin/types'

const toAdminArticle = (article: Article): AdminArticle => ({
  id: String(article.id),
  title: article.title,
  authorName: article.authorName,
  categoryID: Number(article.categoryID) || undefined,
  viewCount: article.viewCount,
  createdAt: article.createdAt,
  isTop: article.isTop,
})

const demoArticles: AdminArticle[] = [
  { id: '101', title: '夏日社团活动记录', authorName: '小爱', categoryID: 1, viewCount: 1280, createdAt: Date.now() / 1000 },
  { id: '102', title: '给新手的内容发布指南', authorName: 'Mio', categoryID: 2, viewCount: 826, createdAt: Date.now() / 1000 - 86400 },
  { id: '103', title: 'RenaiTeam 本周资讯', authorName: '小凛', categoryID: 3, viewCount: 456, createdAt: Date.now() / 1000 - 172800 },
]

export function useArticles(token: string) {
  const [articles, setArticles] = useState<AdminArticle[]>(demoArticles)
  const [notice, setNotice] = useState('')

  const refresh = useCallback(async () => {
    try {
      const res = await articleApi.list({}, token)
      if (res.articles?.length) setArticles(res.articles.map(toAdminArticle))
    } catch {
      setNotice('文章列表加载失败')
    }
  }, [token])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const removeArticle = useCallback(async (id: string) => {
    if (!window.confirm('确定要删除这篇文章吗？')) return
    try {
      await articleApi.delete({ id: Number(id), authorID: 0 }, token)
      setArticles((prev) => prev.filter((item) => item.id !== id))
      setNotice('文章已移入回收站')
    } catch {
      setNotice('删除失败，请确认登录身份')
    }
  }, [token])

  return { articles, notice, setNotice, removeArticle }
}

interface Props {
  articles: AdminArticle[]
  onDelete: (id: string) => void
}

export default function ArticlesView({ articles, onDelete }: Props) {
  return (
    <div className="admin-card table-card">
      <div className="card-title">
        <div>
          <h2>所有文章</h2>
          <small>管理发布、编辑和删除内容</small>
        </div>
        <button type="button" className="minimal-button">
          ＋ 新建文章
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>文章标题</th>
              <th>作者</th>
              <th>浏览</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id}>
                <td>
                  <b>{a.isTop && '📌 '}{a.title}</b>
                  <small>#{a.id}</small>
                </td>
                <td>{a.authorName ?? '匿名'}</td>
                <td>{a.viewCount ?? 0}</td>
                <td><span className="status status-muted">已发布</span></td>
                <td>
                  <button type="button" className="text-button">编辑</button>
                  <button type="button" className="text-button danger" onClick={() => onDelete(a.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
