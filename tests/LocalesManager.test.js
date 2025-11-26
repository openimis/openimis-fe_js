// tests/LocalesManager.test.js
import LocalesManager from '../src/LocalesManager';

// Mock du module locales
jest.mock('../src/locales', () => ({
  fileNamesByLang: {
    en: 'en.json',
    fr: 'fr.json',
    es: 'es.json'
  }
}));

describe('LocalesManager', () => {
  let localesManager;

  beforeEach(() => {
    localesManager = new LocalesManager();
  });

  describe('getLocale', () => {
    it('should always return "en" as the locale', () => {
      expect(localesManager.getLocale('fr')).toBe('en');
      expect(localesManager.getLocale('en')).toBe('en');
      expect(localesManager.getLocale('es')).toBe('en');
    });
  });

  describe('getFileNameByLang', () => {
    it('should return the correct file name for each language', () => {
      expect(localesManager.getFileNameByLang('en')).toBe('en.json');
      expect(localesManager.getFileNameByLang('fr')).toBe('fr.json');
      expect(localesManager.getFileNameByLang('es')).toBe('es.json');
    });

    it('should return undefined for unknown languages', () => {
      expect(localesManager.getFileNameByLang('de')).toBeUndefined();
    });
  });
});