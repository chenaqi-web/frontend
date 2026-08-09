import { ADMIN_MENU, TAB_PATHS, type AdminTab } from '@/pages/admin/types'

interface Props {
  tab: AdminTab
  role: string
  onChange: (tab: AdminTab) => void
}

export default function AdminSidebar({ tab, role, onChange }: Props) {
  const visibleMenu = ADMIN_MENU.filter((item) => !item.roles || item.roles.includes(role))

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        <div>
          <b>RenaiTeam</b>
          <small>管理后台</small>
        </div>
      </div>
      <div className="admin-menu">
        {visibleMenu.map((item) => (
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
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  )
}