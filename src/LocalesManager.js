import { addLocaleData } from "react-intl";
import localeByLang, { locales, fileNamesByLang } from "./locales";

class LocalesManager {

  constructor() {
    locales.forEach((lc) => { addLocaleData(lc) });
  }

  getLocale(lang) {
    // messages in requested language are injected as the default 'en' locale
    return "en";
  }

  getFileNameByLang(lang) {
    return fileNamesByLang[lang];
  }

}

export default LocalesManager;
