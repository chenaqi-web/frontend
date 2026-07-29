import { useState } from 'react'

interface CategoryGroup {
  id: string
  name: string
  icon: string
  children: { id: string; name: string }[]
}

const categoryGroups: CategoryGroup[] = [
  { id: 'news', name: '社团动态', icon: '📣', children: [{ id: 'notice', name: '社团公告' }, { id: 'event', name: '活动预告' }, { id: 'review', name: '活动回顾' }] },
  { id: 'creation', name: '创作分享', icon: '🎨', children: [{ id: 'drawing', name: '绘画手记' }, { id: 'photo', name: '摄影记录' }, { id: 'handmade', name: '手作工坊' }] },
  { id: 'entertainment', name: '兴趣世界', icon: '🎮', children: [{ id: 'game', name: '游戏分享' }, { id: 'anime', name: '动漫杂谈' }, { id: 'music', name: '音乐角落' }] },
  { id: 'daily', name: '日常碎片', icon: '🍬', children: [{ id: 'story', name: '成员故事' }, { id: 'food', name: '快乐食堂' }, { id: 'chat', name: '随便聊聊' }] },
]

const posts = [
  { primaryId: 'news', secondaryId: 'notice', category: '社团公告', date: '2026.07.28', title: 'RenaiTeam 夏日招新开始啦！', summary: '如果你也喜欢画画、游戏、动漫和毫无用处但很可爱的东西，欢迎来秘密基地坐坐。', tags: ['招新', '置顶'], comments: 24, icon: '📣', color: 'pink' },
  { primaryId: 'creation', secondaryId: 'drawing', category: '绘画手记', date: '2026.07.21', title: '怎样画出一只不太聪明的云？', summary: '本期没有严谨教程，只有七种画失败的小云朵，以及让它们变可爱的补救方法。', tags: ['绘画', '教程'], comments: 16, icon: '☁️', color: 'blue' },
  { primaryId: 'entertainment', secondaryId: 'game', category: '游戏分享', date: '2026.07.12', title: '社团游戏夜生存报告', summary: '八个人、四包薯片、一个迷路三小时的队友。看看我们到底有没有成功通关。', tags: ['游戏夜'], comments: 32, icon: '👾', color: 'purple' },
  { primaryId: 'daily', secondaryId: 'food', category: '快乐食堂', date: '2026.07.06', title: '本周秘密基地零食排行榜', summary: '经过非常不严谨但异常激烈的投票，本周最受欢迎的零食终于诞生了。', tags: ['零食', '日常'], comments: 19, icon: '🍰', color: 'yellow' },
]

export default function BlogPage() {
  const [activePrimary, setActivePrimary] = useState('all')
  const [activeSecondary, setActiveSecondary] = useState('all')
  const activeGroup = categoryGroups.find((group) => group.id === activePrimary)
  const visiblePosts = posts.filter((post) => (activePrimary === 'all' || post.primaryId === activePrimary) && (activeSecondary === 'all' || post.secondaryId === activeSecondary))

  const selectPrimary = (categoryId: string) => {
    setActivePrimary(categoryId)
    setActiveSecondary('all')
  }

  return (
    <main className="inner-page blog-page">
      <header className="page-intro"><span>CLUB BLOG</span><h1>社团博客</h1><p>公告、脑洞、经验和偶尔认真写下来的长文章。</p></header>
      <section className="category-panel" aria-label="博客分类筛选">
        <div className="category-panel-title"><span>✦</span><div><small>CATEGORY MAP</small><b>先选一个大方向</b></div><i>点击后会展开小分类 ↓</i></div>
        <div className="primary-categories">
          <button className={activePrimary === 'all' ? 'active' : ''} onClick={() => selectPrimary('all')}><span>✦</span>全部文章<small>{posts.length}</small></button>
          {categoryGroups.map((group) => <button className={activePrimary === group.id ? 'active' : ''} onClick={() => selectPrimary(group.id)} key={group.id}><span>{group.icon}</span>{group.name}<small>{posts.filter((post) => post.primaryId === group.id).length}</small></button>)}
        </div>
        {activeGroup && <div className="secondary-category-wrap">
          <div className="category-connector" aria-hidden="true">↳</div>
          <div className="secondary-label"><b>{activeGroup.icon} {activeGroup.name}</b><span>里面还有这些小抽屉</span></div>
          <div className="secondary-categories">
            <button className={activeSecondary === 'all' ? 'active' : ''} onClick={() => setActiveSecondary('all')}>全部</button>
            {activeGroup.children.map((category) => <button className={activeSecondary === category.id ? 'active' : ''} onClick={() => setActiveSecondary(category.id)} key={category.id}>{category.name}<small>{posts.filter((post) => post.secondaryId === category.id).length}</small></button>)}
          </div>
        </div>}
      </section>
      <div className="blog-toolbar"><div className="filter-result"><span>✎</span>当前找到 <b>{visiblePosts.length}</b> 篇文章{activeGroup && <> · {activeGroup.name}</>}{activeSecondary !== 'all' && <> / {activeGroup?.children.find((item) => item.id === activeSecondary)?.name}</>}</div><label className="search-note"><span>⌕</span><input aria-label="搜索博客" placeholder="搜点什么…" /></label></div>
      <div className="blog-grid">
        {visiblePosts.map((post) => <article className={`blog-card ${post.color}`} key={post.title}><div className="blog-cover"><span>{post.icon}</span><i>NEW!</i></div><div className="blog-content"><small>{post.category} · {post.date}</small><h2>{post.title}</h2><p>{post.summary}</p><div className="post-meta"><div>{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><b>♡ {post.comments} 条评论</b></div></div></article>)}
      </div>
      {visiblePosts.length === 0 && <div className="empty-note">这个小抽屉还空着，等一篇新故事掉进来… ☆</div>}
    </main>
  )
}
