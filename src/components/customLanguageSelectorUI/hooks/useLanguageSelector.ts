import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface CountryObject {
  flagIcon: string
  code: string
  label: string
}

const languages: Array<CountryObject> = [
  { flagIcon: 'es', code: 'es', label: 'Español' },
  { flagIcon: 'gb', code: 'en', label: 'Inglés' },
  { flagIcon: 'cn', code: 'zh', label: 'Chino' },
]

const LOCAL_KEY = 'selectedLanguage'

export const useLanguageSelector = () => {
  const { i18n } = useTranslation()

  // lectura segura de localStorage (para SSR)
  const getSavedCode = () => {
    if (typeof window === 'undefined') return i18n.language
    // primero nuestra clave propia
    const my = window.localStorage.getItem(LOCAL_KEY)
    if (my) return my
    // si no hay, fallback a la clave de i18next para compatibilidad
    return window.localStorage.getItem('i18nextLng') || i18n.language
  }

  const savedCode = getSavedCode()
  const initialCountry =
    languages.find((l) => l.code === savedCode) || languages[0]

  const [selectedCountry, setSelectedCountry] =
    useState<CountryObject>(initialCountry)
  const [selectedKey, setSelectedKey] = useState<string>(savedCode)
  const [filterText, setFilterText] = useState<string>('')

  // mantiene la lógica original: al montar, si el i18n actual difiere, lo cambia
  useEffect(() => {
    const code = getSavedCode()
    if (code && code !== i18n.language) {
      i18n.changeLanguage(code)
    }
    // sólo en mount, sin listeners
  }, [])

  const handleSelect = (newCode: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCAL_KEY, newCode)
    }
    i18n.changeLanguage(newCode)
    const country = languages.find((l) => l.code === newCode)
    if (country) {
      setSelectedCountry(country)
      setSelectedKey(newCode)
    }
  }

  const filteredLangs = useMemo(() => {
    const low = filterText.toLowerCase()
    return languages.filter(
      (l) =>
        l.label.toLowerCase().includes(low) ||
        l.code.toLowerCase().includes(low),
    )
  }, [filterText])

  return {
    selectedCountry,
    selectedKey,
    handleSelect,
    filterText,
    setFilterText,
    filteredLangs
  }
}
