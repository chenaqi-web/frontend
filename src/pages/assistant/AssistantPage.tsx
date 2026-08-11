import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { aiChatApi } from '@/api/v1/ai-chat'
import { navigate } from '@/hooks/usePathname'
import type { AiChatMessage, AiChatSession, AiChatStreamChunk } from '@/types/ai-chat'
import './AssistantPage.css'
import './AssistantDeleteModal.css'
import './AssistantWorkspaceEnhancements.css'
import './AssistantComposerCard.css'

type ChatMessage = AiChatMessage & { localID: string }

const suggestions = ['社团最近有什么活动？', '帮我推荐一篇适合新成员的文章', '如何参与社团的内容创作？']

function toLocalMessage(message: AiChatMessage, index: number): ChatMessage {
  return { ...message, localID: `${message.created_at}-${index}` }
}

export default function AssistantPage() {
  const [sessions, setSessions] = useState<AiChatSession[]>([])
  const [activeSessionID, setActiveSessionID] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')
  const [pendingDeleteSessionID, setPendingDeleteSessionID] = useState<string | null>(null)
  const [deletingSessionID, setDeletingSessionID] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const messageEnd = useRef<HTMLDivElement>(null)
  const loggedIn = Boolean(localStorage.getItem('renai_access_token'))
  const isEmpty = !loading && messages.length === 0

  const loadMessages = async (sessionID: string) => {
    const result = await aiChatApi.listMessages(sessionID)
    setMessages(result.map(toLocalMessage))
  }

  const selectSession = async (sessionID: string) => {
    if (sessionID === activeSessionID || sending) return
    setActiveSessionID(sessionID)
    setMessages([])
    try {
      await loadMessages(sessionID)
    } catch (error) {
      setNotice((error as Error).message)
    }
  }

  const createSession = async () => {
    const session = await aiChatApi.createSession()
    setSessions((current) => [session, ...current])
    setActiveSessionID(session.session_id)
    setMessages([])
    return session
  }

  useEffect(() => {
    if (!loggedIn) {
      setLoading(false)
      return
    }
    let cancelled = false
    void aiChatApi.listSessions({ page: 1, page_size: 30 })
      .then(async (result) => {
        if (cancelled) return
        setSessions(result)
        if (result[0]) {
          setActiveSessionID(result[0].session_id)
          const history = await aiChatApi.listMessages(result[0].session_id)
          if (!cancelled) setMessages(history.map(toLocalMessage))
        }
      })
      .catch((error: Error) => !cancelled && setNotice(error.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [loggedIn])

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, sending])

  const handleNewSession = async () => {
    if (sending) return
    try {
      setNotice('')
      await createSession()
    } catch (error) {
      setNotice((error as Error).message)
    }
  }

  const deleteSession = async (sessionID: string) => {
    if (sending || deletingSessionID) return
    try {
      setDeletingSessionID(sessionID)
      await aiChatApi.deleteSession(sessionID)
      const remaining = sessions.filter((session) => session.session_id !== sessionID)
      setSessions(remaining)
      if (activeSessionID === sessionID) {
        const next = remaining[0]
        setActiveSessionID(next?.session_id ?? '')
        setMessages([])
        if (next) await loadMessages(next.session_id)
      }
      setPendingDeleteSessionID(null)
    } catch (error) {
      setNotice((error as Error).message)
    } finally {
      setDeletingSessionID('')
    }
  }

  const handleDeleteSession = (event: MouseEvent<HTMLButtonElement>, sessionID: string) => {
    event.stopPropagation()
    if (!sending && !deletingSessionID) setPendingDeleteSessionID(sessionID)
  }

  const send = async (text = draft) => {
    const content = text.trim()
    if (!content || sending) return
    let sessionID = activeSessionID
    try {
      setNotice('')
      setSending(true)
      if (!sessionID) sessionID = (await createSession()).session_id
      const now = new Date().toISOString()
      const placeholderID = `assistant-${Date.now()}`
      setMessages((current) => [...current,
        { localID: `user-${Date.now()}`, session_id: sessionID, role: 'user', content, created_at: now },
        { localID: placeholderID, session_id: sessionID, role: 'assistant', content: '', created_at: now },
      ])
      setDraft('')

      const response = await aiChatApi.chat({ session_id: sessionID, content })
      const reader = response.body?.getReader()
      if (!reader) throw new Error('浏览器不支持流式响应')
      const decoder = new TextDecoder()
      let buffer = ''
      let finished = false

      const consume = (block: string) => {
        const data = block.split('\n').filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim()).join('\n')
        if (!data || data === '[DONE]') return
        const chunk = JSON.parse(data) as AiChatStreamChunk
        if (chunk.error) throw new Error(chunk.error)
        if (chunk.content) {
          setMessages((current) => current.map((item) => item.localID === placeholderID ? { ...item, content: item.content + chunk.content } : item))
        }
        finished = chunk.done
      }

      while (!finished) {
        const { done, value } = await reader.read()
        buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done })
        buffer = buffer.replace(/\r\n/g, '\n')
        const blocks = buffer.split('\n\n')
        buffer = blocks.pop() ?? ''
        blocks.forEach(consume)
        if (done) break
      }
      setSessions((current) => current.map((session) => session.session_id === sessionID ? { ...session, title: content.slice(0, 24) } : session))
    } catch (error) {
      setNotice((error as Error).message)
      setMessages((current) => current.filter((item) => !item.localID.startsWith('assistant-') || item.content))
    } finally {
      setSending(false)
    }
  }

  if (!loggedIn) {
    return <main className="assistant-page"><section className="assistant-signin"><span>REN AI</span><h1>社团助手</h1><p>登录后可保存你的会话，并基于社团知识库连续对话。</p><button type="button" onClick={() => navigate('/login')}>登录后开始聊天</button></section></main>
  }

  return <main className="assistant-page">
    <section className={`assistant-workspace${sidebarCollapsed ? ' sidebar-collapsed' : ''}`} aria-label="社团助手对话">
      <aside className="assistant-sidebar">
        <div className="assistant-side-brand"><span>R</span><div><strong>社团助手</strong><small>知识库已连接</small></div></div>
        <button className="assistant-sidebar-toggle" type="button" aria-label={sidebarCollapsed ? '展开会话栏' : '收起会话栏'} title={sidebarCollapsed ? '展开会话栏' : '收起会话栏'} onClick={() => setSidebarCollapsed((current) => !current)}>{sidebarCollapsed ? '›' : '‹'}</button>
        <button className="assistant-new-chat" type="button" onClick={() => void handleNewSession()} disabled={sending}><span aria-hidden="true">+</span><span className="assistant-new-chat-label">新建对话</span></button>
        <div className="assistant-session-label">最近会话</div>
        <div className="assistant-session-list">
          {loading && <span className="assistant-side-status">正在加载...</span>}
          {!loading && sessions.length === 0 && <span className="assistant-side-status">还没有会话</span>}
          {sessions.map((session) => <div className={`assistant-session${session.session_id === activeSessionID ? ' active' : ''}`} key={session.session_id}>
            <button type="button" onClick={() => void selectSession(session.session_id)}><span>◌</span><b>{session.title || '新建会话'}</b></button>
            <button className="assistant-delete-session" type="button" title="删除会话" aria-label="删除会话" disabled={Boolean(deletingSessionID)} onClick={(event) => handleDeleteSession(event, session.session_id)}>×</button>
          </div>)}
        </div>
        <div className="assistant-side-foot"><i /> AI 回复仅供参考</div>
      </aside>

      <section className={`assistant-chat-panel${isEmpty ? ' is-empty' : ''}`}>
        <header className="assistant-chat-head"><div><span>REN AI ASSISTANT</span><h1>{sessions.find((session) => session.session_id === activeSessionID)?.title || '开始一段新对话'}</h1></div><div className="assistant-online"><i /> 在线</div></header>
        <div className="assistant-message-list">
          {isEmpty && <div className="assistant-welcome"><h2>从一个问题开始</h2><p>查找社团内容、了解活动安排，或一起整理创作思路。</p><div>{suggestions.map((item) => <button type="button" key={item} disabled={sending} onClick={() => void send(item)}>{item}</button>)}</div></div>}
          {messages.map((message) => <article className={`assistant-message ${message.role === 'user' ? 'user' : 'bot'}`} key={message.localID}>
            <div className="assistant-message-avatar">{message.role === 'user' ? '我' : 'R'}</div>
            <div><div className="assistant-message-role">{message.role === 'user' ? '你' : '小爱'}</div><p>{message.content || (sending ? <span className="assistant-typing">正在思考</span> : '')}</p></div>
          </article>)}
          <div ref={messageEnd} />
        </div>
        {notice && <div className="assistant-notice" role="status">{notice}</div>}
        <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); void send() }}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send() } }} placeholder="给社团助手发送消息" disabled={sending} rows={1} /><div className="assistant-composer-bottom"><div className="assistant-composer-tools"><span>社团知识库</span><small>Enter 发送，Shift + Enter 换行</small></div><button type="submit" disabled={sending || !draft.trim()} aria-label="发送消息">↑</button></div></form>
      </section>
      {pendingDeleteSessionID && <div className="assistant-delete-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !deletingSessionID) setPendingDeleteSessionID(null) }}><section className="assistant-delete-card" role="dialog" aria-modal="true" aria-labelledby="assistant-delete-title"><div className="assistant-delete-icon">!</div><h2 id="assistant-delete-title">删除这个会话？</h2><p>会话中的全部聊天记录将被永久删除，无法恢复。</p><div><button type="button" disabled={Boolean(deletingSessionID)} onClick={() => setPendingDeleteSessionID(null)}>取消</button><button className="assistant-delete-confirm" type="button" disabled={Boolean(deletingSessionID)} onClick={() => void deleteSession(pendingDeleteSessionID)}>{deletingSessionID ? '删除中...' : '删除会话'}</button></div></section></div>}
    </section>
  </main>
}
