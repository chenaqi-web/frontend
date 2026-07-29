const members = [
  { name: '桃子', role: '社长 / 胡思乱想担当', avatar: '🌸', color: 'pink' },
  { name: '阿蓝', role: '美术 / 熬夜担当', avatar: '🐳', color: 'blue' },
  { name: '米米', role: '活动 / 零食担当', avatar: '🍋', color: 'yellow' },
  { name: '小森', role: '技术 / 修电脑担当', avatar: '🌱', color: 'mint' },
]

export default function AboutPage() {
  return (
    <main className="inner-page about-page">
      <header className="page-intro"><span>ABOUT OUR TEAM</span><h1>关于我们</h1><p>一群普通但有趣的人，正在认真保护彼此奇奇怪怪的爱好。</p></header>
      <section className="about-manifesto">
        <div className="manifesto-art"><span>★</span><b>R</b><i>♡</i><small>since 2024</small></div>
        <div><small>OUR LITTLE MANIFESTO</small><h2>这里不评判热爱，也不贩卖焦虑。</h2><p>RenaiTeam 起源于几位朋友的周末聚会。我们相信创作不必完美，兴趣不必有用，认识新朋友也不用擅长社交。这里可以分享作品，也可以只安静地待一会儿。</p><blockquote>“认真玩，就是我们最认真的事。”</blockquote></div>
      </section>
      <section className="member-section"><div className="section-heading"><b>MEET THE TEAM</b><h2>基地常驻成员</h2></div><div className="member-grid">
        {members.map((member) => <article className={`member-card ${member.color}`} key={member.name}><div>{member.avatar}</div><h3>{member.name}</h3><p>{member.role}</p><span>HELLO!</span></article>)}
      </div></section>
      <section className="contact-note"><span>📮</span><div><small>COME SAY HI!</small><h2>想来基地看看吗？</h2><p>写信到 hello@renaiteam.club，我们会认真读完每一封邮件。</p></div><a href="mailto:hello@renaiteam.club">给我们写信 →</a></section>
    </main>
  )
}
