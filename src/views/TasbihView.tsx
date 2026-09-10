import React, { useState } from 'react';
import { ChevronLeft, RotateCcw, Volume2, VolumeX, Sparkles, Plus, History, Check, Trash2, X } from 'lucide-react';
import { TasbihDhikr, UserProfile } from '../types';
import { storageService } from '../services/storageService';

interface TasbihViewProps {
  profile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (p: UserProfile) => void;
}

const PRESET_DHIKR: TasbihDhikr[] = [
  {
    id: 'dhikr_1',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah',
    virtue: 'Plants a tree in Jannah and lightens sins.',
    count: 0,
    target: 33,
  },
  {
    id: 'dhikr_2',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is due to Allah',
    virtue: 'Fills the scale (Mizan) of good deeds on the Day of Judgment.',
    count: 0,
    target: 33,
  },
  {
    id: 'dhikr_3',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    virtue: 'Affirms that Allah is greater than anything in existence.',
    count: 0,
    target: 34,
  },
  {
    id: 'dhikr_4',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    virtue: 'Opens the doors of sustenance, relief, and peace of heart.',
    count: 0,
    target: 100,
  },
  {
    id: 'dhikr_5',
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    transliteration: 'La ilaha illallah',
    translation: 'None has the right to be worshipped except Allah',
    virtue: 'The best remembrance and key to Paradise.',
    count: 0,
    target: 100,
  },
  {
    id: 'dhikr_6',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    transliteration: 'Allahumma Salli Ala Muhammad',
    translation: 'O Allah, send blessings upon Muhammad',
    virtue: 'Whoever sends blessings upon the Prophet ﷺ once, Allah blesses him ten times.',
    count: 0,
    target: 100,
  },
  {
    id: 'dhikr_7',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'La hawla wa la quwwata illa billah',
    translation: 'There is no power and no strength except with Allah',
    virtue: 'A treasure from beneath the Throne of Allah.',
    count: 0,
    target: 100,
  },
  {
    id: 'dhikr_8',
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    transliteration: 'Hasbunallahu wa ni\'mal wakeel',
    translation: 'Sufficient for us is Allah, and [He is] the best Disposer of affairs',
    virtue: 'Recited by Prophet Ibrahim (AS) and Prophet Muhammad ﷺ during trials.',
    count: 0,
    target: 100,
  },
];

export const TasbihView: React.FC<TasbihViewProps> = ({ profile, onBack, onUpdateProfile }) => {
  const customDhikrs = profile.customDhikrs || [];
  const allAvailableDhikrs = [...PRESET_DHIKR, ...customDhikrs];

  const [selectedDhikr, setSelectedDhikr] = useState<TasbihDhikr>(PRESET_DHIKR[0]);
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [cycles, setCycles] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrateEnabled] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Custom Dhikr Form State
  const [customName, setCustomName] = useState('');
  const [customArabic, setCustomArabic] = useState('');
  const [customMeaning, setCustomMeaning] = useState('');
  const [customTarget, setCustomTarget] = useState<number>(33);

  // Audio click synthesizer
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // ignore
    }
  };

  const handleIncrement = () => {
    playClickSound();

    if (vibrateEnabled && navigator.vibrate) {
      navigator.vibrate(20);
    }

    const nextCount = count + 1;
    setCount(nextCount);

    // Track total in profile
    const currentTotal = profile.tasbihTotal || 0;
    const updated = { ...profile, tasbihTotal: currentTotal + 1 };
    onUpdateProfile(updated);
    storageService.saveProfile(updated);

    // Target reached
    if (target > 0 && nextCount === target) {
      setCycles((c) => c + 1);
      storageService.recordTasbih({
        dhikrName: selectedDhikr.transliteration,
        count: target,
        target,
        date: new Date().toLocaleDateString(),
      });
      onUpdateProfile(storageService.getProfile());
      if (vibrateEnabled && navigator.vibrate) {
        navigator.vibrate([80, 50, 80]);
      }
    }
  };

  const handleReset = () => {
    setCount(0);
    setCycles(0);
  };

  const handleSelectDhikr = (d: TasbihDhikr) => {
    setSelectedDhikr(d);
    setTarget(d.target);
    setCount(0);
    setCycles(0);
  };

  const handleCreateCustomDhikr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    storageService.addCustomDhikr({
      transliteration: customName.trim(),
      arabic: customArabic.trim() || undefined,
      translation: customMeaning.trim() || undefined,
      target: customTarget || 33,
    });

    const updatedProfile = storageService.getProfile();
    onUpdateProfile(updatedProfile);

    // Set as active
    const newAdded = updatedProfile.customDhikrs?.[updatedProfile.customDhikrs.length - 1];
    if (newAdded) {
      handleSelectDhikr(newAdded);
    }

    // Reset form
    setCustomName('');
    setCustomArabic('');
    setCustomMeaning('');
    setCustomTarget(33);
    setShowAddModal(false);
  };

  const handleDeleteCustomDhikr = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.deleteCustomDhikr(id);
    const updatedProfile = storageService.getProfile();
    onUpdateProfile(updatedProfile);
    if (selectedDhikr.id === id) {
      handleSelectDhikr(PRESET_DHIKR[0]);
    }
  };

  const progressPercent = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-2 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-xs font-bold text-emerald-800 dark:text-amber-300 hover:text-emerald-900 transition-colors py-1 px-2 rounded-xl hover:bg-emerald-800/10"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          <span>Back to Tools</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Add Custom Tasbih</span>
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl text-xs transition-colors border ${
              soundEnabled
                ? 'text-emerald-800 dark:text-amber-300 bg-emerald-800/10 dark:bg-emerald-950 border-emerald-700/20'
                : 'text-[#5C6F66] border-[#E8E4DC] dark:border-emerald-900/30'
            }`}
            title={soundEnabled ? 'Sound On' : 'Sound Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-xl text-xs text-[#5C6F66] dark:text-[#9EB2A7] hover:bg-emerald-800/10 border border-[#E8E4DC] dark:border-emerald-900/30 transition-colors"
            title="Total Dhikr Statistics"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tasbih Counter Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#063B2D] to-[#04281E] text-white shadow-xl shadow-emerald-950/20 border border-emerald-600/30 text-center relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-amber-400/5 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Active Dhikr Info */}
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Active Remembrance
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-arabic my-2 text-white">
              {selectedDhikr.arabic}
            </h2>
            <p className="text-base font-bold text-emerald-100">
              {selectedDhikr.transliteration}
            </p>
            <p className="text-xs text-emerald-200/80 max-w-md mx-auto mt-0.5 font-medium">
              "{selectedDhikr.translation}"
            </p>
          </div>

          {/* Big Interactive Counter Ring */}
          <div className="py-4 flex justify-center">
            <button
              onClick={handleIncrement}
              className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 transition-all border-4 border-emerald-500/30 shadow-inner flex flex-col items-center justify-center cursor-pointer group select-none"
            >
              {/* Progress Ring Visual */}
              <div
                className="absolute inset-0 rounded-full border-4 border-amber-400 transition-all duration-150 shadow-[0_0_12px_#FBBF24]"
                style={{
                  clipPath: `inset(${100 - progressPercent}% 0 0 0)`,
                }}
              />

              <span className="text-6xl sm:text-7xl font-black font-mono tracking-tighter text-white drop-shadow-md group-hover:scale-105 transition-transform">
                {count}
              </span>
              <span className="text-xs font-bold text-amber-300 mt-1">
                {target > 0 ? `Target: ${target}` : 'Free Count'}
              </span>
              <span className="text-[10px] text-emerald-200/90 mt-1 uppercase font-bold tracking-wider">
                Tap anywhere to count
              </span>
            </button>
          </div>

          {/* Session Progress Stats */}
          <div className="flex items-center justify-center gap-4 text-xs text-emerald-200/90 pt-1 font-medium">
            <div>
              Cycles: <strong className="text-white font-bold">{cycles}</strong>
            </div>
            <div>•</div>
            <div>
              Session Total: <strong className="text-white font-bold">{count + cycles * target}</strong>
            </div>
            <div>•</div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-rose-300 hover:text-rose-100 font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Target selector */}
      <div className="p-4 bg-white dark:bg-[#0D1E17] rounded-3xl border border-[#E8E4DC] dark:border-emerald-900/30 shadow-xs flex items-center justify-between">
        <span className="text-xs font-bold text-[#14241D] dark:text-[#F4F3EC]">
          Target Count:
        </span>
        <div className="flex items-center space-x-1.5">
          {[33, 99, 100, 500, 0].map((t) => (
            <button
              key={t}
              onClick={() => setTarget(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                target === t
                  ? 'bg-emerald-800 text-white dark:bg-emerald-950 dark:text-amber-300 shadow-xs border border-emerald-700/40'
                  : 'bg-[#F0EBE1] dark:bg-zinc-800 text-[#5C6F66] dark:text-[#9EB2A7] hover:bg-[#E5DFD4]'
              }`}
            >
              {t === 0 ? 'Free (∞)' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Dhikrs Added by User */}
      {customDhikrs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-amber-300">
              Your Custom Tasbihs ({customDhikrs.length})
            </h3>
            <span className="text-[11px] text-[#5C6F66] font-medium">Saved to your profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customDhikrs.map((d) => {
              const isCurrent = selectedDhikr.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => handleSelectDhikr(d)}
                  className={`p-4 rounded-3xl border text-left transition-all cursor-pointer relative group ${
                    isCurrent
                      ? 'border-amber-400 bg-amber-50/50 dark:bg-[#122820] shadow-sm ring-2 ring-amber-400/20'
                      : 'border-[#E8E4DC] dark:border-emerald-900/30 bg-white dark:bg-[#0D1E17] hover:bg-emerald-900/5 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-lg font-arabic font-bold text-emerald-800 dark:text-emerald-300">
                      {d.arabic}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isCurrent && <Check className="w-4 h-4 text-emerald-700 shrink-0" />}
                      <button
                        onClick={(e) => handleDeleteCustomDhikr(d.id, e)}
                        className="p-1 rounded-lg text-[#5C6F66] hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete custom tasbih"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#14241D] dark:text-[#F4F3EC] mt-1">
                    {d.transliteration}
                  </p>
                  <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7] font-medium">
                    {d.translation}
                  </p>
                  <div className="mt-2 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-800/10 dark:bg-emerald-950 px-2 py-0.5 rounded-md inline-block border border-emerald-700/20">
                    Target: {d.target} counts
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preset Dhikr Selection List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C6F66] dark:text-[#9EB2A7] px-1">
          Preset Remembrances (Sunnah Dhikr)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_DHIKR.map((d) => {
            const isCurrent = selectedDhikr.id === d.id;
            return (
              <button
                key={d.id}
                onClick={() => handleSelectDhikr(d)}
                className={`p-4 rounded-3xl border text-left transition-all ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-50/50 dark:bg-[#122820] shadow-sm ring-2 ring-amber-400/20'
                    : 'border-[#E8E4DC] dark:border-emerald-900/30 bg-white dark:bg-[#0D1E17] hover:bg-emerald-900/5 dark:hover:bg-emerald-950/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-lg font-arabic font-bold text-emerald-800 dark:text-emerald-300">
                    {d.arabic}
                  </span>
                  {isCurrent && <Check className="w-4 h-4 text-emerald-700 shrink-0" />}
                </div>
                <p className="text-sm font-bold text-[#14241D] dark:text-[#F4F3EC] mt-1">
                  {d.transliteration}
                </p>
                <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7] font-medium">
                  {d.translation}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lifetime stats modal / panel */}
      {showHistory && (
        <div className="p-4 bg-emerald-800/10 dark:bg-emerald-950/40 rounded-3xl border border-emerald-700/20 text-xs flex items-center justify-between animate-in fade-in">
          <div>
            <p className="font-bold text-emerald-900 dark:text-emerald-200">
              Total Lifetime Tasbih Counts:
            </p>
            <p className="text-[#5C6F66] dark:text-[#9EB2A7] mt-0.5 font-medium">
              Every praise recorded in your balance of good deeds in sha Allah.
            </p>
          </div>
          <span className="text-2xl font-extrabold text-emerald-800 dark:text-amber-300">
            {(profile.tasbihTotal || 0).toLocaleString()}
          </span>
        </div>
      )}

      {/* Add Custom Tasbih Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0D1E17] rounded-3xl shadow-2xl border border-[#E8E4DC] dark:border-emerald-900/30 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DC] dark:border-emerald-900/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-800/10 dark:bg-emerald-950 text-emerald-800 dark:text-amber-300 flex items-center justify-center border border-emerald-700/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#14241D] dark:text-[#F4F3EC]">
                    Add Custom Tasbih
                  </h3>
                  <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7]">Add any personal supplication or dhikr</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl text-[#5C6F66] hover:text-[#14241D] dark:hover:text-[#F4F3EC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomDhikr} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#14241D] dark:text-[#F4F3EC] mb-1">
                  Dhikr Name or Transliteration *
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Hasbunallahu wa ni'mal wakeel"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E8E4DC] dark:border-emerald-900/30 bg-[#FAF8F5] dark:bg-[#14241D] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:text-[#F4F3EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14241D] dark:text-[#F4F3EC] mb-1">
                  Arabic Text (Optional)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={customArabic}
                  onChange={(e) => setCustomArabic(e.target.value)}
                  placeholder="حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E8E4DC] dark:border-emerald-900/30 bg-[#FAF8F5] dark:bg-[#14241D] font-arabic text-sm text-right focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:text-[#F4F3EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14241D] dark:text-[#F4F3EC] mb-1">
                  English Meaning / Intention
                </label>
                <input
                  type="text"
                  value={customMeaning}
                  onChange={(e) => setCustomMeaning(e.target.value)}
                  placeholder="e.g. Allah is sufficient for us"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E8E4DC] dark:border-emerald-900/30 bg-[#FAF8F5] dark:bg-[#14241D] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:text-[#F4F3EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14241D] dark:text-[#F4F3EC] mb-1">
                  Target Count
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[33, 99, 100, 1000].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setCustomTarget(num)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        customTarget === num
                          ? 'border-emerald-700 bg-emerald-800/10 dark:bg-emerald-950 text-emerald-800 dark:text-amber-300'
                          : 'border-[#E8E4DC] dark:border-emerald-900/30 bg-[#FAF8F5] dark:bg-[#14241D] text-[#5C6F66]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C6F66] hover:bg-emerald-800/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Save Tasbih</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
