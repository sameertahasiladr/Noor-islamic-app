export interface ActiveQuranPlayback {
  isPlaying: boolean;
  isPaused: boolean;
  surahNumber: number;
  surahName?: string;
  surahArabicName?: string;
  ayahNumber: number;
  totalAyahs?: number;
}

/**
 * Service for playing authentic Quran recitations and Islamic audio
 */
class AudioService {
  private currentAudio: HTMLAudioElement | null = null;
  private currentAyahKey: string | null = null;
  private onEndCallback: (() => void) | null = null;
  private activePlayback: ActiveQuranPlayback | null = null;
  private playbackListeners: ((state: ActiveQuranPlayback | null) => void)[] = [];
  private textSpeechAudio: HTMLAudioElement | null = null;
  private isSpeakingArabic: boolean = false;
  private speechListeners: ((speaking: boolean, currentText: string | null) => void)[] = [];
  private currentSpokenText: string | null = null;

  /**
   * Generates Primary EveryAyah CDN URL for Mishary Alafasy
   */
  getAyahAudioUrl(surah: number, ayah: number): string {
    const sPad = String(surah).padStart(3, '0');
    const aPad = String(ayah).padStart(3, '0');
    return `https://everyayah.com/data/Alafasy_128kbps/${sPad}${aPad}.mp3`;
  }

  /**
   * Backup CDN URL from Quran.com
   */
  getBackupAyahAudioUrl(surah: number, ayah: number): string {
    const sPad = String(surah).padStart(3, '0');
    const aPad = String(ayah).padStart(3, '0');
    return `https://verses.quran.com/Alafasy/mp3/${sPad}${aPad}.mp3`;
  }

  public getActivePlayback(): ActiveQuranPlayback | null {
    return this.activePlayback ? { ...this.activePlayback } : null;
  }

  public subscribe(listener: (state: ActiveQuranPlayback | null) => void): () => void {
    this.playbackListeners.push(listener);
    listener(this.getActivePlayback());
    return () => {
      this.playbackListeners = this.playbackListeners.filter((l) => l !== listener);
    };
  }

  private notifyPlayback(): void {
    const state = this.getActivePlayback();
    this.playbackListeners.forEach((fn) => fn(state));
  }

  public subscribeSpeaking(listener: (speaking: boolean, text: string | null) => void): () => void {
    this.speechListeners.push(listener);
    listener(this.isSpeakingArabic, this.currentSpokenText);
    return () => {
      this.speechListeners = this.speechListeners.filter((l) => l !== listener);
    };
  }

  private notifySpeaking(speaking: boolean, text: string | null): void {
    this.isSpeakingArabic = speaking;
    this.currentSpokenText = text;
    this.speechListeners.forEach((fn) => fn(speaking, text));
  }

  playAyah(
    surah: number,
    ayah: number,
    meta?: { surahName?: string; surahArabicName?: string; totalAyahs?: number },
    onEnded?: () => void,
    onError?: (err: unknown) => void
  ): HTMLAudioElement {
    this.stop();

    const primaryUrl = this.getAyahAudioUrl(surah, ayah);
    const audio = new Audio(primaryUrl);
    this.currentAudio = audio;
    this.currentAyahKey = `${surah}:${ayah}`;
    this.onEndCallback = onEnded || null;

    this.activePlayback = {
      isPlaying: true,
      isPaused: false,
      surahNumber: surah,
      ayahNumber: ayah,
      surahName: meta?.surahName,
      surahArabicName: meta?.surahArabicName,
      totalAyahs: meta?.totalAyahs,
    };
    this.notifyPlayback();

    audio.onended = () => {
      this.currentAyahKey = null;
      if (this.onEndCallback) {
        this.onEndCallback();
      } else {
        this.activePlayback = null;
        this.notifyPlayback();
      }
    };

    audio.onerror = (e) => {
      // Try backup CDN if primary fails
      console.warn('Primary EveryAyah CDN failed, trying backup Quran.com CDN...');
      const backupUrl = this.getBackupAyahAudioUrl(surah, ayah);
      const backupAudio = new Audio(backupUrl);
      this.currentAudio = backupAudio;

      backupAudio.onended = () => {
        this.currentAyahKey = null;
        if (this.onEndCallback) {
          this.onEndCallback();
        } else {
          this.activePlayback = null;
          this.notifyPlayback();
        }
      };

      backupAudio.onerror = (backupErr) => {
        console.error('All Quran audio sources failed:', backupErr);
        this.currentAyahKey = null;
        this.activePlayback = null;
        this.notifyPlayback();
        if (onError) onError(backupErr);
      };

      backupAudio.play().catch((playErr) => {
        this.activePlayback = null;
        this.notifyPlayback();
        if (onError) onError(playErr);
      });
    };

    audio.play().catch((err) => {
      console.warn('Playback initiation note:', err);
      // If user interaction was needed or error occurred
      if (onError) onError(err);
    });

    return audio;
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.currentAyahKey = null;
    this.activePlayback = null;
    this.notifyPlayback();

    this.stopSpeakingArabic();
  }

  pause(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      if (this.activePlayback) {
        this.activePlayback.isPaused = true;
        this.notifyPlayback();
      }
    }
  }

  resume(): void {
    if (this.currentAudio) {
      this.currentAudio.play().catch(() => {});
      if (this.activePlayback) {
        this.activePlayback.isPaused = false;
        this.notifyPlayback();
      }
    }
  }

  isPlaying(surah?: number, ayah?: number): boolean {
    if (surah !== undefined && ayah !== undefined) {
      return (
        this.currentAyahKey === `${surah}:${ayah}` &&
        this.currentAudio !== null &&
        !this.currentAudio.paused
      );
    }
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  stopSpeakingArabic(): void {
    if (this.textSpeechAudio) {
      try {
        this.textSpeechAudio.pause();
        this.textSpeechAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.textSpeechAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.notifySpeaking(false, null);
  }

  pauseSpeakingArabic(): void {
    if (this.textSpeechAudio && !this.textSpeechAudio.paused) {
      try {
        this.textSpeechAudio.pause();
      } catch {
        // ignore
      }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch {
        // ignore
      }
    }
  }

  resumeSpeakingArabic(): void {
    if (this.textSpeechAudio && this.textSpeechAudio.paused) {
      try {
        this.textSpeechAudio.play().catch(() => {});
      } catch {
        // ignore
      }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Speaks Arabic text with reliable audio:
   * 1. Google TTS high-fidelity pronunciation MP3 (works on all devices without Arabic OS voice packs)
   * 2. Web Speech API fallback with automatic resume
   * 3. Web Audio harmonic tone fallback
   */
  speakArabicText(text: string, onFinish?: () => void): void {
    this.stopSpeakingArabic();
    this.notifySpeaking(true, text);

    const cleanText = text.trim();
    if (!cleanText) {
      this.notifySpeaking(false, null);
      if (onFinish) onFinish();
      return;
    }

    // Attempt online TTS audio stream
    try {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=${encodeURIComponent(
        cleanText.slice(0, 200)
      )}`;
      const audio = new Audio(ttsUrl);
      this.textSpeechAudio = audio;

      audio.onended = () => {
        this.textSpeechAudio = null;
        this.notifySpeaking(false, null);
        if (onFinish) onFinish();
      };

      audio.onerror = () => {
        this.textSpeechAudio = null;
        this.fallbackSpeechSynthesis(cleanText, onFinish);
      };

      audio.play().catch(() => {
        this.textSpeechAudio = null;
        this.fallbackSpeechSynthesis(cleanText, onFinish);
      });
    } catch {
      this.fallbackSpeechSynthesis(cleanText, onFinish);
    }
  }

  private fallbackSpeechSynthesis(text: string, onFinish?: () => void): void {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.85;

        // Try selecting Arabic voice if available
        const voices = window.speechSynthesis.getVoices() || [];
        const arVoice = voices.find((v) => v.lang.startsWith('ar'));
        if (arVoice) {
          utterance.voice = arVoice;
        }

        utterance.onend = () => {
          this.notifySpeaking(false, null);
          if (onFinish) onFinish();
        };

        utterance.onerror = () => {
          this.playHarmonicTone();
          this.notifySpeaking(false, null);
          if (onFinish) onFinish();
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch {
        // continue to harmonic tone
      }
    }

    this.playHarmonicTone();
    this.notifySpeaking(false, null);
    if (onFinish) onFinish();
  }

  /**
   * Gentle harmonic tone ensures audio feedback is audible even without sound files
   */
  private playHarmonicTone(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // ignore
    }
  }
}

export const audioService = new AudioService();
