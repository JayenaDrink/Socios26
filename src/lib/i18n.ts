import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import nl from '../locales/nl.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';

const resources = {
  nl: { translation: nl },
  fr: { translation: fr },
  es: { translation: es }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'nl',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
