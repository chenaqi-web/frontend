import { useState } from 'react'

const categories = ['全部', '社团公告', '创作手记', '游戏分享', '日常碎片']
const posts = [
  { category: '社团公告', date: '2026.07.28', title: 'RenaiTeam 夏日招新开始啦！', summary: '如果你也喜欢画画、游戏、动漫和毫无用处但很可爱的东西，欢迎来秘密基地坐坐。', tags: ['招新', '置顶'], comments: 24, icon: '📣', color: 'pink' },
  { category: '创作手记', date: '2026.07.21', title: '怎样画出一只不太聪明的云？', summary: '本期没有严谨教程，只有七种画失败的小云朵，以及让它们变可爱的补救方法。', tags: ['绘画', '教程'], comments: 16, icon: '☁️', color: 'blue' },
  { category: '游戏分享', date: '2026.07.12', title: '社团游戏夜生存报告', summary: '八个人、四包薯片、一个迷路三小时的队友。看看我们到底有没有成功通关。', tags: ['游戏夜'], comments: 32, icon: '👾', color: 'purple' },
]

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const visiblePosts = posts.filter((post) => activeCategory === '全部' || post.category === activeCategory)

  return (
    <main className="inner-page blog-page">
      <header className="page-intro"><span>CLUB BLOG</span><h1>社团博客</h1><p>公告、脑洞、经验和偶尔认真写下来的长文章。</p></header>
      <div className="blog-toolbar">
        <div className="category-tabs">{categories.map((category) => <button className={category === activeCategory ? 'active' : ''} onClick={() => setActiveCategory(category)} key={category}>{category}</button>)}</div>
        <label className="search-note"><span>⌕</span><input aria-label="搜索博客" placeholder="搜点什么…" /></label>
      </div>
      <div className="blog-grid">
        {visiblePosts.map((post) => (
          <article className={`blog-card ${post.color}`} key={post.title}>
            <div className="blog-cover"><span>{post.icon}</span><i>NEW!</i></div>
            <div className="blog-content"><small>{post.category} · {post.date}</small><h2>{post.title}</h2><p>{post.summary}</p>
              <div className="post-meta"><div>{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><b>♡ {post.comments} 条评论</b></div>
            </div>
          </article>
        ))}
      </div>
      {visiblePosts.length === 0 && <div className="empty-note">这个分类还空着，等一篇新故事掉进来… ☆</div>}
    </main>
  )
}
