export type AppTab = 'home' | 'prayer' | 'quran' | 'explore' | 'profile';

export type ExploreFeature =
  | 'menu'
  | 'qibla'
  | 'tasbih'
  | 'duas'
  | 'hadith'
  | 'ramadan'
  | 'zakat'
  | 'names'
  | 'mosques'
  | 'learning'
  | 'quiz'
  | 'calendar';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  isGuest: boolean;
  preferredLanguage?: string;
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  prayerCalculationMethod: CalculationMethod;
  asrMethod: 'standard' | 'hanafi';
  hijriDateAdjustment?: number; // -2, -1, 0, +1, +2 days
  prayerTimeOffsets?: {
    fajr?: number;
    sunrise?: number;
    dhuhr?: number;
    asr?: number;
    maghrib?: number;
    isha?: number;
  };
  highLatitudeRule?: 'middleOfTheNight' | 'oneSeventh' | 'angleBased' | 'none';
  notifications: {
    fajr: boolean;
    sunrise: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    dailyQuran?: boolean;
    dailyDua?: boolean;
    dailyHadith?: boolean;
    ramadanReminder?: boolean;
  };
  arabicFontSize?: 'sm' | 'md' | 'lg' | 'xl';
  showTransliteration?: boolean;
  quranProgress: {
    lastReadSurah: number;
    lastReadAyah: number;
    completedSurahs: number[];
    percentage: number;
  };
  bookmarks: QuranBookmark[];
  customDhikrs?: TasbihDhikr[];
  tasbihHistory?: TasbihRecord[];
  tasbihTotal?: number;
  quizScore?: number;
  fastingTracker?: {
    fastedDays: number[];
    taraweehDays: number[];
  };
  qadaPrayers: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
}

export type CalculationMethod =
  | 'MWL' // Muslim World League
  | 'ISNA' // Islamic Society of North America
  | 'Egypt' // Egyptian General Authority
  | 'Makkah' // Umm Al-Qura University, Makkah
  | 'Karachi' // University of Islamic Sciences, Karachi
  | 'Tehran' // Institute of Geophysics, Tehran
  | 'Gulf' // Gulf Region / UAE
  | 'France' // Union des Organisations Islamiques de France (UOIF)
  | 'Singapore' // Majlis Ugama Islam Singapura (MUIS)
  | 'Diyanet'; // Presidency of Religious Affairs (Diyanet), Turkey

export interface PrayerTimeData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: Date;
  hijriDate: HijriDate;
  nextPrayer: {
    name: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
    time: string;
    remainingFormatted: string;
    totalSecondsRemaining: number;
  };
}

export interface HijriDate {
  day: number;
  month: number;
  monthNumber?: number;
  monthName: string;
  monthArabic: string;
  year: number;
  formatted: string;
  formattedArabic: string;
}

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  numberInSurah: number;
  arabicText: string;
  transliteration: string;
  translation: string;
  audioUrl?: string;
  juz?: number;
  page?: number;
}

export interface SurahDetail extends SurahMeta {
  bismillahPre: boolean;
  ayahs: Ayah[];
}

export interface JuzMeta {
  number: number;
  nameArabic: string;
  nameTransliteration: string;
  nameEnglish: string;
  startSurahNumber: number;
  startSurahName: string;
  startAyahNumber: number;
  endSurahNumber: number;
  endSurahName: string;
  endAyahNumber: number;
  totalAyahs: number;
}

export interface QuranBookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  translation: string;
  timestamp: number;
  note?: string;
}

export interface TasbihDhikr {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  virtue?: string;
  count: number;
  target: number;
}

export interface TasbihRecord {
  id: string;
  dhikrName: string;
  count: number;
  target: number;
  date: string;
}

export interface DuaCategory {
  id: string;
  title: string;
  arabicTitle: string;
  iconName: string;
  description: string;
}

export interface DuaItem {
  id: string;
  categoryId?: string;
  category?: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  benefit?: string;
  audioUrl?: string;
}

export interface HadithItem {
  id: string;
  collection: string;
  category: string;
  narrator: string;
  textArabic?: string;
  textEnglish: string;
  reference: string;
  hadithNumber: string;
  grade?: string;
}

export interface NameOfAllah {
  number: number;
  arabic: string;
  transliteration: string;
  englishMeaning: string;
  explanation: string;
  quranReference?: string;
}

export interface IslamicEvent {
  id: string;
  name: string;
  arabicName: string;
  hijriDateFormatted: string;
  hijriDay: number;
  hijriMonth: number;
  gregorianDateFormatted: string;
  description: string;
  isImportant: boolean;
}

export interface MosqueItem {
  id: string;
  name: string;
  arabicName?: string;
  address: string;
  city: string;
  distanceKm: number;
  capacity?: number;
  facilities: string[];
  lat: number;
  lng: number;
  phone?: string;
  hasWomenSection: boolean;
  osmUrl?: string;
  denomination?: string;
  openingHours?: string;
  verified?: boolean;
}

export interface QuizQuestion {
  id: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  reference: string;
}

export interface LearningTopicContent {
  heading: string;
  paragraphs: string[];
  arabicQuote?: {
    arabic: string;
    translation: string;
    reference: string;
  };
}

export interface LearningTopic {
  id: string;
  category: string;
  title: string;
  arabicTitle?: string;
  subtitle: string;
  readTime: string;
  content: LearningTopicContent[];
}

export interface ZakatCalculation {
  cash: number;
  goldGrams: number;
  silverGrams: number;
  investments: number;
  businessAssets: number;
  liabilities: number;
  netWealth: number;
  zakatDue: number;
  isEligible: boolean;
}
