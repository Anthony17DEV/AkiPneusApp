import i18next, { InitOptions } from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import en from './en.json'
import hi from './hi.json'
import ar from './ar.json'
import fr from './fr.json'

const i18nOptions: InitOptions = {
  compatibilityJSON: 'v3',
  lng: 'en',
  resources: {
    en: en,
    hi: hi,
    ar: ar,
    fr: fr,
  },
}

i18next.use(initReactI18next).init(i18nOptions)

export default i18next
