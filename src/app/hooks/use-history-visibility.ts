import { useCallback, useState } from 'react'
import { useMediaQuery } from '@/hooks/use-media-query'

const DESKTOP_QUERY = '(min-width: 1024px)'

export function useHistoryVisibility() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const [desktopOpen, setDesktopOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const open = isDesktop ? desktopOpen : mobileOpen
  const setOpen = isDesktop ? setDesktopOpen : setMobileOpen

  const toggle = useCallback(() => {
    setOpen((current) => !current)
  }, [setOpen])

  const closeOnMobile = useCallback(() => setMobileOpen(false), [])

  return { isDesktop, open, setOpen, toggle, closeOnMobile }
}
