import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ruTranslation from './locales/ru.json';
import enTranslation from './locales/en.json';
import uaTranslation from './locales/ua.json';

const resources = {
  ru: { translation: ruTranslation },
  en: { translation: enTranslation },
  ua: { translation: uaTranslation }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('industrial-hub-lang') || 'ru',
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
