import React, { useState } from 'react';
import { ChevronLeft, HelpCircle, CheckCircle2, XCircle, Award, RotateCcw, ArrowRight } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/quizzes';
import { QuizQuestion, UserProfile } from '../types';
import { storageService } from '../services/storageService';

interface QuizViewProps {
  profile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (p: UserProfile) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ profile, onBack, onUpdateProfile }) => {
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const currentQuestions = QUIZ_QUESTIONS.filter((q) => q.level === selectedLevel);
  const currentQ: QuizQuestion | undefined = currentQuestions[currentQuestionIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOptionIndex(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctAnswerIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      // Save best score in profile
      const prevBest = profile.quizScore || 0;
      if (score + (selectedOptionIndex === currentQ.correctAnswerIndex ? 1 : 0) > prevBest) {
        const updated = {
          ...profile,
          quizScore: score + (selectedOptionIndex === currentQ.correctAnswerIndex ? 1 : 0),
        };
        onUpdateProfile(updated);
        storageService.saveProfile(updated);
      }
    }
  };

  const handleRestart = (level?: 'beginner' | 'intermediate' | 'advanced') => {
    if (level) setSelectedLevel(level);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-2 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          <span>Back to Tools</span>
        </button>

        <span className="text-xs font-semibold text-zinc-500">
          Islamic Quiz Master
        </span>
      </div>

      {/* Difficulty selection pills */}
      <div className="flex items-center space-x-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl max-w-sm mx-auto">
        {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => handleRestart(lvl)}
            className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
              selectedLevel === lvl
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* QUIZ IN PROGRESS */}
      {!quizFinished && currentQ ? (
        <div className="space-y-4">
          {/* Progress Header */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600">
                {currentQ.category} • {selectedLevel.toUpperCase()}
              </span>
              <p className="text-xs text-zinc-500">
                Question {currentQuestionIndex + 1} of {currentQuestions.length}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400">Score</span>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {score} pts
              </p>
            </div>
          </div>

          {/* Question Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
              {currentQ.question}
            </h2>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOptionIndex === idx;
                const isCorrect = idx === currentQ.correctAnswerIndex;

                let btnStyle = 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200';
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'border-rose-500 bg-rose-100/70 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 rounded-2xl border text-left text-sm transition-all flex items-center justify-between ${btnStyle} hover:scale-[1.01]`}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback Explanation */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${selectedOptionIndex === currentQ.correctAnswerIndex ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedOptionIndex === currentQ.correctAnswerIndex ? '✓ Correct Answer!' : '✗ Incorrect'}
                  </span>
                  <span className="text-[11px] text-zinc-400">• Reference: {currentQ.reference}</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {currentQ.explanation}
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <span>{currentQuestionIndex + 1 === currentQuestions.length ? 'See Results' : 'Next Question'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* QUIZ FINISHED RESULTS SCREEN */
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-500 mx-auto flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Quiz Completed!
          </h2>

          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You scored <strong className="text-emerald-700 dark:text-emerald-400 text-lg">{score}</strong> out of <strong className="text-zinc-900 dark:text-zinc-100">{currentQuestions.length}</strong> questions in {selectedLevel} level.
          </p>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => handleRestart()}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry This Quiz</span>
            </button>
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs"
            >
              Back to Tools
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
