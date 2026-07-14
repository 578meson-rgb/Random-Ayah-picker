/**
 * Types and Interfaces for Quran Daily Reflection
 */

export interface SurahMetadata {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface TranslationEdition {
  id: string;
  name: string;
  author: string;
  language: string;
}

export interface AyahData {
  number: number; // absolute number (1-6236)
  text: string;   // text of the verse
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | any;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
  };
}

export interface AyahApiResponse {
  arabic: AyahData;
  primary: AyahData;
  secondary: AyahData | null;
}

export interface GeminiReflection {
  context: string;
  reflection: string;
  explanation: string;
  keywords: string[];
}

export interface BookmarkedAyah {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  surahEnglishName: string;
  arabicText: string;
  translationText: string;
  timestamp: number;
}

export interface HistoryItem {
  surahNumber: number;
  ayahNumber: number;
  surahEnglishName: string;
  timestamp: number;
}

export interface UserPreferences {
  primaryTranslation: string; // e.g. 'en.sahih'
  secondaryLanguage: string;   // e.g. 'bn.bengali' or 'none'
  audioEnabled: boolean;
  reciter: string;
}
