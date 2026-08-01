import type { AdminArticle, AdminTab } from '@/pages/admin/types'

interface Props {
  articles: AdminArticle[]
  onJump: (tab: AdminTab) => void
}

export default function DashboardView({ articles, onJump }: Props) {
  return (
    <>
      <div className="welcome-sticker">
        欢迎回来
        <span>这里是网站内容与运营数据概览。</span>
      </div>

      <div className="stat-grid">
        <Stat label="文章总数" value={articles.length} tone="pink" />
        <Stat label="累计点赞" value="2,486" tone="yellow" />
        <Stat label="访客浏览" value="12.8k" tone="blue" />
        <Stat label="分类数量" value="8" tone="mint" />
      </div>

      <div className="dashboard-grid">
        <div className="admin-card">
          <div className="card-title">
            <h2>最近文章</h2>
            <button type="button" onClick={() => onJump('articles')}>
              查看全部
            </button>
          </div>
          {articles.slice(0, 3).map((a) => (
            <div className="recent-item" key={a.id}>
              <div>
                <b>{a.title}</b>
                <small>
                  {a.authorName ?? '匿名用户'} · {a.viewCount ?? 0} 次浏览
                </small>
              </div>
              <em>已发布</em>
            </div>
          ))}
        </div>

        <div className="admin-card doodle-card">
          <h2>服务状态</h2>
          <p>当前各项服务运行正常。</p>
          <strong>运行中</strong>
        </div>
      </div>
    </>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string | number
  tone: 'pink' | 'yellow' | 'blue' | 'mint'
}) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <small>{label}</small>
      <b>{value}</b>
    </div>
  )
}
