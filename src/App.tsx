import SiteLayout from '@/components/layout/SiteLayout'
import { usePathname } from '@/hooks/usePathname'
import { routes } from '@/router/routes'

function App() {
  const pathname = usePathname()
  const route = routes.find((item) => item.path === pathname || (item.path.includes('/:') && pathname.startsWith(item.path.split('/:')[0] + '/'))) ?? routes[0]

  if (pathname.startsWith('/admin')) return route.element
  return <SiteLayout pathname={pathname}>{route.element}</SiteLayout>
}

export default App
