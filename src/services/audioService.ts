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
   * Primary EveryAyah CDN URL for Mishary Alafasy
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
    // 1. Stop any active audio (Quran or TTS) to guarantee only 1 active audio instance
    this.stop();

    const primaryUrl = this.getAyahAudioUrl(surah, ayah);
    console.log(`[AudioService] Playing Quran audio Surah ${surah}:${ayah} from URL: ${primaryUrl}`);

    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = 1.0;
    audio.src = primaryUrl;

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

    audio.onloadeddata = () => {
      console.log(`[AudioService] Quran audio loadeddata for ${surah}:${ayah}`);
    };

    audio.oncanplay = () => {
      console.log(`[AudioService] Quran audio canplay for ${surah}:${ayah}`);
    };

    audio.onended = () => {
      console.log(`[AudioService] Quran audio ended for ${surah}:${ayah}`);
      this.currentAyahKey = null;
      if (this.onEndCallback) {
        this.onEndCallback();
      } else {
        this.activePlayback = null;
        this.notifyPlayback();
      }
    };

    audio.onerror = (e) => {
      console.warn(`[AudioService] Primary CDN failed for ${surah}:${ayah}, trying backup Quran.com CDN...`, e);
      const backupUrl = this.getBackupAyahAudioUrl(surah, ayah);
      const backupAudio = new Audio();
      backupAudio.preload = 'auto';
      backupAudio.volume = 1.0;
      backupAudio.src = backupUrl;
      this.currentAudio = backupAudio;

      backupAudio.onended = () => {
        console.log(`[AudioService] Backup Quran audio ended for ${surah}:${ayah}`);
        this.currentAyahKey = null;
        if (this.onEndCallback) {
          this.onEndCallback();
        } else {
          this.activePlayback = null;
          this.notifyPlayback();
        }
      };

      backupAudio.onerror = (backupErr) => {
        console.error(`[AudioService] All Quran audio CDNs failed for ${surah}:${ayah}:`, backupErr);
        this.currentAyahKey = null;
        this.activePlayback = null;
        this.notifyPlayback();
        if (onError) onError(backupErr);
      };

      backupAudio.play().then(() => {
        console.log(`[AudioService] Backup Quran audio playback started for ${surah}:${ayah}`);
      }).catch((playErr) => {
        console.error(`[AudioService] Backup Quran audio play() failed for ${surah}:${ayah}:`, playErr);
        this.activePlayback = null;
        this.notifyPlayback();
        if (onError) onError(playErr);
      });
    };

    audio.play().then(() => {
      console.log(`[AudioService] Quran audio play() resolved for ${surah}:${ayah}`);
    }).catch((err) => {
      console.error(`[AudioService] Quran audio play() rejected for ${surah}:${ayah}:`, err);
      if (onError) onError(err);
    });

    return audio;
  }

  stop(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (err) {
        console.warn('[AudioService] Error pausing currentAudio:', err);
      }
      this.currentAudio = null;
    }
    this.currentAyahKey = null;
    this.activePlayback = null;
    this.notifyPlayback();

    this.stopSpeakingArabic();
  }

  pause(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
      } catch (err) {
        console.warn('[AudioService] Error pausing audio:', err);
      }
      if (this.activePlayback) {
        this.activePlayback.isPaused = true;
        this.notifyPlayback();
      }
    }
  }

  resume(): void {
    if (this.currentAudio) {
      this.currentAudio.play().then(() => {
        console.log('[AudioService] Quran audio resumed');
      }).catch((err) => {
        console.error('[AudioService] Resume Quran audio failed:', err);
      });
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
      } catch (err) {
        console.warn('[AudioService] Error pausing textSpeechAudio:', err);
      }
      this.textSpeechAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        console.warn('[AudioService] Error canceling speechSynthesis:', err);
      }
    }
    this.notifySpeaking(false, null);
  }

  pauseSpeakingArabic(): void {
    if (this.textSpeechAudio && !this.textSpeechAudio.paused) {
      try {
        this.textSpeechAudio.pause();
      } catch (err) {
        console.warn('[AudioService] Error pausing textSpeechAudio:', err);
      }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch (err) {
        console.warn('[AudioService] Error pausing speechSynthesis:', err);
      }
    }
  }

  resumeSpeakingArabic(): void {
    if (this.textSpeechAudio && this.textSpeechAudio.paused) {
      try {
        this.textSpeechAudio.play().catch((err) => {
          console.error('[AudioService] Resume textSpeechAudio failed:', err);
        });
      } catch (err) {
        console.warn('[AudioService] Error resuming textSpeechAudio:', err);
      }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch (err) {
        console.warn('[AudioService] Error resuming speechSynthesis:', err);
      }
    }
  }

  /**
   * Speaks Arabic text with reliable audio:
   * Fetches TTS MP3 audio buffer directly into Blob URL to bypass WebView media element origin blocks
   */
  async speakArabicText(text: string, onFinish?: () => void): Promise<void> {
    const cleanText = text.trim();
    console.log(`[AudioService] speakArabicText requested for: "${cleanText.slice(0, 30)}..."`);

    // Toggle off if same text is currently playing
    if (this.isSpeakingArabic && this.currentSpokenText === cleanText) {
      console.log('[AudioService] Speaker tapped on active item -> stopping audio');
      this.stopSpeakingArabic();
      if (onFinish) onFinish();
      return;
    }

    this.stopSpeakingArabic();

    if (!cleanText) {
      this.notifySpeaking(false, null);
      if (onFinish) onFinish();
      return;
    }

    this.notifySpeaking(true, cleanText);

    // Primary GTX TTS endpoint URL
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=gtx&q=${encodeURIComponent(
      cleanText.slice(0, 200)
    )}`;
    console.log(`[AudioService] Fetching Arabic audio buffer from: ${ttsUrl}`);

    try {
      // Fetch audio buffer directly via fetch()
      const response = await fetch(ttsUrl);
      if (!response.ok) {
        throw new Error(`TTS fetch HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      console.log(`[AudioService] Created Blob URL: ${blobUrl}`);

      const audio = new Audio(blobUrl);
      audio.preload = 'auto';
      audio.volume = 1.0;
      this.textSpeechAudio = audio;

      audio.onended = () => {
        console.log('[AudioService] Speaker blob audio ended');
        URL.revokeObjectURL(blobUrl);
        this.textSpeechAudio = null;
        this.notifySpeaking(false, null);
        if (onFinish) onFinish();
      };

      audio.onerror = (e) => {
        console.warn('[AudioService] Blob audio error event, executing Web Speech fallback:', e);
        URL.revokeObjectURL(blobUrl);
        this.textSpeechAudio = null;
        this.fallbackSpeechSynthesis(cleanText, onFinish);
      };

      await audio.play();
      console.log('[AudioService] Arabic speaker blob audio play() started successfully.');
    } catch (err) {
      console.warn('[AudioService] speakArabicText blob fetch/play failed, executing SpeechSynthesis fallback:', err);
      this.textSpeechAudio = null;
      this.fallbackSpeechSynthesis(cleanText, onFinish);
    }
  }

  private fallbackSpeechSynthesis(text: string, onFinish?: () => void): void {
    console.log('[AudioService] Executing SpeechSynthesis fallback for text');
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.85;

        const voices = window.speechSynthesis.getVoices() || [];
        const arVoice = voices.find((v) => v.lang.startsWith('ar') || v.lang.includes('AR'));
        if (arVoice) {
          utterance.voice = arVoice;
          console.log('[AudioService] Selected Arabic voice:', arVoice.name);
        }

        let isDone = false;
        const cleanup = () => {
          if (!isDone) {
            isDone = true;
            this.notifySpeaking(false, null);
            if (onFinish) onFinish();
          }
        };

        const safetyTimeout = setTimeout(() => {
          console.warn('[AudioService] SpeechSynthesis safety timeout reached, cleaning up state');
          cleanup();
        }, Math.max(3000, text.length * 120));

        utterance.onend = () => {
          console.log('[AudioService] SpeechSynthesis utterance ended');
          clearTimeout(safetyTimeout);
          cleanup();
        };

        utterance.onerror = (err) => {
          console.warn('[AudioService] SpeechSynthesis utterance error:', err);
          clearTimeout(safetyTimeout);
          this.playHarmonicTone();
          cleanup();
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn('[AudioService] SpeechSynthesis execution error:', err);
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
    console.log('[AudioService] Playing harmonic tone fallback');
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
    } catch (err) {
      console.warn('[AudioService] Harmonic tone error:', err);
    }
  }
}

export const audioService = new AudioService();
