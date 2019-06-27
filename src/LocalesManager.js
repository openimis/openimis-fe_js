import { addLocaleData } from "react-intl";
import localeByLang, { locales } from "./locales";

class LocalesManager {

  constructor() {
    locales.forEach((lc) => { addLocaleData(lc.key) });
  }

  getLocale(lang) {
    return localeByLang[lang];
  }

}

export default LocalesManager;
