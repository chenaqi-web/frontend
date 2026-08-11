import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import AppLink from '@/components/common/AppLink'

const slides = [
  { image: '/carousel/1.jpg', title: '宇宙并非局部真实，这意味着一切皆无所谓', label: 'RENai TEAM' },
  { image: '/carousel/2.jpg', title: '世界偶尔匆忙，我在这里慢慢生活', label: '把日常，过成甜甜的收藏' },
]
const topics = ['生活', '创作', '社团', '灵感', '阅读', 'AI']

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    if (slides.length < 2) return
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 5000)
    return () => window.clearInterval(timer)
  }, [])

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    window.location.href = `/blog${keyword.trim() ? `?keyword=${encodeURIComponent(keyword.trim())}` : ''}`
  }
  const slide = slides[activeSlide]
  return <main className="home-page">
    <section className="home-cosmic-hero" aria-label="首页轮播图">
      <img className="home-cosmic-hero-image" src={slide.image} alt="瑞克和莫迪的宇宙场景" />
      <div className="home-cosmic-shade" />
      <div className="home-cosmic-content">
        <small>{slide.label}</small><h1>{slide.title}</h1>
        <form className="home-search" onSubmit={search}><span>文章</span><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索社团的记录与灵感" aria-label="搜索文章" /><button type="submit" aria-label="搜索"><i /></button></form>
        <div className="home-topic-list">{topics.map((topic) => <button type="button" key={topic} onClick={() => { setKeyword(topic); window.location.href = `/blog?keyword=${encodeURIComponent(topic)}` }}>{topic}</button>)}</div>
      </div>
      <div className="home-carousel-dots" aria-label="轮播图页码">{slides.map((item, index) => <button key={item.image} type="button" className={index === activeSlide ? 'active' : ''} onClick={() => setActiveSlide(index)} aria-label={`查看第 ${index + 1} 张轮播图`} />)}</div>
    </section>
    <section className="home-after-hero">
      <div className="home-shortcuts"><AppLink to="/blog"><b>01</b><div><strong>热门文章速览</strong><span>POPULAR ARTICLES</span></div></AppLink><AppLink to="/assistant"><b>02</b><div><strong>社团智能助手</strong><span>ASK RENAI ASSISTANT</span></div></AppLink><AppLink to="/diary"><b>03</b><div><strong>生活小记</strong><span>DAILY MOMENTS</span></div></AppLink><AppLink to="/about"><b>04</b><div><strong>认识 Renai</strong><span>ABOUT OUR TEAM</span></div></AppLink></div>
      <div className="home-section-heading"><small>EXPLORE RENAI</small><h2>把散落的想法，留在这里</h2></div>
      <div className="home-explore-grid"><AppLink to="/diary"><span>01</span><h3>生活小记</h3><p>记录不必宏大，今天也值得被好好写下。</p></AppLink><AppLink to="/blog"><span>02</span><h3>社团博客</h3><p>阅读成员的观察、创作和认真分享。</p></AppLink><AppLink to="/assistant"><span>03</span><h3>社团助手</h3><p>开始一段对话，让灵感从问题里出现。</p></AppLink></div>
    </section>
  </main>
}
