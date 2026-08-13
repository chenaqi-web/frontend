import { useEffect, useState } from 'react'
import SiteLayout from '@/components/layout/SiteLayout'
import LoginPage from '@/pages/auth/LoginPage'
import { navigate, usePathname } from '@/hooks/usePathname'
import { routes } from '@/router/routes'

function App() {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('renai_access_token')))
  const route = routes.find((item) => item.path === pathname || (item.path.includes('/:') && pathname.startsWith(item.path.split('/:')[0] + '/'))) ?? routes[0]

  useEffect(() => {
    if (pathname.startsWith('/admin') && !localStorage.getItem('renai_access_token')) {
      navigate('/login')
      return
    }
    setIsAuthenticated(Boolean(localStorage.getItem('renai_access_token')))
  }, [pathname])

  if (pathname.startsWith('/admin') && !isAuthenticated) return <LoginPage />
  if (pathname.startsWith('/admin')) return route.element
  return <SiteLayout pathname={pathname}>{route.element}</SiteLayout>
}

export default App
