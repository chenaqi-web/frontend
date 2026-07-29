import SiteLayout from '@/components/layout/SiteLayout'
import { usePathname } from '@/hooks/usePathname'
import { routes } from '@/router/routes'

function App() {
  const pathname = usePathname()
  const route = routes.find((item) => item.path === pathname) ?? routes[0]

  return <SiteLayout pathname={pathname}>{route.element}</SiteLayout>
}

export default App
