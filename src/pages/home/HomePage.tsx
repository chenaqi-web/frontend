import { useEffect, useState } from 'react'
import { pingGateway } from '@/api/health'
import './HomePage.css'

type GatewayState = 'loading' | 'online' | 'offline'

const activities = [
  { icon: '🎨', title: '周末涂鸦会', note: '带上彩笔，画坏也没关系！', color: 'pink' },
  { icon: '🎮', title: '像素游戏夜', note: '一起组队，快乐掉分中…', color: 'blue' },
  { icon: '🍬', title: '糖果交换所', note: '用一颗糖换一个新朋友', color: 'yellow' },
]

export default function HomePage() {
  const [gatewayState, setGatewayState] = useState<GatewayState>('loading')

  useEffect(() => {
    pingGateway()
      .then(() => setGatewayState('online'))
      .catch(() => setGatewayState('offline'))
  }, [])

  const statusText = {
    loading: '正在呼叫基地…',
    online: '基地信号满格！',
    offline: '基地暂时失联',
  }[gatewayState]

  return (
    <main className="scrapbook">
      <div className="paper-noise" aria-hidden="true" />
      <div className="doodles" aria-hidden="true">
        <span className="doodle d1">♡</span><span className="doodle d2">★</span>
        <span className="doodle d3">☁</span><span className="doodle d4">✿</span>
        <span className="doodle d5">☆ﾟ.*･｡ﾟ</span><span className="doodle d6">☺</span>
        <span className="doodle d7">〰〰</span><span className="doodle d8">♥</span>
      </div>

      <nav className="tape-nav" aria-label="主导航">
        <a className="brand" href="#top"><span>R</span> RenaiTeam!</a>
        <div className="nav-links">
          <a href="#about">关于我们</a>
          <a href="#events">社团日记</a>
          <a href="#join">加入队伍</a>
        </div>
        <div className={`server-sticker ${gatewayState}`} title="GET /api/v1/health/ping">
          <i /> {statusText}
        </div>
      </nav>

      <section className="hero-section" id="top">
        <div className="hero-copy">
          <span className="tiny-label">✦ WELCOME TO OUR SECRET BASE ✦</span>
          <h1>把无聊的日子<br /><em>涂成彩色！</em></h1>
          <p>这里是 RenaiTeam，一个收集奇怪灵感、可爱朋友<br className="desktop-break" />和快乐碎片的兴趣社团。</p>
          <a className="crayon-button" href="#join">来和我们玩吧！<span>→</span></a>
          <span className="arrow-note">胆小鬼也欢迎哦 ↗</span>
        </div>

        <div className="character-card" aria-label="RenaiTeam 吉祥物插画">
          <span className="tape tape-top" />
          <span className="spark s1">✦</span><span className="spark s2">♡</span>
          <div className="mascot">
            <div className="hair-back" />
            <div className="head">
              <span className="ear left" /><span className="ear right" />
              <div className="bangs" />
              <span className="eye left">✦</span><span className="eye right">✦</span>
              <span className="blush left" /><span className="blush right" />
              <span className="mouth">ᴗ</span>
            </div>
            <div className="body"><span className="collar">★</span></div>
            <span className="arm left">╲</span><span className="arm right">╱</span>
          </div>
          <div className="speech">一起玩吗？<b>YES!</b></div>
          <span className="card-caption">今日份元气 +100</span>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="section-title"><span>01</span><h2>我们在做什么？</h2><i>WHAT WE DO</i></div>
        <div className="about-grid">
          <article className="notebook-note">
            <span className="pin">●</span>
            <h3>没有标准答案的社团</h3>
            <p>画画、游戏、摄影、手作、动漫……喜欢什么就一起做什么。我们拒绝无聊，也拒绝“必须很厉害”。</p>
            <div className="scribble">大失败也值得庆祝！</div>
          </article>
          <div className="polaroids">
            <div className="polaroid one"><div>☁<span>★</span>☻</div><b>脑洞会议现场</b></div>
            <div className="polaroid two"><div>🍭<span>♡</span>🎮</div><b>快乐补给站</b></div>
          </div>
        </div>
      </section>

      <section className="events-section" id="events">
        <div className="section-title"><span>02</span><h2>近期社团日记</h2><i>NEW QUESTS!</i></div>
        <div className="activity-grid">
          {activities.map((activity, index) => (
            <article className={`activity-card ${activity.color}`} key={activity.title}>
              <span className="card-number">0{index + 1}</span>
              <div className="activity-icon">{activity.icon}</div>
              <h3>{activity.title}</h3>
              <p>{activity.note}</p>
              <span className="sticker">NEW!</span>
            </article>
          ))}
        </div>
      </section>

      <section className="join-section" id="join">
        <span className="join-star">★</span>
        <div><small>MEMBER WANTED!</small><h2>下一页，想和你一起画。</h2><p>不需要履历，不需要完美，只要带上你的好奇心。</p></div>
        <a href="mailto:hello@renaiteam.club">投递一张自我介绍贴纸 →</a>
      </section>

      <footer><b>RenaiTeam</b><span>Made with crayons, candies & a little chaos.</span><i>© 2026</i></footer>
    </main>
  )
}
