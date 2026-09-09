import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Compass,
  Clock,
  Heart,
  Moon,
  Sun,
  Search,
  Check,
  HelpCircle,
  Radio,
  Sliders,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  speechService,
  VoiceCommandResult,
} from '../services/speechService';
import { AppTab, ExploreFeature } from '../types';

interface VoiceNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: AppTab) => void;
  onNavigateExplore: (feature: ExploreFeature) => void;
  onSelectSurah?: (surahNumber: number) => void;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onStopAudio: () => void;
  onReciteDua: () => void;
}

export const VoiceNavigationModal: React.FC<VoiceNavigationModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onNavigateExplore,
  onSelectSurah,
  onToggleTheme,
  onOpenSearch,
  onStopAudio,
  onReciteDua,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [continuousMode, setContinuousMode] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'assistant' | 'commands'>('assistant');

  const isSupported = speechService.isSpeechRecognitionSupported();

  // Execute recognized command
  const executeCommand = (result: VoiceCommandResult) => {
    setLastFeedback(result.feedback);
    setErrorMessage(null);

    // Optional spoken voice feedback
    if (voiceFeedback && result.action !== 'UNKNOWN' && result.action !== 'STOP_AUDIO') {
      speechService.speakQuick(result.feedback);
    }

    switch (result.action) {
      case 'NAVIGATE_TAB':
        if (result.tab) {
          onNavigateTab(result.tab);
        }
        break;

      case 'NAVIGATE_EXPLORE':
        if (result.exploreFeature) {
          onNavigateExplore(result.exploreFeature);
        }
        break;

      case 'OPEN_SURAH':
        if (result.surahNumber && onSelectSurah) {
          onSelectSurah(result.surahNumber);
        }
        break;

      case 'TOGGLE_THEME':
        onToggleTheme();
        break;

      case 'OPEN_SEARCH':
        onOpenSearch();
        onClose();
        break;

      case 'STOP_AUDIO':
        onStopAudio();
        speechService.stopRecitation();
        break;

      case 'RECITE_DUA':
        onNavigateExplore('duas');
        onReciteDua();
        break;

      case 'SHOW_HELP':
        setActiveTab('commands');
        break;

      case 'UNKNOWN':
        // Safe feedback already set
        break;
    }

    // Auto-close if not in continuous hands-free mode and command was executed successfully
    if (!continuousMode && result.action !== 'UNKNOWN' && result.action !== 'SHOW_HELP') {
      setTimeout(() => {
        onClose();
      }, 1400);
    }
  };

  const handleStartListening = () => {
    setErrorMessage(null);
    setTranscript('');
    speechService.startListening({
      continuous: continuousMode,
      onInterim: (text) => setTranscript(text),
      onCommand: (result) => executeCommand(result),
      onStateChange: (active) => setIsListening(active),
      onError: (msg) => setErrorMessage(msg),
    });
  };

  const handleStopListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  // Start listening automatically when modal opens if supported
  useEffect(() => {
    if (isOpen && isSupported) {
      handleStartListening();
    } else {
      handleStopListening();
    }

    return () => {
      speechService.stopListening();
    };
  }, [isOpen, continuousMode]);

  if (!isOpen) return null;

  const exampleCommands = [
    {
      category: 'Holy Quran',
      icon: BookOpen,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      items: [
        { label: 'Open Quran', actionText: 'open quran' },
        { label: 'Surah Yasin', actionText: 'surah yasin' },
        { label: 'Surah Al-Kahf', actionText: 'surah kahf' },
        { label: 'Surah Al-Mulk', actionText: 'surah mulk' },
        { label: 'Surah Al-Baqarah', actionText: 'surah al baqarah' },
      ],
    },
    {
      category: 'Prayer & Adhan',
      icon: Clock,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',
      items: [
        { label: 'Prayer Times', actionText: 'open prayer times' },
        { label: 'Qibla Direction', actionText: 'open qibla compass' },
        { label: 'Find Mosque', actionText: 'find mosque' },
      ],
    },
    {
      category: 'Supplications & Dhikr',
      icon: Heart,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      items: [
        { label: 'Open Duas', actionText: 'open duas' },
        { label: 'Recite Dua', actionText: 'recite dua' },
        { label: 'Digital Tasbih', actionText: 'open tasbih' },
        { label: 'Hadith Collection', actionText: 'open hadith' },
      ],
    },
    {
      category: 'Tools & Controls',
      icon: Sliders,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      items: [
        { label: 'Dark Mode', actionText: 'dark mode' },
        { label: 'Light Mode', actionText: 'light mode' },
        { label: 'Stop Audio', actionText: 'stop audio' },
        { label: 'Search App', actionText: 'search' },
      ],
    },
  ];

  const handleTestCommand = (actionText: string) => {
    setTranscript(actionText);
    const result = speechService.parseVoiceCommand(actionText);
    executeCommand(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                Hands-Free Voice Navigation
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Web Speech
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Navigate anywhere in Noor using your voice
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Assistant vs Command Reference */}
        <div className="px-5 pt-3 pb-1 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`pb-2 px-1 border-b-2 transition-colors ${
              activeTab === 'assistant'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Voice Listener
          </button>
          <button
            onClick={() => setActiveTab('commands')}
            className={`pb-2 px-1 border-b-2 transition-colors ${
              activeTab === 'commands'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Command Reference & Quick Test
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {!isSupported ? (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2 text-center">
              <ShieldAlert className="w-8 h-8 mx-auto text-amber-600" />
              <h3 className="font-bold text-sm">Speech Recognition Not Supported</h3>
              <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                Your current browser does not support the Web Speech API recognition interface. For full hands-free voice navigation, please use Google Chrome, Microsoft Edge, or Safari.
              </p>
              <p className="text-xs font-medium pt-1">
                You can still test any voice command below using the one-tap buttons!
              </p>
            </div>
          ) : (
            activeTab === 'assistant' && (
              <>
                {/* Voice Status Sphere & Wave */}
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800/80 relative overflow-hidden">
                  {/* Subtle pulsing background glow when listening */}
                  {isListening && (
                    <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-400/10 animate-pulse pointer-events-none" />
                  )}

                  {/* Main Microphone Button */}
                  <div className="relative">
                    {isListening && (
                      <>
                        <span className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping" />
                        <span className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-pulse" />
                      </>
                    )}
                    <button
                      onClick={isListening ? handleStopListening : handleStartListening}
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 ${
                        isListening
                          ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 scale-105 ring-4 ring-emerald-500/30'
                          : 'bg-zinc-700 hover:bg-emerald-700'
                      }`}
                      title={isListening ? 'Click to pause listening' : 'Click to start voice recognition'}
                    >
                      {isListening ? (
                        <Mic className="w-9 h-9 animate-bounce" />
                      ) : (
                        <MicOff className="w-9 h-9" />
                      )}
                    </button>
                  </div>

                  {/* Live Audio Equalizer bars when listening */}
                  {isListening && (
                    <div className="flex items-center gap-1.5 h-6">
                      <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
                      <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-6" />
                      <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-4" />
                      <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-5" />
                      <span className="w-1 bg-emerald-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2" />
                    </div>
                  )}

                  {/* Status text */}
                  <div>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        isListening
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {isListening ? 'Listening for command...' : 'Microphone Paused'}
                    </span>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                      {isListening
                        ? 'Try saying "Open Quran", "Surah Yasin", "Open Duas", or "Prayer Times"'
                        : 'Tap the microphone to start hands-free navigation'}
                    </p>
                  </div>

                  {/* Spoken transcript bubble */}
                  {transcript && (
                    <div className="max-w-md mx-auto px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 font-medium shadow-sm">
                      <span className="text-zinc-400 text-[11px] block">Heard:</span>
                      "{transcript}"
                    </div>
                  )}

                  {/* Execution Feedback */}
                  {lastFeedback && (
                    <div className="max-w-md mx-auto px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2 shadow-sm animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{lastFeedback}</span>
                    </div>
                  )}

                  {/* Error display */}
                  {errorMessage && (
                    <div className="max-w-md mx-auto px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </div>

                {/* Settings & Controls (Continuous Hands-Free & Spoken Audio Confirmation) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Continuous listening mode */}
                  <button
                    onClick={() => {
                      const next = !continuousMode;
                      setContinuousMode(next);
                      if (isListening) {
                        speechService.stopListening();
                        setTimeout(() => handleStartListening(), 200);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                      continuousMode
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        <Radio className="w-3.5 h-3.5 text-emerald-600" />
                        Continuous Hands-Free
                      </span>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Keep microphone active across pages
                      </p>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        continuousMode
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                      }`}
                    >
                      {continuousMode ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Spoken voice feedback */}
                  <button
                    onClick={() => setVoiceFeedback(!voiceFeedback)}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                      voiceFeedback
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        {voiceFeedback ? (
                          <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                        Spoken Confirmation
                      </span>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Vocal audio cue when navigating
                      </p>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        voiceFeedback
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                      }`}
                    >
                      {voiceFeedback ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </>
            )
          )}

          {/* Quick Examples / Reference Grid */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Try Speaking These Commands
              </h3>
              <span className="text-[11px] text-zinc-400">Tap to test</span>
            </div>

            <div className="space-y-3">
              {exampleCommands.map((sec) => (
                <div
                  key={sec.category}
                  className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-850 space-y-2"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <sec.icon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{sec.category}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {sec.items.map((cmd) => (
                      <button
                        key={cmd.actionText}
                        onClick={() => handleTestCommand(cmd.actionText)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-zinc-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 border border-zinc-200/60 dark:border-zinc-700 transition-colors flex items-center gap-1 group"
                      >
                        <span>"{cmd.label}"</span>
                        <ChevronRight className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1 text-[11px]">
            <HelpCircle className="w-3.5 h-3.5" />
            Say "Stop" anytime to cancel audio recitation
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
