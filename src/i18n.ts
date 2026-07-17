import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

const savedLang = window.sessionStorage.getItem('i18nextLng') || 'es'

i18n
  .use(HttpBackend)                 // carga JSON vía fetch
  .use(LanguageDetector)            // detecta idioma del navegador
  .use(initReactI18next)            // conecta con React
  .init({
    interpolation: {
      escapeValue: false,
    },
    ns: ['translation'],
    defaultNS: 'translation',
    lng: savedLang,
    fallbackLng: ['es','en', 'zh'],
    debug: false,
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    react: { useSuspense: false },
  });

export default i18n; 