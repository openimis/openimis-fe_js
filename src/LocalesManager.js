import { addLocaleData } from "react-intl";
import localeByLang, { locales, fileNamesByLang } from "./locales";

class LocalesManager {

  constructor() {
    locales.forEach((lc) => { addLocaleData(lc.key) });
  }

  getLocale(lang) {
    return localeByLang[lang];
  }

  getFileNameByLang(lang) {
    return fileNamesByLang[lang];
  }

}

export default LocalesManager;
