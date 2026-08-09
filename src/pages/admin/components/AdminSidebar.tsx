import { useState } from 'react'
import { ADMIN_MENU, type AdminTab } from '@/pages/admin/types'

const icons: Record<string, string> = { '工作台': '⌂', '内容创作': '✎', '互动反馈': '♡', '系统管理': '⚙' }

export default function AdminSidebar({ tab, role, onChange }: { tab: AdminTab; role: string; onChange: (tab: AdminTab) => void }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ '内容创作': true, '系统管理': true })
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand"><span className="admin-brand-mark">R</span><div><b>RenaiTeam</b><small>社团内容中台</small></div></div>
      <div className="admin-workspace"><span className="workspace-dot" />Renai 社团<span className="workspace-chevron">⌄</span></div>
      <nav className="admin-menu" aria-label="后台导航">
        {ADMIN_MENU.filter((group) => !group.adminOnly || role === 'admin').map((group) => {
          const open = expanded[group.label] ?? false
          const direct = !group.collapsible
          return <div className="admin-menu-group" key={group.label}>
            {direct ? <button className={`admin-menu-link ${tab === group.items[0].id ? 'active' : ''}`} type="button" onClick={() => onChange(group.items[0].id)}><span className="menu-icon">{icons[group.label] ?? '•'}</span>{group.label}</button> : <button className="admin-menu-heading" type="button" onClick={() => setExpanded((current) => ({ ...current, [group.label]: !open }))}><span className="menu-icon">{icons[group.label] ?? '•'}</span><span>{group.label}</span><span className={open ? 'admin-menu-arrow expanded' : 'admin-menu-arrow'}>›</span></button>}
            {group.collapsible && open && <div className="admin-menu-items">{group.items.map((item) => <button key={item.id} type="button" className={`admin-menu-link ${tab === item.id ? 'active' : ''}`} onClick={() => onChange(item.id)}>{item.label}</button>)}</div>}
          </div>
        })}
      </nav>
      <div className="admin-sidebar-footer"><div className="footer-line"><span className="status-dot" />系统运行正常</div><small>RenaiTeam · 2026</small></div>
    </aside>
  )
}
