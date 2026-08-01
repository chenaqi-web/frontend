import { ADMIN_MENU, TAB_PATHS, type AdminTab } from '@/pages/admin/types'

interface Props {
  tab: AdminTab
  onChange: (tab: AdminTab) => void
}

export default function AdminSidebar({ tab, onChange }: Props) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        <span>R</span>
        <div>
          <b>RenaiTeam</b>
          <small>管理后台</small>
        </div>
      </div>
      <div className="admin-menu">
        {ADMIN_MENU.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'active' : ''}
            onClick={() => {
              onChange(item.id)
              window.history.pushState({}, '', TAB_PATHS[item.id])
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
          >
            <i>{item.icon}</i>
            {item.label}
          </button>
        ))}
      </div>
      <div className="admin-sidebar-doodle">♡ ★ ☁</div>
    </aside>
  )
}
