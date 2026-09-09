import { ALL_SURAHS } from '../data/surahs';
import { DuaItem, AppTab, ExploreFeature } from '../types';
import { audioService } from './audioService';

export type RecitationMode = 'arabic' | 'translation' | 'both';

export interface RecitationStatus {
  isPlaying: boolean;
  isPaused: boolean;
  currentDuaId: string | null;
  currentTitle: string | null;
  currentPhase: 'arabic' | 'translation' | 'idle';
  rate: number;
}

export type VoiceActionType =
  | 'NAVIGATE_TAB'
  | 'NAVIGATE_EXPLORE'
  | 'OPEN_SURAH'
  | 'TOGGLE_THEME'
  | 'OPEN_SEARCH'
  | 'STOP_AUDIO'
  | 'RECITE_DUA'
  | 'SHOW_HELP'
  | 'UNKNOWN';

export interface VoiceCommandResult {
  action: VoiceActionType;
  rawText: string;
  feedback: string;
  tab?: AppTab;
  exploreFeature?: ExploreFeature;
  surahNumber?: number;
  surahName?: string;
  theme?: 'light' | 'dark';
}

// Window typing for Web Speech API
type SpeechRecognitionType = any;

class SpeechService {
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private statusListeners: Array<(status: RecitationStatus) => void> = [];
  private voicesLoaded = false;
  private arabicVoices: SpeechSynthesisVoice[] = [];
  private englishVoices: SpeechSynthesisVoice[] = [];

  private currentStatus: RecitationStatus = {
    isPlaying: false,
    isPaused: false,
    currentDuaId: null,
    currentTitle: null,
    currentPhase: 'idle',
    rate: 0.85,
  };

  // Speech Recognition properties
  private recognition: SpeechRecognitionType | null = null;
  private isRecognitionActive = false;
  private isContinuousMode = false;
  private recognitionListeners: {
    onInterim?: (text: string) => void;
    onCommand?: (result: VoiceCommandResult) => void;
    onStateChange?: (active: boolean) => void;
    onError?: (msg: string) => void;
  } = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVoices();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoices();
        };
      }
    }
  }

  /* -------------------------------------------------------------
   * 1. SPEECH SYNTHESIS (DUAS RECITATION)
   * ----------------------------------------------------------- */

  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private initVoices(): void {
    if (!this.isSpeechSynthesisSupported()) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      this.voicesLoaded = true;
      this.arabicVoices = voices.filter(
        (v) => v.lang.startsWith('ar') || v.lang.includes('AR')
      );
      this.englishVoices = voices.filter(
        (v) => v.lang.startsWith('en') || v.lang.includes('EN')
      );
    }
  }

  public getArabicVoices(): SpeechSynthesisVoice[] {
    if (!this.voicesLoaded) this.initVoices();
    return this.arabicVoices;
  }

  public getStatus(): RecitationStatus {
    return { ...this.currentStatus };
  }

  public subscribeStatus(listener: (status: RecitationStatus) => void): () => void {
    this.statusListeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private notifyStatus(): void {
    const copy = this.getStatus();
    this.statusListeners.forEach((fn) => fn(copy));
  }

  public stopRecitation(): void {
    if (this.isSpeechSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    audioService.stopSpeakingArabic();
    this.activeUtterance = null;
    this.currentStatus = {
      ...this.currentStatus,
      isPlaying: false,
      isPaused: false,
      currentDuaId: null,
      currentTitle: null,
      currentPhase: 'idle',
    };
    this.notifyStatus();
  }

  public pauseRecitation(): void {
    if (this.currentStatus.isPlaying && !this.currentStatus.isPaused) {
      if (this.isSpeechSynthesisSupported()) {
        try {
          window.speechSynthesis.pause();
        } catch {
          // ignore
        }
      }
      audioService.pauseSpeakingArabic();
      this.currentStatus.isPaused = true;
      this.notifyStatus();
    }
  }

  public resumeRecitation(): void {
    if (this.currentStatus.isPaused) {
      if (this.isSpeechSynthesisSupported()) {
        try {
          window.speechSynthesis.resume();
        } catch {
          // ignore
        }
      }
      audioService.resumeSpeakingArabic();
      this.currentStatus.isPaused = false;
      this.notifyStatus();
    }
  }

  public setRate(newRate: number): void {
    this.currentStatus.rate = Math.max(0.6, Math.min(1.4, newRate));
    this.notifyStatus();
  }

  /**
   * Recites a specific Dua using Web Speech API SpeechSynthesis
   */
  public reciteDua(
    dua: DuaItem,
    mode: RecitationMode = 'both',
    customRate?: number
  ): void {
    if (!this.isSpeechSynthesisSupported()) {
      console.warn('Web Speech API SpeechSynthesis is not supported in this browser.');
      return;
    }

    // Stop existing speech
    this.stopRecitation();

    const rate = customRate ?? this.currentStatus.rate;
    this.currentStatus = {
      isPlaying: true,
      isPaused: false,
      currentDuaId: dua.id,
      currentTitle: dua.title,
      currentPhase: mode === 'translation' ? 'translation' : 'arabic',
      rate,
    };
    this.notifyStatus();

    // Helper: speak English translation
    const speakTranslation = () => {
      this.currentStatus.currentPhase = 'translation';
      this.notifyStatus();

      const utterEn = new SpeechSynthesisUtterance(dua.translation);
      utterEn.lang = 'en-US';
      utterEn.rate = Math.max(0.8, rate * 1.05); // Slightly natural English tempo
      utterEn.pitch = 1.0;

      if (this.englishVoices.length > 0) {
        const preferred =
          this.englishVoices.find((v) => v.name.includes('Natural') || v.name.includes('Google')) ||
          this.englishVoices[0];
        if (preferred) utterEn.voice = preferred;
      }

      utterEn.onend = () => {
        this.stopRecitation();
      };

      utterEn.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('Speech synthesis error on translation:', e);
        }
        this.stopRecitation();
      };

      this.activeUtterance = utterEn;
      window.speechSynthesis.speak(utterEn);
    };

    // If translation only
    if (mode === 'translation') {
      speakTranslation();
      return;
    }

    // If no Arabic TTS voice is installed in browser/OS, use dependable audio stream
    if (this.arabicVoices.length === 0) {
      this.activeUtterance = null;
      audioService.speakArabicText(dua.arabic, () => {
        if (mode === 'both') {
          setTimeout(() => {
            if (this.currentStatus.isPlaying && this.currentStatus.currentDuaId === dua.id) {
              speakTranslation();
            }
          }, 400);
        } else {
          this.stopRecitation();
        }
      });
      return;
    }

    // Speak Arabic text using Web Speech API
    const utterAr = new SpeechSynthesisUtterance(dua.arabic);
    utterAr.lang = 'ar-SA';
    // Deliberate measured rate for tajweed clarity & harakat
    utterAr.rate = rate;
    utterAr.pitch = 1.0;

    const preferred =
      this.arabicVoices.find((v) => v.lang === 'ar-SA' || v.name.includes('Saudi')) ||
      this.arabicVoices[0];
    if (preferred) utterAr.voice = preferred;

    utterAr.onend = () => {
      if (mode === 'both') {
        // Small pause between Arabic recitation and English translation
        setTimeout(() => {
          if (this.currentStatus.isPlaying && this.currentStatus.currentDuaId === dua.id) {
            speakTranslation();
          }
        }, 600);
      } else {
        this.stopRecitation();
      }
    };

    utterAr.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis error on Arabic, using audio fallback:', e);
        // Fallback to audio stream
        audioService.speakArabicText(dua.arabic, () => {
          if (mode === 'both') {
            speakTranslation();
          } else {
            this.stopRecitation();
          }
        });
        return;
      }
      this.stopRecitation();
    };

    this.activeUtterance = utterAr;
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterAr);
  }

  /**
   * Simple speak text with auto language detection
   */
  public speakQuick(text: string, lang = 'en-US'): void {
    if (!this.isSpeechSynthesisSupported()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 1.0;
    window.speechSynthesis.speak(u);
  }

  /* -------------------------------------------------------------
   * 2. SPEECH RECOGNITION (HANDS-FREE NAVIGATION)
   * ----------------------------------------------------------- */

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  public getRecognitionState(): boolean {
    return this.isRecognitionActive;
  }

  public startListening(options: {
    continuous?: boolean;
    onInterim?: (text: string) => void;
    onCommand?: (result: VoiceCommandResult) => void;
    onStateChange?: (active: boolean) => void;
    onError?: (msg: string) => void;
  }): void {
    if (!this.isSpeechRecognitionSupported()) {
      options.onError?.('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    this.stopListening();

    this.isContinuousMode = options.continuous ?? false;
    this.recognitionListeners = {
      onInterim: options.onInterim,
      onCommand: options.onCommand,
      onStateChange: options.onStateChange,
      onError: options.onError,
    };

    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();

      this.recognition.continuous = this.isContinuousMode;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 3;

      this.recognition.onstart = () => {
        this.isRecognitionActive = true;
        this.recognitionListeners.onStateChange?.(true);
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (interimTranscript) {
          this.recognitionListeners.onInterim?.(interimTranscript);
        }

        if (finalTranscript) {
          this.recognitionListeners.onInterim?.(finalTranscript);
          const commandResult = this.parseVoiceCommand(finalTranscript);
          this.recognitionListeners.onCommand?.(commandResult);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          this.recognitionListeners.onError?.(
            'Microphone access denied. Please allow microphone permissions in your browser settings.'
          );
          this.stopListening();
        } else if (event.error === 'no-speech') {
          // Normal timeout when quiet, handled cleanly
        } else {
          this.recognitionListeners.onError?.(`Speech error: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        // If continuous mode is enabled and user hasn't explicitly stopped, restart
        if (this.isContinuousMode && this.isRecognitionActive) {
          try {
            this.recognition?.start();
          } catch {
            this.isRecognitionActive = false;
            this.recognitionListeners.onStateChange?.(false);
          }
        } else {
          this.isRecognitionActive = false;
          this.recognitionListeners.onStateChange?.(false);
        }
      };

      this.recognition.start();
    } catch (err: any) {
      console.error('Failed to initialize speech recognition:', err);
      this.recognitionListeners.onError?.(
        err?.message || 'Could not start voice recognition.'
      );
      this.isRecognitionActive = false;
      this.recognitionListeners.onStateChange?.(false);
    }
  }

  public stopListening(): void {
    this.isContinuousMode = false;
    this.isRecognitionActive = false;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Safe ignore
      }
      this.recognition = null;
    }
    this.recognitionListeners.onStateChange?.(false);
  }

  /**
   * Parse natural language spoken commands into application actions
   */
  public parseVoiceCommand(spokenText: string): VoiceCommandResult {
    const raw = spokenText.trim();
    const clean = raw
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // 1. SURAH MATCHING (e.g. "surah yasin", "surah al baqarah", "surah 36", "read surah kahf")
    const surahMatch = this.detectSurahRequest(clean);
    if (surahMatch) {
      return {
        action: 'OPEN_SURAH',
        rawText: raw,
        feedback: `Opening Surah ${surahMatch.englishName} (${surahMatch.name})`,
        surahNumber: surahMatch.number,
        surahName: surahMatch.englishName,
      };
    }

    // 2. STOP AUDIO / RECITATION
    if (
      clean.includes('stop audio') ||
      clean.includes('stop recitation') ||
      clean.includes('stop playing') ||
      clean === 'stop' ||
      clean === 'pause' ||
      clean.includes('mute')
    ) {
      return {
        action: 'STOP_AUDIO',
        rawText: raw,
        feedback: 'Recitation stopped.',
      };
    }

    // 3. RECITE DUA
    if (
      clean.includes('recite dua') ||
      clean.includes('play dua') ||
      clean.includes('read dua') ||
      clean.includes('listen to dua') ||
      clean.includes('listen dua')
    ) {
      return {
        action: 'RECITE_DUA',
        rawText: raw,
        feedback: 'Opening Duas to recite supplication...',
      };
    }

    // 4. THEME CONTROLS
    if (clean.includes('dark mode') || clean.includes('night mode')) {
      return {
        action: 'TOGGLE_THEME',
        rawText: raw,
        feedback: 'Switched to Dark Mode',
        theme: 'dark',
      };
    }
    if (clean.includes('light mode') || clean.includes('day mode')) {
      return {
        action: 'TOGGLE_THEME',
        rawText: raw,
        feedback: 'Switched to Light Mode',
        theme: 'light',
      };
    }

    // 5. GLOBAL SEARCH
    if (
      clean.includes('search') ||
      clean.includes('find') ||
      clean.includes('open search')
    ) {
      return {
        action: 'OPEN_SEARCH',
        rawText: raw,
        feedback: 'Opening Search...',
      };
    }

    // 6. HELP / COMMANDS
    if (
      clean.includes('help') ||
      clean.includes('commands') ||
      clean.includes('what can i say') ||
      clean.includes('how to use')
    ) {
      return {
        action: 'SHOW_HELP',
        rawText: raw,
        feedback: 'Showing available voice commands...',
      };
    }

    // 7. EXPLORE SUB-FEATURES
    // Duas
    if (
      clean.includes('dua') ||
      clean.includes('duas') ||
      clean.includes('supplication') ||
      clean.includes('supplications') ||
      clean.includes('hisn') ||
      clean.includes('athkar') ||
      clean.includes('adhkar')
    ) {
      return {
        action: 'NAVIGATE_EXPLORE',
        rawText: raw,
        feedback: 'Opening Authentic Duas & Supplications...',
        exploreFeature: 'duas',
      };
    }

    // Tasbih
    if (
      clean.includes('tasbih') ||
      clean.includes('tasbeeh') ||
      clean.includes('dhikr') ||
      clean.includes('counter') ||
      clean.includes('rosary')
    ) {
      return {
        action: 'NAVIGATE_EXPLORE',
        rawText: raw,
        feedback: 'Opening Digital Tasbih...',
        exploreFeature: 'tasbih',
      };
    }

    // Qibla
    if (
      clean.includes('qibla') ||
      clean.includes('qiblah') ||
      clean.includes('compass') ||
      clean.includes('kaaba') ||
      clean.includes('mecca direction')
    ) {
      return {
        action: 'NAVIGATE_EXPLORE',
        rawText: raw,
        feedback: 'Opening Qibla Compass...',
        exploreFeature: 'qibla',
      };
    }

    // Ramadan
    if (
      clean.includes('ramadan') ||
      clean.includes('fasting') ||
      clean.includes('suhoor') ||
      clean.includes('sehri') ||
      clean.includes('iftar') ||
      clean.includes('roza')
    ) {
      return {
        action: 'NAVIGATE_EXPLORE',
        rawText: raw,
        feedback: 'Opening Ramadan Tracker & Fasting Hub...',
        exploreFeature: 'ramadan',
      };
    }

    // Hadith
    if (
      clean.includes('hadith') ||
      clean.includes('hadiths') ||
      clean.includes('sunnah') ||
      clean.includes('prophet sayings') ||
      clean.includes('bukhari')
    ) {
      return {
        action: 'NAVIGATE_EXPLORE',
        rawText: raw,
        feedback: 'Opening Prophetic Hadith Collection...',
        exploreFeature: 'hadith',
      };
    }

    // 99 Names of Allah
    if (
      clean.includes('99 names') ||
      clean.includes('names of allah') ||
      clean.includes('asma') ||
      clean.includes('allah names')
    ) {
      return {
        action: 'NAVIGATE_EXPLORE',
        rawText: raw,
        feedback: 'Opening 99 Names of Allah (Asma ul-Husna)...',
        exploreFeature: 'names',
      };
    }

    // Mosque Finder
    if (
      clean.includes('mosque') ||
      clean.includes('masjid') ||
      clean.includes('find mosque') ||
      clean.includes('nearby mosque')
    ) {
      return {
        action: 'NAVIGATE_EXPLORE',
        rawText: raw,
        feedback: 'Opening Mosque Finder...',
        exploreFeature: 'mosques',
      };
    }

    // Zakat
    if (
      clean.includes('zakat') ||
      clean.includes('zakah') ||
      clean.includes('charity calculator') ||
      clean.includes('calculate zakat')
    ) {
      return {
        action: 'NAVIGATE_EXPLORE',
        rawText: raw,
        feedback: 'Opening Zakat Calculator...',
        exploreFeature: 'zakat',
      };
    }

    // Quiz
    if (
      clean.includes('quiz') ||
      clean.includes('trivia') ||
      clean.includes('test knowledge') ||
      clean.includes('game')
    ) {
      return {
        action: 'NAVIGATE_EXPLORE',
        rawText: raw,
        feedback: 'Opening Islamic Knowledge Quiz...',
        exploreFeature: 'quiz',
      };
    }

    // Calendar
    if (
      clean.includes('calendar') ||
      clean.includes('hijri') ||
      clean.includes('islamic date') ||
      clean.includes('events')
    ) {
      return {
        action: 'NAVIGATE_EXPLORE',
        rawText: raw,
        feedback: 'Opening Hijri Islamic Calendar...',
        exploreFeature: 'calendar',
      };
    }

    // Learning
    if (
      clean.includes('learn') ||
      clean.includes('learning') ||
      clean.includes('how to pray') ||
      clean.includes('wudu') ||
      clean.includes('pillars')
    ) {
      return {
        action: 'NAVIGATE_EXPLORE',
        rawText: raw,
        feedback: 'Opening Islamic Learning Guide...',
        exploreFeature: 'learning',
      };
    }

    // 8. APP TABS
    // Quran tab
    if (
      clean.includes('quran') ||
      clean.includes('koran') ||
      clean.includes('read quran') ||
      clean.includes('holy quran')
    ) {
      return {
        action: 'NAVIGATE_TAB',
        rawText: raw,
        feedback: 'Navigating to Holy Quran...',
        tab: 'quran',
      };
    }

    // Prayer times tab
    if (
      clean.includes('prayer') ||
      clean.includes('namaz') ||
      clean.includes('salah') ||
      clean.includes('salat') ||
      clean.includes('adhan') ||
      clean.includes('athan') ||
      clean.includes('fajr') ||
      clean.includes('maghrib') ||
      clean.includes('dhuhr') ||
      clean.includes('asr') ||
      clean.includes('isha')
    ) {
      return {
        action: 'NAVIGATE_TAB',
        rawText: raw,
        feedback: 'Navigating to Prayer Times...',
        tab: 'prayer',
      };
    }

    // Profile tab
    if (
      clean.includes('profile') ||
      clean.includes('account') ||
      clean.includes('my profile') ||
      clean.includes('settings')
    ) {
      return {
        action: 'NAVIGATE_TAB',
        rawText: raw,
        feedback: 'Opening Profile & Settings...',
        tab: 'profile',
      };
    }

    // Explore menu
    if (
      clean.includes('explore') ||
      clean.includes('tools') ||
      clean.includes('menu') ||
      clean.includes('features')
    ) {
      return {
        action: 'NAVIGATE_TAB',
        rawText: raw,
        feedback: 'Opening Explore Features...',
        tab: 'explore',
      };
    }

    // Home
    if (
      clean.includes('home') ||
      clean.includes('dashboard') ||
      clean.includes('main screen')
    ) {
      return {
        action: 'NAVIGATE_TAB',
        rawText: raw,
        feedback: 'Navigating Home...',
        tab: 'home',
      };
    }

    return {
      action: 'UNKNOWN',
      rawText: raw,
      feedback: `Unrecognized command: "${raw}". Say "Help" to see supported commands.`,
    };
  }

  /**
   * Helper to detect and resolve Surah names and numbers from spoken text
   */
  private detectSurahRequest(clean: string): { number: number; englishName: string; name: string } | null {
    // Check for "surah [number]" or "chapter [number]"
    const numMatch = clean.match(/(?:surah|chapter|sura)\s+(\d{1,3})/i);
    if (numMatch) {
      const n = parseInt(numMatch[1], 10);
      if (n >= 1 && n <= 114) {
        const found = ALL_SURAHS.find((s) => s.number === n);
        if (found) return found;
      }
    }

    // Check if query contains "surah [name]"
    for (const s of ALL_SURAHS) {
      const normalizedName = s.englishName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      const cleanNoSpaces = clean.replace(/[^a-z0-9]/g, '');

      // Common Arabic nicknames & variants
      const variants = [
        normalizedName,
        normalizedName.replace(/^al/, ''),
        normalizedName.replace(/^an/, ''),
        normalizedName.replace(/^ar/, ''),
        normalizedName.replace(/^as/, ''),
        normalizedName.replace(/^at/, ''),
        normalizedName.replace(/^ash/, ''),
      ];

      // Exact or contains match if "surah" or name mentioned
      const matchesVariant = variants.some((v) => v.length > 2 && cleanNoSpaces.includes(v));
      if (matchesVariant && (clean.includes('surah') || clean.includes('sura') || clean.includes('read') || clean.includes('open'))) {
        return s;
      }
    }

    // Specific popular surah shortcuts
    if (clean.includes('yasin') || clean.includes('yaseen')) {
      return ALL_SURAHS.find((s) => s.number === 36) || null;
    }
    if (clean.includes('fatihah') || clean.includes('fatiha')) {
      return ALL_SURAHS.find((s) => s.number === 1) || null;
    }
    if (clean.includes('baqarah') || clean.includes('baqara')) {
      return ALL_SURAHS.find((s) => s.number === 2) || null;
    }
    if (clean.includes('kahf')) {
      return ALL_SURAHS.find((s) => s.number === 18) || null;
    }
    if (clean.includes('mulk')) {
      return ALL_SURAHS.find((s) => s.number === 67) || null;
    }
    if (clean.includes('rahman') || clean.includes('rehman')) {
      return ALL_SURAHS.find((s) => s.number === 55) || null;
    }
    if (clean.includes('waqiah') || clean.includes('waqia')) {
      return ALL_SURAHS.find((s) => s.number === 56) || null;
    }
    if (clean.includes('ikhlas')) {
      return ALL_SURAHS.find((s) => s.number === 112) || null;
    }
    if (clean.includes('falaq')) {
      return ALL_SURAHS.find((s) => s.number === 113) || null;
    }
    if (clean.includes('nas') || clean.includes('naas')) {
      return ALL_SURAHS.find((s) => s.number === 114) || null;
    }
    if (clean.includes('ayatul kursi') || clean.includes('kursi')) {
      return ALL_SURAHS.find((s) => s.number === 2) || null;
    }

    return null;
  }
}

export const speechService = new SpeechService();
