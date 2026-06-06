import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/public/locales/en/translation.json';
import pt from '@/public/locales/pt/translation.json';
import de from '@/public/locales/de/translation.json';
import da from '@/public/locales/da/translation.json';
import es from '@/public/locales/es/translation.json';
import it from '@/public/locales/it/translation.json';

const resources = {
  en: { translation: en },
  pt: { translation: pt },
  de: { translation: de },
  da: { translation: da },
  es: { translation: es },
  it: { translation: it },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt', 'de', 'da', 'es', 'it'],
    resources,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
