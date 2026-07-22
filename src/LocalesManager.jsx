import { fileNamesByLang } from "./locales.jsx";

class LocalesManager {
  getLocale(lang) {
    // messages in requested language are injected as the default 'en' locale
    return "en";
  }

  getFileNameByLang(lang) {
    return fileNamesByLang[lang];
  }
}

export default LocalesManager;
