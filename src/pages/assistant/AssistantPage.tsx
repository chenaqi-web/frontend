import { useState, type FormEvent } from 'react'

interface ChatMessage {
  id: number
  role: 'assistant' | 'user'
  content: string
  time: string
}

const suggestions = ['最近有哪些社团活动？', '我适合加入哪个小组？', '帮我介绍一下 RenaiTeam', '第一次参加活动要准备什么？']

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: 'assistant', content: '你好呀！我是小仁，RenaiTeam 的社团助手。关于社团、活动、博客或加入方式，都可以问我。', time: '刚刚' },
  ])
  const [input, setInput] = useState('')

  const send = (content: string) => {
    const question = content.trim()
    if (!question) return
    setMessages((current) => [...current,
      { id: Date.now(), role: 'user', content: question, time: '刚刚' },
      { id: Date.now() + 1, role: 'assistant', content: '我已经记下这个问题啦！智能问答接口接入后，我会在这里给你完整回答。', time: '等待接入' },
    ])
    setInput('')
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    send(input)
  }

  return (
    <main className="assistant-page">
      <header className="assistant-intro">
        <div><span>✦ RENAITEAM AI AGENT ✦</span><h1>社团助手 · 小仁</h1><p>不知道去哪里找答案？把问题丢给我吧，我会努力翻遍秘密基地的每一张便签。</p></div>
        <div className="assistant-status"><i />助手正在值班中</div>
      </header>

      <section className="assistant-desk">
        <aside className="assistant-profile">
          <span className="profile-tape" />
          <div className="assistant-avatar"><div className="avatar-hair"/><div className="avatar-face"><i/><i/><b>⌣</b></div><div className="avatar-headset">●</div><div className="avatar-body">R</div></div>
          <h2>小仁 REN</h2><small>CLUB SUPPORT AGENT</small>
          <p>负责回答社团相关问题，也擅长帮迷路的新成员找到正确入口。</p>
          <ul><li><i className="mint"/> 社团信息</li><li><i className="pink"/> 活动指引</li><li><i className="blue"/> 博客搜索</li></ul>
          <span className="profile-note">24h 努力营业中！↗</span>
        </aside>

        <div className="chat-window">
          <div className="chat-titlebar"><span>●　●　●</span><b>和小仁聊一聊.txt</b><i>☆</i></div>
          <div className="chat-messages">
            <div className="chat-day">— 今天 —</div>
            {messages.map((message) => <div className={`message-row ${message.role}`} key={message.id}>
              {message.role === 'assistant' && <span className="message-avatar">R</span>}
              <div><div className="message-bubble">{message.content}</div><small>{message.role === 'assistant' ? '小仁' : '你'} · {message.time}</small></div>
            </div>)}
          </div>
          <div className="chat-suggestions"><small>试着问问：</small>{suggestions.map((suggestion) => <button onClick={() => send(suggestion)} key={suggestion}>{suggestion}</button>)}</div>
          <form className="chat-input" onSubmit={submit}><label><span>✎</span><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="在这里写下你的问题…" rows={2} /></label><button type="submit">发送纸飞机 <b>➜</b></button></form>
        </div>
      </section>
      <p className="assistant-disclaimer">※ 当前为界面演示状态，Agent 接口接入后将启用真实智能回答。</p>
    </main>
  )
}
