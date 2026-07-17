import fs from 'fs-extra'
import { translate } from '@vitalets/google-translate-api'
import ora from 'ora'

const SRC_LOCALE = 'public/locales/es/translation.json'
const TARGET_LANGS = ['en', 'zh'] as const
const BASE_PATH = 'public/locales'

type LocaleMap = Record<string, string>

async function loadJSON(path: string): Promise<LocaleMap> {
  const exists = await fs.pathExists(path)
  if (!exists) return {}
  return fs.readJson(path) as Promise<LocaleMap>
}

async function saveJSON(path: string, data: LocaleMap): Promise<void> {
  await fs.ensureDir(path.replace(/\/[^/]+$/, ''))
  await fs.writeJson(path, data, { spaces: 2 })
}

async function translateKey(
  text: string,
  to: (typeof TARGET_LANGS)[number],
): Promise<string> {
  if (!text) return text
  const res = await translate(text, { to })
  return res.text
}

async function buildTranslations(): Promise<void> {
  const source = await loadJSON(SRC_LOCALE)

  // 1) Asegúrate de que todas las keys en source tengan un valor
  for (const key of Object.keys(source)) {
    if (!source[key]) source[key] = key
  }
  // 2) Guardar tal cual para español
  await saveJSON(`${BASE_PATH}/es/translation.json`, source)

  // 3) Para cada idioma destino…
  for (const lng of TARGET_LANGS) {
    const destPath = `${BASE_PATH}/${lng}/translation.json`
    const dest = await loadJSON(destPath)

    // Calculamos solo las claves que faltan por traducir
    const keysToTranslate = Object.keys(source).filter((k) => !dest[k])

    // Muestro cuántas van a traducirse
    console.log(`\n→ [${lng}] ${keysToTranslate.length} claves por traducir`)

    // Spinner mientras traduce el batch entero
    const spinner = ora(`Traduciendo…`).start()

    for (const key of keysToTranslate) {
      const tr = await translateKey(source[key], lng)
      dest[key] = tr
    }

    await saveJSON(destPath, dest)
    spinner.succeed(`[${lng}] Traducción completada`)
  }

  console.log('✅ Todas las traducciones completadas.')
}

buildTranslations().catch((err) => {
  console.error(err)
  process.exit(1)
})
