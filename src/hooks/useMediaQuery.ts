import { useEffect, useState } from 'react'

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, [matches, query])

  return matches
}

export const useResponsive = () => {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(max-width: 768px)')
  const isLaptop = useMediaQuery('(max-width: 1024px)')
  const isDesktopXL = useMediaQuery('(max-width: 1280px)')
  const isDesktop2XL = useMediaQuery('(max-width: 1536px)')
  
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return { isMobile, isTablet, isLaptop, isDesktop, isDesktopXL, isDesktop2XL }
}
