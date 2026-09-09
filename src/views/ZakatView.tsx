import React, { useState } from 'react';
import { ChevronLeft, Calculator, HelpCircle, ShieldCheck, DollarSign } from 'lucide-react';
import { ZakatCalculation } from '../types';

interface ZakatViewProps {
  onBack: () => void;
}

export const ZakatView: React.FC<ZakatViewProps> = ({ onBack }) => {
  const [cash, setCash] = useState<number>(0);
  const [goldGrams, setGoldGrams] = useState<number>(0);
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(75); // approx $/g
  const [silverGrams, setSilverGrams] = useState<number>(0);
  const [silverPricePerGram, setSilverPricePerGram] = useState<number>(0.95); // approx $/g
  const [investments, setInvestments] = useState<number>(0);
  const [businessAssets, setBusinessAssets] = useState<number>(0);
  const [liabilities, setLiabilities] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('USD ($)');

  // Nisab threshold calculation based on 85g gold or 595g silver
  const goldNisabValue = 85 * goldPricePerGram;
  const silverNisabValue = 595 * silverPricePerGram;
  const standardNisab = goldNisabValue;

  const totalGoldValue = goldGrams * goldPricePerGram;
  const totalSilverValue = silverGrams * silverPricePerGram;

  const totalAssets = cash + totalGoldValue + totalSilverValue + investments + businessAssets;
  const netWealth = Math.max(0, totalAssets - liabilities);

  const isEligible = netWealth >= standardNisab;
  const zakatDue = isEligible ? Math.round(netWealth * 0.025) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-2 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          <span>Back to Tools</span>
        </button>

        <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
          The 3rd Pillar of Islam
        </span>
      </div>

      {/* Hero Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-zinc-950 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="relative z-10">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-300">
            Zakat ul-Mal • زكاة المال
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-arabic mt-1">
            خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا
          </h1>
          <p className="text-xs text-zinc-300 mt-1">
            "Take from their wealth a charity by which you purify them and cause them increase." (Surah At-Tawbah 9:103)
          </p>
        </div>
      </div>

      {/* Result Display Banner */}
      <div
        className={`p-5 rounded-2xl border shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isEligible
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-zinc-900 dark:text-zinc-100'
            : 'bg-zinc-50 dark:bg-zinc-850 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
        }`}
      >
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-400 block">
            Net Zakatable Wealth: ${netWealth.toLocaleString()}
          </span>
          <h2 className="text-2xl font-extrabold mt-0.5">
            {isEligible ? (
              <span className="text-amber-700 dark:text-amber-400">
                Zakat Payable (2.5%): ${zakatDue.toLocaleString()}
              </span>
            ) : (
              <span className="text-zinc-500">Wealth Below Nisab Threshold</span>
            )}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Gold Nisab (85g) = ${Math.round(goldNisabValue).toLocaleString()} • Silver Nisab (595g) = ${Math.round(silverNisabValue).toLocaleString()}
          </p>
        </div>

        <div className="shrink-0">
          {isEligible ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow">
              <ShieldCheck className="w-4 h-4" />
              Zakat Fard (Due)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold">
              Exempt from Zakat
            </span>
          )}
        </div>
      </div>

      {/* Input Sections */}
      <div className="space-y-4">
        {/* 1. Liquid Cash & Bank */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
            <span>1. Cash & Bank Balances</span>
            <span className="text-xs text-zinc-400">In hand, checking, savings</span>
          </h3>
          <input
            type="number"
            min="0"
            value={cash || ''}
            onChange={(e) => setCash(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-zinc-100"
          />
        </div>

        {/* 2. Gold & Silver */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            2. Precious Metals (Gold & Silver)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                Gold Weight (Grams)
              </label>
              <input
                type="number"
                min="0"
                value={goldGrams || ''}
                onChange={(e) => setGoldGrams(parseFloat(e.target.value) || 0)}
                placeholder="Grams of gold owned"
                className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-zinc-100"
              />
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Value: ${Math.round(totalGoldValue).toLocaleString()} (at ${goldPricePerGram}/g)
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                Silver Weight (Grams)
              </label>
              <input
                type="number"
                min="0"
                value={silverGrams || ''}
                onChange={(e) => setSilverGrams(parseFloat(e.target.value) || 0)}
                placeholder="Grams of silver owned"
                className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-zinc-100"
              />
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Value: ${Math.round(totalSilverValue).toLocaleString()} (at ${silverPricePerGram}/g)
              </span>
            </div>
          </div>
        </div>

        {/* 3. Investments & Business Assets */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            3. Investments, Stocks & Business Merchandise
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                Stocks, Mutual Funds, Crypto ($)
              </label>
              <input
                type="number"
                min="0"
                value={investments || ''}
                onChange={(e) => setInvestments(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                Trade Goods & Business Stock ($)
              </label>
              <input
                type="number"
                min="0"
                value={businessAssets || ''}
                onChange={(e) => setBusinessAssets(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>

        {/* 4. Deductions / Immediate Debts */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
            <span>4. Deductible Immediate Debts</span>
            <span className="text-xs text-rose-600 dark:text-rose-400">Subtracted from wealth</span>
          </h3>
          <input
            type="number"
            min="0"
            value={liabilities || ''}
            onChange={(e) => setLiabilities(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-zinc-100"
          />
        </div>
      </div>
    </div>
  );
};
