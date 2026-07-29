const diaryEntries = [
  { date: '07 / 26', mood: '晴天！', icon: '☀', title: '夏日祭准备中', text: '一起做了歪歪扭扭的招牌，颜料蹭得到处都是。最后一致决定：不擦了，这就是艺术！', photos: ['🎐', '🍧'] },
  { date: '07 / 18', mood: '好饿…', icon: '🍰', title: '失败蛋糕研究会', text: '奶油塌了，草莓跑了，但大家还是把它吃得干干净净。失败的甜品也可以很好吃。', photos: ['🍓', '☕'] },
  { date: '07 / 09', mood: '通关！', icon: '🎮', title: '深夜游戏联机', text: '说好只玩一局，回过神来窗外已经亮了。有人全程迷路，但绝对不是我。', photos: ['👾', '⭐'] },
]

export default function DiaryPage() {
  return (
    <main className="inner-page diary-page">
      <header className="page-intro"><span>OUR TINY DAYS</span><h1>生活小记</h1><p>把那些不值得上新闻、却值得记住的小事贴在这里。</p></header>
      <div className="diary-timeline">
        {diaryEntries.map((entry, index) => (
          <article className="diary-entry" key={entry.title}>
            <div className="diary-date"><b>{entry.date}</b><span>{entry.mood}</span></div>
            <div className="diary-paper">
              <span className="diary-icon">{entry.icon}</span><small>DIARY No.0{index + 1}</small>
              <h2>{entry.title}</h2><p>{entry.text}</p>
              <div className="mini-photos">{entry.photos.map((photo) => <span key={photo}>{photo}</span>)}</div>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
