import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { navigate } from '@/hooks/usePathname'

interface AppLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
}

export default function AppLink({ to, onClick, ...props }: AppLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
    event.preventDefault()
    navigate(to)
  }

  return <a href={to} onClick={handleClick} {...props} />
}
