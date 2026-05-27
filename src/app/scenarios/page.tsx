'use client';

import { useAppContext } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Sliders, ToggleLeft, ToggleRight, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, TrendingUp, DollarSign } from 'lucide-react';

export default function ScenariosPage() {
  const { scenarios, toggleScenario, updateScenario, results, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-violet p-[1px] animate-spin">
          <div className="h-full w-full rounded-xl bg-[#080614]"></div>
        </div>
        <p className="mt-4 text-xs font-mono text-slate-400">Loading scenarios...</p>
      </div>
    );
  }

  // Format currency helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Icon selector based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'job': return BriefcaseIcon;
      case 'education': return EducationIcon;
      case 'startup': return StartupIcon;
      case 'investment': return InvestmentIcon;
      case 'purchase': return PurchaseIcon;
      case 'freelance': return FreelanceIcon;
      default: return Sliders;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10 space-y-8">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-cyber-cyan to-cyber-violet bg-clip-text text-transparent">
          Decision Scenario Sandbox
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Add or activate life choices. Tweak variables like costs, risks, and stress multipliers to observe long-term financial consequences.
        </p>
      </div>

      {/* Grid List of Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((sc, idx) => {
          const IconComponent = getCategoryIcon(sc.category);
          
          return (
            <motion.div
              key={sc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className={`glass-card p-6 rounded-2xl border transition-all ${
                sc.isEnabled 
                  ? 'border-cyber-cyan/40 bg-[#090b22]/55 shadow-[0_0_15px_rgba(0,240,255,0.06)]' 
                  : 'border-white/5 bg-[#0a071c]/45'
              }`}
            >
              {/* Scenario Header: Title + Toggle */}
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                    sc.isEnabled 
                      ? 'bg-cyber-cyan/10 border-cyber-cyan/35 text-cyber-cyan' 
                      : 'bg-slate-900 border-white/5 text-slate-500'
                  }`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`text-sm sm:text-base font-bold ${sc.isEnabled ? 'text-slate-100' : 'text-slate-400'}`}>
                      {sc.name}
                    </h3>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500">
                      Category: {sc.category}
                    </span>
                  </div>
                </div>

                {/* Switch Toggle */}
                <button
                  type="button"
                  onClick={() => toggleScenario(sc.id)}
                  className="focus:outline-none transition-transform active:scale-95"
                >
                  {sc.isEnabled ? (
                    <ToggleRight className="h-9 w-9 text-cyber-cyan" />
                  ) : (
                    <ToggleLeft className="h-9 w-9 text-slate-600" />
                  )}
                </button>
              </div>

              {/* Editable Variables Sliders */}
              <div className="space-y-4 pt-3 border-t border-white/5">
                {/* Variable 1: Upfront Cost */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-slate-400">Upfront Capital Requirement</span>
                    <span className="text-cyber-cyan font-bold">{formatCurrency(sc.variables.upfrontCost)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1000000}
                    step={10000}
                    value={sc.variables.upfrontCost}
                    disabled={!sc.isEnabled}
                    onChange={(e) => updateScenario(sc.id, { upfrontCost: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyber-cyan disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Variable 2: Monthly Cash Impact */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-slate-400">Monthly Overhead Cash outflow</span>
                    <span className="text-cyber-cyan font-bold">{formatCurrency(sc.variables.monthlyCost)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100000}
                    step={1000}
                    value={sc.variables.monthlyCost}
                    disabled={!sc.isEnabled}
                    onChange={(e) => updateScenario(sc.id, { monthlyCost: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyber-cyan disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Variable 3: Expected Income Change */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-slate-400">Monthly Salary Offset</span>
                    <span className={`font-bold ${sc.variables.expectedIncomeChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {sc.variables.expectedIncomeChange >= 0 ? '+' : ''}{formatCurrency(sc.variables.expectedIncomeChange)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-100000}
                    max={200000}
                    step={2000}
                    value={sc.variables.expectedIncomeChange}
                    disabled={!sc.isEnabled}
                    onChange={(e) => updateScenario(sc.id, { expectedIncomeChange: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyber-cyan disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Variable 4: Stress Level Impact */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-slate-400">Anxiety / Stress Impact</span>
                    <span className={`font-bold ${sc.variables.stressImpact >= 30 ? 'text-rose-400' : sc.variables.stressImpact >= 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {sc.variables.stressImpact >= 0 ? '+' : ''}{sc.variables.stressImpact} stress pts
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-40}
                    max={60}
                    step={2}
                    value={sc.variables.stressImpact}
                    disabled={!sc.isEnabled}
                    onChange={(e) => updateScenario(sc.id, { stressImpact: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyber-cyan disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Variable 5: Growth Potential */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-slate-400">Compound Growth Potential</span>
                    <span className="text-cyber-cyan font-bold">{sc.variables.growthPotential}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={sc.variables.growthPotential}
                    disabled={!sc.isEnabled}
                    onChange={(e) => updateScenario(sc.id, { growthPotential: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyber-cyan disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Conditional variables: Debt details if present */}
                {sc.variables.debtPrincipal && sc.variables.debtPrincipal > 0 && (
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5 flex flex-col gap-1.5">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500">Loan Structure</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                      <span>Loan Amount: <span className="text-slate-200">₹{sc.variables.debtPrincipal.toLocaleString('en-IN')}</span></span>
                      <span>Interest Rate: <span className="text-slate-200">{((sc.variables.debtInterest || 0.08) * 100).toFixed(1)}%</span></span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Icon Definitions for rendering
function BriefcaseIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 2H9a2 2 0 0 0-2 2v2H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4V4a2 2 0 0 0-2-2z" />
      <rect width="22" height="14" x="1" y="8" rx="2" />
      <path d="M7 6h10" />
    </svg>
  );
}

function EducationIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}

function StartupIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.5 16.5c-1.5 1.26-2 3-2 3s1.74-.5 3-2" />
      <path d="M12 3v18" />
      <path d="M16.5 4.5c1.26-1.5 3-2 3-2s-.5 1.74-2 3" />
      <path d="M2 12h18" />
      <path d="M8 8a4 4 0 1 0 8 0 4 4 0 1 0-8 0z" />
    </svg>
  );
}

function InvestmentIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" x2="12" y1="1" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function PurchaseIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function FreelanceIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
