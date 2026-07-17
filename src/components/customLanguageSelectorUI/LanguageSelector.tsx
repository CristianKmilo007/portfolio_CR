import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from '@heroui/react'
import 'flag-icons/css/flag-icons.min.css'
import { useTranslation } from 'react-i18next'
import { useLanguageSelector } from './hooks/useLanguageSelector'

export default function LanguageSelector() {
  const { t } = useTranslation()

  const {
    selectedCountry,
    selectedKey,
    handleSelect,
    filterText,
    setFilterText,
    filteredLangs,
  } = useLanguageSelector()

  return (
    <Dropdown
      classNames={{
        base: '!w-[160px]',
        content: 'min-w-min text-white',
      }}
    >
      <DropdownTrigger>
        <Button
          radius="full"
          variant="light"
          className="h-auto w-max min-w-max px-0 p-0 size-10 border border-white dark:border-[#3b3b3b] button-link !cursor-none"
        >
          <span
            className={`fi fi-${selectedCountry.flagIcon} fis !size-[26px] rounded-full`}
          />
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Selecciona un idioma"
        selectionMode="single"
        selectedKeys={new Set([selectedKey])}
        onSelectionChange={(keys) => {
          const [key] = Array.from(keys) as Array<string>
          handleSelect(key)
        }}
        variant="flat"
        topContent={
          <Input
            placeholder={t('Buscar idioma...')}
            value={filterText}
            onValueChange={setFilterText}
            size="sm"
            className="w-full"
            autoFocus
          />
        }
        disabledKeys={['no-results']}
      >
        {
          filteredLangs.map((lang) => (
            <DropdownItem
              key={lang.code}
              startContent={
                <span className={`fi fi-${lang.flagIcon} rounded`} />
              }
            >
              {t(lang.label)}
            </DropdownItem>
          )) as any
        }

        {filteredLangs.length === 0 && (
          <DropdownItem key="no-results">{t('No hay resultados')}</DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  )
}
