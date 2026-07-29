import { useEffect, useState } from 'react'
import { pingGateway } from '@/api/health'
import AppLink from '@/components/common/AppLink'

type GatewayState = 'loading' | 'online' | 'offline'

const moments = [
  { icon: '🎨', title: '一起创造', note: '把突然冒出来的灵感，变成真正存在的作品。', color: 'pink' },
  { icon: '🎮', title: '一起探索', note: '游戏、动漫、摄影、技术，喜欢什么就去试试看。', color: 'blue' },
  { icon: '🌱', title: '一起成长', note: '不要求完美，只希望每个人都比昨天更勇敢一点。', color: 'yellow' },
]

export default function HomePage() {
  const [gatewayState, setGatewayState] = useState<GatewayState>('loading')

  useEffect(() => {
    pingGateway().then(() => setGatewayState('online')).catch(() => setGatewayState('offline'))
  }, [])

  const statusText = {
    loading: '正在连接秘密基地…',
    online: '秘密基地在线！',
    offline: '基地正在打瞌睡',
  }[gatewayState]

  return (
    <main className="scrapbook home-redesign">
      <div className="home-doodles" aria-hidden="true">
        <span>♡</span><span>★</span><span>☁</span><span>✿</span><span>☆ﾟ.*</span><span>☺</span>
      </div>

      <section className="home-hero">
        <div className="home-hero-copy">
          <div className={`home-status ${gatewayState}`}><i />{statusText}</div>
          <span className="tiny-label">✦ WELCOME TO RENAITEAM ✦</span>
          <h1>找到彼此，<br />一起做点<em>有意义</em>的事。</h1>
          <div className="club-slogan">
            <span>“</span>
            <p>找一群志同道合的人<br />做一件有意义的事</p>
            <span>”</span>
          </div>
          <p className="hero-description">这里没有标准答案，只有一群愿意分享热爱、认真玩耍，<br className="desktop-break" />也愿意为一个共同目标努力的人。</p>
          <div className="hero-actions">
            <AppLink className="crayon-button" to="/register">加入我们的故事 <span>→</span></AppLink>
            <AppLink className="sketch-link" to="/about">先认识一下我们 〰</AppLink>
          </div>
        </div>

        <div className="friend-poster" aria-label="社团朋友们的手绘合照">
          <span className="poster-tape left" /><span className="poster-tape right" />
          <span className="poster-star">★</span><span className="poster-heart">♡</span>
          <div className="friend-group">
            <div className="friend pink"><i>⌒</i><b>•ᴗ•</b><small>IDEA!</small></div>
            <div className="friend purple"><i>〰</i><b>◕ᴗ◕</b><small>CREATE!</small></div>
            <div className="friend blue"><i>⌁</i><b>•▽•</b><small>PLAY!</small></div>
          </div>
          <div className="friend-ground">✿　♡　★　✿　♡</div>
          <p>WE FOUND EACH OTHER!</p>
        </div>
      </section>

      <section className="meaning-banner">
        <span className="meaning-number">01</span>
        <div><small>WHY WE ARE HERE?</small><h2>相遇不是终点，<br />一起完成一件事才是。</h2></div>
        <p>一个人的灵感也许很小，但一群人的热爱可以长成一片森林。我们在这里认识彼此、交换想法，也把想法真正变成行动。</p>
        <span className="meaning-arrow">↙ 看，我们在行动！</span>
      </section>

      <section className="home-values">
        <header><span>OUR LITTLE THINGS</span><h2>我们想一起做的事</h2><p>不宏大也没关系，只要它让今天变得比昨天更好一点。</p></header>
        <div className="activity-grid">
          {moments.map((moment, index) => (
            <article className={`activity-card ${moment.color}`} key={moment.title}>
              <span className="card-number">0{index + 1}</span>
              <div className="activity-icon">{moment.icon}</div>
              <h3>{moment.title}</h3><p>{moment.note}</p>
              <span className="sticker">LET'S GO!</span>
            </article>
          ))}
        </div>
      </section>

      <section className="home-window">
        <div className="window-title"><span>● ● ●</span><b>REN A I TEAM / TODAY</b><i>×</i></div>
        <div className="window-content">
          <div className="window-collage"><span>🎨</span><span>📷</span><span>🎲</span><b>+ YOU ?</b></div>
          <div><small>LATEST FROM OUR CLUB</small><h2>每一种热爱，<br />都应该被认真看见。</h2><p>看看我们最近记录的日常、共同完成的创作，还有那些一不小心就聊到深夜的奇怪脑洞。</p><div className="window-links"><AppLink to="/diary">翻翻生活小记 →</AppLink><AppLink to="/blog">阅读社团博客 →</AppLink></div></div>
        </div>
      </section>

      <section className="home-invitation">
        <span className="invite-spark">✦</span>
        <small>THE NEXT PAGE IS YOURS</small>
        <h2>我们已经找到彼此，<br />现在，只差一个你。</h2>
        <p>不需要很厉害，也不必假装合群。带上你真正喜欢的东西，来和我们完成下一件有意义的事。</p>
        <AppLink to="/register">领取你的社团贴纸 →</AppLink>
        <span className="invite-note">期待见到你！ ♡</span>
      </section>
    </main>
  )
}
