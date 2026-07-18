import { useEffect, useState } from 'react'

export const useMediaQuery = (query: string) => {
  // Evaluamos el estado inicial directamente
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Si la query cambió entre el estado inicial y el montaje, actualizamos
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Escuchamos los cambios ESPECÍFICOS de la media query, no todo el 'resize' de la ventana
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      // Fallback para navegadores antiguos (ej. Safari muy viejo)
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
    // OJO: quitamos "matches" de las dependencias para evitar re-binds infinitos
  }, [query]); 

  return matches;
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
