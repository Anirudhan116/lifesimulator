'use client';

import { useAppContext } from '@/context/AppContext';
import { motion } from 'framer-motion';
import FutureSelf from '@/components/FutureSelf';
import { 
  Award, TrendingUp, AlertTriangle, ShieldCheck, Printer, ArrowRight, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';

export default function ReportsPage() {
  const { results, compareResults, activePath, profile, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-violet p-[1px] animate-spin">
          <div className="h-full w-full rounded-xl bg-[#080614]"></div>
        </div>
        <p className="mt-4 text-xs font-mono text-slate-400">Generating report metrics...</p>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Compute best, safest, and riskiest paths
  const getEvaluatedScenarios = () => {
    const paths = Object.keys(compareResults);
    let bestPath = paths[0];
    let safestPath = paths[0];
    let riskiestPath = paths[0];

    let maxNW = -Infinity;
    let minStress = Infinity;
    let maxStress = -Infinity;

    paths.forEach((p) => {
      const res = compareResults[p];
      if (res.summary.finalNetWorth > maxNW) {
        maxNW = res.summary.finalNetWorth;
        bestPath = p;
      }
      if (res.summary.averageStress < minStress) {
        minStress = res.summary.averageStress;
        safestPath = p;
      }
      if (res.summary.averageStress > maxStress) {
        maxStress = res.summary.averageStress;
        riskiestPath = p;
      }
    });

    return { bestPath, safestPath, riskiestPath };
  };

  const { bestPath, safestPath, riskiestPath } = getEvaluatedScenarios();

  // Generate actionable financial recommendations
  const getRecommendations = () => {
    const recs: string[] = [];
    const avgStressVal = results.summary.averageStress;
    const debtVal = results.summary.totalDebt;
    const finalNWVal = results.summary.finalNetWorth;
    const freedomProb = results.summary.financialFreedomProbability;

    if (debtVal > 500000) {
      recs.push(`Prioritize paying off high-interest debts. You currently project ₹${debtVal.toLocaleString('en-IN')} in total debt liability. Accelerating loan repayments will secure significant savings on interest compounding.`);
    }

    if (avgStressVal > 65) {
      recs.push(`Evaluate lifestyle stressors. Your active path projects an average stress index of ${avgStressVal}/100. Consider swapping to a moderate-salary corporate path or allocating funds to buy back time (e.g. outsource chores, move closer to office).`);
    }

    if (freedomProb < 50) {
      recs.push(`Increase monthly investments. To scale your Financial Freedom (FIRE) probability above 50% from the current ${freedomProb}%, aim to increase monthly savings contributions by at least 15% through expense rationalization.`);
    } else {
      recs.push(`Your Financial Freedom probability stands strong at ${freedomProb}%. Consider shifting excess savings into diversified, lower-risk indexes to lock in your compounding yields.`);
    }

    // Goal checks
    profile.majorGoals.forEach((goal) => {
      const alreadyMet = results.summary.milestonesMet.includes(goal.name) || results.summary.milestonesMet.includes(`${goal.name} (On Track)`);
      if (!alreadyMet) {
        const targetMonths = (goal.targetAge - profile.age) * 12;
        if (targetMonths > 0) {
          const deficit = goal.targetAmount - (results.timeline[targetMonths - 1]?.netWorth || results.summary.finalNetWorth);
          if (deficit > 0) {
            recs.push(`To achieve your "${goal.name}" milestone by age ${goal.targetAge}, you must close a projected savings deficit of ${formatCurrency(deficit)}. Consider enabling the 'Freelance' scenario or scaling investment allocations.`);
          }
        }
      }
    });

    if (recs.length === 0) {
      recs.push("Your baseline trajectory is highly optimized across stress, debt, and asset variables. Maintain current saving rates and index-allocations.");
    }

    return recs;
  };

  const recommendations = getRecommendations();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10 space-y-10 print:py-0 print:text-black">
      {/* Header and Print action */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6 print:border-slate-300">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-cyber-cyan to-cyber-violet bg-clip-text text-transparent print:bg-none print:text-black">
            Financial & Life Simulation Brief
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 print:text-slate-500">
            A comprehensive trade-off report summarizing compound projection indices and tactical suggestions.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all print:hidden"
        >
          <Printer className="h-4 w-4" />
          Print Brief
        </button>
      </div>

      {/* Path Classification Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Best Wealth Card */}
        <div className="glass-card p-5 rounded-xl border border-white/5 bg-[#0b081e]/40 flex flex-col justify-between h-36 print:bg-white print:border-slate-300">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded print:text-emerald-700">
              Optimal Wealth Path
            </span>
            <h4 className="text-sm font-bold text-slate-100 mt-3 print:text-black">{bestPath}</h4>
          </div>
          <p className="text-[10px] text-slate-400 font-mono print:text-slate-600">
            Yields highest projected 10Y Net Worth: {formatCurrency(compareResults[bestPath]?.summary.finalNetWorth)}
          </p>
        </div>

        {/* Safest stress Card */}
        <div className="glass-card p-5 rounded-xl border border-white/5 bg-[#0b081e]/40 flex flex-col justify-between h-36 print:bg-white print:border-slate-300">
          <div>
            <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest bg-sky-500/10 px-2 py-0.5 rounded print:text-sky-700">
              Lowest Anxiety Path
            </span>
            <h4 className="text-sm font-bold text-slate-100 mt-3 print:text-black">{safestPath}</h4>
          </div>
          <p className="text-[10px] text-slate-400 font-mono print:text-slate-600">
            Maintains lowest average stress levels: {compareResults[safestPath]?.summary.averageStress}/100
          </p>
        </div>

        {/* Riskiest Card */}
        <div className="glass-card p-5 rounded-xl border border-white/5 bg-[#0b081e]/40 flex flex-col justify-between h-36 print:bg-white print:border-slate-300">
          <div>
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded print:text-rose-700">
              Highest Risk Path
            </span>
            <h4 className="text-sm font-bold text-slate-100 mt-3 print:text-black">{riskiestPath}</h4>
          </div>
          <p className="text-[10px] text-slate-400 font-mono print:text-slate-600">
            Carries elevated stress and career friction.
          </p>
        </div>
      </div>

      {/* Selected Path Analysis Section */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#0a071c]/45 space-y-6 print:bg-white print:border-slate-300">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 border-b border-white/5 pb-3 print:text-black">
          <span className="w-1.5 h-5 rounded bg-cyber-cyan print:bg-slate-500"></span>
          Simulated Path Analysis: <span className="text-cyber-cyan print:text-black">{activePath}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-white/5 print:border-slate-200">
              <span className="text-slate-400">10-Year Final Net Worth:</span>
              <span className="font-mono font-bold text-cyber-cyan print:text-black">{formatCurrency(results.summary.finalNetWorth)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5 print:border-slate-200">
              <span className="text-slate-400">Best Case Scenario (Upper 95%):</span>
              <span className="font-mono font-bold text-emerald-400 print:text-emerald-700">{formatCurrency(results.summary.bestCaseNetWorth)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5 print:border-slate-200">
              <span className="text-slate-400">Worst Case Scenario (Lower 5%):</span>
              <span className="font-mono font-bold text-rose-400 print:text-rose-700">{formatCurrency(results.summary.worstCaseNetWorth)}</span>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex justify-between items-center pb-2 border-b border-white/5 print:border-slate-200">
              <span className="text-slate-400">Average Path Stress:</span>
              <span className="font-mono font-bold text-slate-200 print:text-black">{results.summary.averageStress}/100</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5 print:border-slate-200">
              <span className="text-slate-400">Burnout Safety Level:</span>
              <span className="font-bold text-slate-200 uppercase print:text-black">{results.summary.burnoutRiskCategory}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5 print:border-slate-200">
              <span className="text-slate-400">Financial Independence Prob:</span>
              <span className="font-mono font-bold text-cyber-violet print:text-black">{results.summary.financialFreedomProbability}%</span>
            </div>
          </div>
        </div>

        {/* Milestones Met Summary */}
        <div className="space-y-3 pt-4 border-t border-white/5 print:border-slate-200">
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">Target Goals Met</h4>
          {results.summary.milestonesMet.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {results.summary.milestonesMet.map((mile) => (
                <div key={mile} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{mile}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs italic text-slate-500">No milestones simulated as completed inside this path's window yet.</p>
          )}
        </div>
      </div>

      {/* AI Advisor Recommendations Checklist */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#0a071c]/45 space-y-4 print:bg-white print:border-slate-300">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 print:text-black">
          <span className="w-1.5 h-5 rounded bg-cyber-pink print:bg-slate-500"></span>
          AI Advisor Recommended Actions
        </h3>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed border-b border-white/5 pb-3 last:border-0 print:border-slate-200">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-cyber-cyan/10 border border-cyber-cyan/35 text-cyber-cyan font-mono text-[10px] font-bold print:border-slate-400 print:text-black">
                {index + 1}
              </span>
              <p className="mt-0.5">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Future Self Message Section */}
      <div className="print:hidden">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded bg-cyber-violet"></span>
            Future Self Hologram Transmission
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Decrypt a projection message from 10 years in the future based on this scenario.</p>
        </div>
        <FutureSelf results={results} pathName={activePath} />
      </div>
    </div>
  );
}
