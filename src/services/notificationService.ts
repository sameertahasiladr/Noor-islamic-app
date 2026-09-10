import { LocalNotifications, Channel } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { UserProfile, AzaanPlaybackState, PrePrayerAlertEvent } from '../types';
import { calculatePrayerScheduleDates, ScheduledPrayerTime } from './prayerService';

export interface AzaanVoiceOption {
  id: 'makkah' | 'madinah' | 'alafasy' | 'alaqsa' | 'abdulbasit';
  name: string;
  reciter: string;
  location: string;
  url: string;
  isOfflineAvailable: boolean;
}

export const AZAAN_VOICES: AzaanVoiceOption[] = [
  {
    id: 'makkah',
    name: 'Masjid al-Haram, Makkah',
    reciter: 'Sheikh Ali Mullah / Makkah Muaddhin',
    location: 'Makkah al-Mukarramah',
    url: '/audio/adhan.mp3',
    isOfflineAvailable: true,
  },
  {
    id: 'madinah',
    name: 'Al-Masjid an-Nabawi, Madinah',
    reciter: 'Madinah Munawwarah Muaddhin',
    location: 'Madinah al-Munawwarah',
    url: 'https://www.islamcan.com/audio/adhan/azan2.mp3',
    isOfflineAvailable: false,
  },
  {
    id: 'alafasy',
    name: 'Mishary Rashid Alafasy',
    reciter: 'Sheikh Mishary Rashid Alafasy',
    location: 'Kuwait Grand Mosque',
    url: 'https://www.islamcan.com/audio/adhan/azan5.mp3',
    isOfflineAvailable: false,
  },
  {
    id: 'alaqsa',
    name: 'Al-Aqsa Mosque',
    reciter: 'Masjid Al-Aqsa Muaddhin',
    location: 'Al-Quds (Jerusalem)',
    url: 'https://www.islamcan.com/audio/adhan/azan3.mp3',
    isOfflineAvailable: false,
  },
  {
    id: 'abdulbasit',
    name: 'Sheikh Abdul Basit Abdus Samad',
    reciter: 'Abdul Basit Abdus Samad',
    location: 'Cairo, Egypt',
    url: 'https://www.islamcan.com/audio/adhan/azan4.mp3',
    isOfflineAvailable: false,
  },
];

const PRE_PRAYER_CHANNEL: Channel = {
  id: 'prayer_reminders_5min',
  name: 'Pre-Prayer 5-Min Reminders',
  description: 'Alerts you 5 minutes before prayer time for Wudu & spiritual preparation',
  importance: 4,
  visibility: 1,
  vibration: true,
  sound: 'adhan.mp3',
};

const AZAAN_CHANNEL: Channel = {
  id: 'prayer_azaan_channel',
  name: 'Azaan Call to Prayer',
  description: 'Plays the authentic Azaan when prayer time begins',
  importance: 5,
  visibility: 1,
  vibration: true,
  sound: 'adhan.mp3',
};

class NotificationService {
  private currentAudio: HTMLAudioElement | null = null;
  private azaanState: AzaanPlaybackState = {
    isPlaying: false,
    voiceName: 'Makkah',
  };
  private azaanListeners: ((state: AzaanPlaybackState) => void)[] = [];
  private prePrayerListeners: ((alert: PrePrayerAlertEvent | null) => void)[] = [];
  private activePreAlert: PrePrayerAlertEvent | null = null;
  private watchTimer: ReturnType<typeof setInterval> | null = null;
  private notifiedTracker: Set<string> = new Set();
  private channelsCreated: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    this.initChannels().catch(() => {});
  }

  /**
   * Initializes Android Notification Channels if running on Native platform
   */
  private async initChannels(): Promise<void> {
    if (this.channelsCreated) return;
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.createChannel(PRE_PRAYER_CHANNEL);
        await LocalNotifications.createChannel(AZAAN_CHANNEL);
        this.channelsCreated = true;
      } catch (err) {
        console.warn('[NotificationService] Channel creation note:', err);
      }
    }
  }

  /**
   * Check if notifications are authorized
   */
  public async checkPermission(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        const res = await LocalNotifications.checkPermissions();
        return res.display === 'granted';
      } catch {
        return false;
      }
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  }

  /**
   * Request notification permission from the OS or browser
   */
  public async requestPermission(): Promise<boolean> {
    await this.initChannels();

    if (Capacitor.isNativePlatform()) {
      try {
        const req = await LocalNotifications.requestPermissions();
        return req.display === 'granted';
      } catch (err) {
        console.warn('[NotificationService] Native permission request note:', err);
        return false;
      }
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Schedules pre-prayer 5-minute alerts and Azaan notifications for today and next 7 days
   */
  public async schedulePrayerAlerts(profile: UserProfile): Promise<{ scheduledCount: number; error?: string }> {
    try {
      await this.initChannels();

      const hasPerm = await this.checkPermission();
      if (!hasPerm) {
        // Still run in-app background watcher even without OS permission
        this.startForegroundWatcher(profile);
      }

      const preMin = profile.notifications?.prePrayerMinutes ?? 5;
      const isPreEnabled = profile.notifications?.prePrayerReminder !== false;
      const isAzaanEnabled = profile.notifications?.playAzaan !== false;

      const notifsToSchedule: any[] = [];
      const now = Date.now();

      // Schedule for next 7 days (day 0 to day 6)
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + dayOffset);

        const daySchedule = calculatePrayerScheduleDates(
          targetDate,
          profile.location.latitude,
          profile.location.longitude,
          profile.prayerCalculationMethod,
          profile.asrMethod,
          profile.hijriDateAdjustment || 0,
          profile.prayerTimeOffsets,
          profile.highLatitudeRule || 'angleBased',
          preMin
        );

        const prayerKeys: ('fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha')[] = [
          'fajr',
          'sunrise',
          'dhuhr',
          'asr',
          'maghrib',
          'isha',
        ];

        daySchedule.forEach((item, pIndex) => {
          const key = item.name.toLowerCase() as 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
          const isEnabled = profile.notifications?.[key] !== false;
          if (!isEnabled) return;

          // 1. Pre-Prayer 5-Minute Alert
          if (isPreEnabled && item.name !== 'Sunrise') {
            const preTime = item.preReminderDate.getTime();
            if (preTime > now) {
              const preId = 100000 + dayOffset * 20 + pIndex * 2;
              notifsToSchedule.push({
                id: preId,
                title: `⏰ ${preMin} Minutes until ${item.name}`,
                body: `${item.arabicName} • Time for Wudu & spiritual readiness. ${item.name} begins at ${item.timeDisplay}.`,
                schedule: { at: item.preReminderDate, allowWhileIdle: true },
                channelId: 'prayer_reminders_5min',
                sound: 'adhan.mp3',
                smallIcon: 'ic_stat_name',
                extra: {
                  type: 'pre_prayer',
                  prayer: item.name,
                  targetTime: item.exactDate.toISOString(),
                },
              });
            }
          }

          // 2. Exact Prayer Time (Azaan Alert)
          const exactTime = item.exactDate.getTime();
          if (exactTime > now) {
            const azaanId = 100000 + dayOffset * 20 + pIndex * 2 + 1;
            const isSunrise = item.name === 'Sunrise';
            const title = isSunrise
              ? `🌅 Sunrise (Shurooq): ${item.timeDisplay}`
              : `🕌 Adhan: Time for ${item.name}`;
            const body = isSunrise
              ? `The sun has risen in ${profile.location.city}. Fajr time has concluded.`
              : `Hayya 'alas-Salah (Come to prayer). ${item.arabicName} time has arrived (${item.timeDisplay}).`;

            notifsToSchedule.push({
              id: azaanId,
              title,
              body,
              schedule: { at: item.exactDate, allowWhileIdle: true },
              channelId: 'prayer_azaan_channel',
              sound: isAzaanEnabled ? 'adhan.mp3' : undefined,
              smallIcon: 'ic_stat_name',
              extra: {
                type: 'azaan',
                prayer: item.name,
                targetTime: item.exactDate.toISOString(),
              },
            });
          }
        });
      }

      if (Capacitor.isNativePlatform() && notifsToSchedule.length > 0) {
        try {
          // Cancel existing pending notifications to prevent duplicates
          const pending = await LocalNotifications.getPending();
          if (pending.notifications.length > 0) {
            await LocalNotifications.cancel({
              notifications: pending.notifications.map((p) => ({ id: p.id })),
            });
          }
          await LocalNotifications.schedule({ notifications: notifsToSchedule });
        } catch (err) {
          console.warn('[NotificationService] LocalNotifications scheduling note:', err);
        }
      }

      // Always maintain active foreground timer
      this.startForegroundWatcher(profile);

      return { scheduledCount: notifsToSchedule.length };
    } catch (e: any) {
      console.error('[NotificationService] Schedule failed:', e);
      return { scheduledCount: 0, error: e?.message || 'Failed to schedule prayer alerts' };
    }
  }

  /**
   * Real-time foreground watcher:
   * Runs inside the active browser/app session to ensure audio and alerts fire reliably
   */
  private startForegroundWatcher(profile: UserProfile): void {
    if (this.watchTimer) {
      clearInterval(this.watchTimer);
      this.watchTimer = null;
    }

    const checkTimes = () => {
      const now = new Date();
      const preMin = profile.notifications?.prePrayerMinutes ?? 5;
      const isPreEnabled = profile.notifications?.prePrayerReminder !== false;
      const isAzaanEnabled = profile.notifications?.playAzaan !== false;

      const schedule = calculatePrayerScheduleDates(
        now,
        profile.location.latitude,
        profile.location.longitude,
        profile.prayerCalculationMethod,
        profile.asrMethod,
        profile.hijriDateAdjustment || 0,
        profile.prayerTimeOffsets,
        profile.highLatitudeRule || 'angleBased',
        preMin
      );

      const currentTimeMs = now.getTime();
      const dateStr = now.toISOString().split('T')[0];

      schedule.forEach((item) => {
        const prayerKey = item.name.toLowerCase() as 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
        if (profile.notifications?.[prayerKey] === false) return;

        // 1. Check 5-Minute Pre-Prayer Alert
        if (isPreEnabled && item.name !== 'Sunrise') {
          const preDiff = currentTimeMs - item.preReminderDate.getTime();
          const trackerKey = `pre_${dateStr}_${item.name}`;

          // Within a 60-second window after the pre-reminder time
          if (preDiff >= 0 && preDiff < 60000 && !this.notifiedTracker.has(trackerKey)) {
            this.notifiedTracker.add(trackerKey);
            this.firePrePrayerAlert(item, preMin);
          }
        }

        // 2. Check Exact Prayer Time (Azaan)
        const exactDiff = currentTimeMs - item.exactDate.getTime();
        const azaanTrackerKey = `azaan_${dateStr}_${item.name}`;

        if (exactDiff >= 0 && exactDiff < 60000 && !this.notifiedTracker.has(azaanTrackerKey)) {
          this.notifiedTracker.add(azaanTrackerKey);
          this.firePrayerTimeAlert(item, isAzaanEnabled, profile.notifications?.azaanVoice || 'makkah');
        }
      });
    };

    // Run check immediately and every 15 seconds
    checkTimes();
    this.watchTimer = setInterval(checkTimes, 15000);
  }

  /**
   * Trigger Pre-Prayer Alert (5-minutes before)
   */
  private firePrePrayerAlert(item: ScheduledPrayerTime, minutesRemaining: number): void {
    const alertEvent: PrePrayerAlertEvent = {
      prayerName: item.name,
      minutesRemaining,
      prayerTime: item.timeDisplay,
      timestamp: Date.now(),
    };

    this.activePreAlert = alertEvent;
    this.notifyPrePrayer(alertEvent);

    // Play gentle chime
    this.playNotificationChime();

    // Show browser notification if allowed
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏰ ${minutesRemaining} Minutes until ${item.name}`, {
          body: `${item.arabicName} • Time for Wudu & reflection. Begins at ${item.timeDisplay}.`,
          icon: '/favicon.ico',
        });
      } catch {
        // ignore
      }
    }
  }

  /**
   * Trigger Exact Prayer Time Alert & Azaan
   */
  private firePrayerTimeAlert(item: ScheduledPrayerTime, playAudio: boolean, voiceId: string): void {
    if (item.name !== 'Sunrise' && playAudio) {
      this.playAzaan(item.name, voiceId);
    } else {
      this.playNotificationChime();
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`🕌 Adhan: Time for ${item.name}`, {
          body: `Hayya 'alas-Salah. It is time for ${item.name} prayer (${item.timeDisplay}).`,
          icon: '/favicon.ico',
        });
      } catch {
        // ignore
      }
    }
  }

  /**
   * Play Authentic Azaan Audio
   */
  public playAzaan(prayerName: string = 'Salah', voiceId: string = 'makkah'): void {
    this.stopAzaan();

    const voice = AZAAN_VOICES.find((v) => v.id === voiceId) || AZAAN_VOICES[0];
    const audioUrl = voice.url;

    try {
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      this.azaanState = {
        isPlaying: true,
        prayerName,
        voiceName: voice.name,
        audioUrl,
      };
      this.notifyAzaan();

      audio.onended = () => {
        this.azaanState = { isPlaying: false, voiceName: voice.name };
        this.currentAudio = null;
        this.notifyAzaan();
      };

      audio.onerror = () => {
        // Fallback to local adhan if network fails
        if (voice.url !== '/audio/adhan.mp3') {
          console.warn('[NotificationService] Online Azaan stream failed, falling back to local Makkah Adhan...');
          const fallbackAudio = new Audio('/audio/adhan.mp3');
          this.currentAudio = fallbackAudio;
          fallbackAudio.onended = () => {
            this.azaanState = { isPlaying: false, voiceName: 'Makkah' };
            this.currentAudio = null;
            this.notifyAzaan();
          };
          fallbackAudio.play().catch(() => {
            this.playHarmonicAdhanTone();
          });
        } else {
          this.playHarmonicAdhanTone();
        }
      };

      audio.play().catch((err) => {
        console.warn('[NotificationService] Audio autoplay note:', err);
        this.playHarmonicAdhanTone();
      });
    } catch (err) {
      console.warn('[NotificationService] Play Azaan error:', err);
      this.playHarmonicAdhanTone();
    }
  }

  /**
   * Stops the currently playing Azaan
   */
  public stopAzaan(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }
    this.azaanState = {
      isPlaying: false,
      voiceName: this.azaanState.voiceName || 'Makkah',
    };
    this.notifyAzaan();
  }

  /**
   * Dismiss the in-app pre-prayer alert banner
   */
  public dismissPrePrayerAlert(): void {
    this.activePreAlert = null;
    this.notifyPrePrayer(null);
  }

  /**
   * Play gentle pre-prayer chime (Web Audio)
   */
  public playNotificationChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playTone = (freq: number, delay: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + dur);
      };

      // Peaceful dual-bell chime (F5 -> A5)
      playTone(698.46, 0, 0.8);
      playTone(880.0, 0.35, 1.2);
    } catch {
      // ignore
    }
  }

  /**
   * Harmonic tone for Adhan if sound file fails or is blocked
   */
  private playHarmonicAdhanTone(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch {
      // ignore
    }
  }

  /**
   * Test 5-minute pre-prayer notification & chime
   */
  public async testPrePrayerAlert(prayerName: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha' = 'Asr'): Promise<void> {
    const alert: PrePrayerAlertEvent = {
      prayerName,
      minutesRemaining: 5,
      prayerTime: '3:45 PM',
      timestamp: Date.now(),
    };
    this.activePreAlert = alert;
    this.notifyPrePrayer(alert);
    this.playNotificationChime();

    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 99991,
              title: `⏰ 5 Minutes until ${prayerName} (Test Alert)`,
              body: `Time for Wudu & spiritual preparation. Prayer begins at 3:45 PM.`,
              channelId: 'prayer_reminders_5min',
              sound: 'adhan.mp3',
              extra: { test: true },
            },
          ],
        });
      } catch (e) {
        console.warn('Native test notification note:', e);
      }
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏰ 5 Minutes until ${prayerName} (Test Alert)`, {
          body: `Time for Wudu & spiritual preparation. Prayer begins at 3:45 PM.`,
          icon: '/favicon.ico',
        });
      } catch {
        // ignore
      }
    }
  }

  /**
   * Test Azaan Call to Prayer audio & notification
   */
  public async testAzaanAlert(prayerName: string = 'Maghrib', voiceId: string = 'makkah'): Promise<void> {
    this.playAzaan(prayerName, voiceId);

    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 99992,
              title: `🕌 Adhan: Time for ${prayerName} (Test Alert)`,
              body: `Hayya 'alas-Salah • It is time for ${prayerName} prayer.`,
              channelId: 'prayer_azaan_channel',
              sound: 'adhan.mp3',
              extra: { test: true },
            },
          ],
        });
      } catch (e) {
        console.warn('Native test notification note:', e);
      }
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`🕌 Adhan: Time for ${prayerName} (Test Alert)`, {
          body: `Hayya 'alas-Salah • It is time for ${prayerName} prayer.`,
          icon: '/favicon.ico',
        });
      } catch {
        // ignore
      }
    }
  }

  // Event subscription helpers
  public subscribeAzaan(callback: (state: AzaanPlaybackState) => void): () => void {
    this.azaanListeners.push(callback);
    callback(this.azaanState);
    return () => {
      this.azaanListeners = this.azaanListeners.filter((l) => l !== callback);
    };
  }

  private notifyAzaan(): void {
    this.azaanListeners.forEach((fn) => fn({ ...this.azaanState }));
  }

  public subscribePrePrayer(callback: (alert: PrePrayerAlertEvent | null) => void): () => void {
    this.prePrayerListeners.push(callback);
    callback(this.activePreAlert);
    return () => {
      this.prePrayerListeners = this.prePrayerListeners.filter((l) => l !== callback);
    };
  }

  private notifyPrePrayer(alert: PrePrayerAlertEvent | null): void {
    this.prePrayerListeners.forEach((fn) => fn(alert));
  }

  public getAzaanState(): AzaanPlaybackState {
    return { ...this.azaanState };
  }

  public getActivePreAlert(): PrePrayerAlertEvent | null {
    return this.activePreAlert;
  }
}

export const notificationService = new NotificationService();
