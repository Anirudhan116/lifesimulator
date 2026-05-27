'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import { predefinedPaths } from '@/utils/mockData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { 
  Briefcase, ShieldAlert, Award, Compass, DollarSign, Brain, HeartPulse, Sparkles, TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const DecisionTree = dynamic(() => import('@/components/DecisionTree'), { ssr: false });

export default function DashboardPage() {
  const { results, activePath, selectPredefinedPath, profile, scenarios, isLoading } = useAppContext();
  const [selectedYear, setSelectedYear] = useState<1 | 3 | 5 | 10>(10);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-violet p-[1px] animate-spin">
          <div className="h-full w-full rounded-xl bg-[#080614]"></div>
        </div>
        <p className="mt-4 text-xs font-mono text-slate-400">Bootstrapping simulation cache...</p>
      </div>
    );
  }

  // Get active year metrics
  const activeMetrics = results.metricsByYear[selectedYear] || results.metricsByYear[10];
  
  // Calculate Financial Health Score (out of 100)
  const calculateHealthScore = () => {
    let score = 0;
    
    // Emergency Fund (max 25 pts)
    const emScore = activeMetrics?.emergencyFundScore || 0;
    score += Math.min(emScore * 4, 25); // 6+ months covers it

    // Debt safety (max 25 pts)
    const debtRatio = profile.monthlyIncome > 0 ? activeMetrics.debtRemaining / (profile.monthlyIncome * 12) : 0;
    if (activeMetrics.debtRemaining === 0) score += 25;
    else if (debtRatio < 0.5) score += 20;
    else if (debtRatio < 1) score += 15;
    else if (debtRatio < 2) score += 8;

    // Stress / Burnout (max 25 pts)
    const stress = activeMetrics.stressScore;
    if (stress < 40) score += 25;
    else if (stress < 60) score += 18;
    else if (stress < 75) score += 10;
    else if (stress < 90) score += 5;

    // Freedom Probability (max 25 pts)
    score += Math.min(activeMetrics.freedomProbability * 0.25, 25);

    return Math.round(score);
  };

  const healthScore = calculateHealthScore();

  // Color helper for Health Score
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 50) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
  };

  // Format currency helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Recharts line chart data prep
  const chartData = results.timeline
    .filter((d) => d.month % 3 === 0) // sample quarterly to optimize chart rendering speed
    .map((d) => ({
      name: `Yr ${Math.round(d.month / 12 * 10) / 10}`,
      'Net Worth': d.netWorth,
      Investments: d.investments,
      Savings: d.savings,
      Debt: d.debtRemaining,
    }));

  // Recharts monthly cash flow analysis
  const cashFlowSampleIndex = selectedYear * 12 - 1;
  const cashFlowDataSample = results.timeline[cashFlowSampleIndex] || results.timeline[results.timeline.length - 1];
  const cashFlowChartData = [
    {
      name: 'Monthly Ledger',
      Income: cashFlowDataSample?.income || profile.monthlyIncome,
      Expenses: cashFlowDataSample?.expenses || profile.monthlyExpenses,
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10 space-y-8">
      {/* Top Header Selector */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-cyber-cyan via-white to-cyber-violet bg-clip-text text-transparent">
            Parallel Future Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulate your path: toggle active scenarios to model how stress, debt, and assets interact over a 10-year horizon.
          </p>
        </div>

        {/* Path Picker Buttons */}
        <div className="flex flex-wrap gap-2">
          {predefinedPaths.map((path) => (
            <button
              key={path.name}
              onClick={() => selectPredefinedPath(path.name)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                activePath === path.name
                  ? 'border-cyber-cyan/50 bg-cyber-cyan/10 text-cyber-cyan shadow-[0_0_12px_rgba(0,240,255,0.12)]'
                  : 'border-white/5 bg-white/3 text-slate-400 hover:bg-white/8 hover:text-slate-200'
              }`}
            >
              {path.name}
            </button>
          ))}
          {activePath === "Custom Simulation" && (
            <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-cyber-pink/50 bg-cyber-pink/10 text-cyber-pink shadow-[0_0_12px_rgba(217,70,239,0.12)] animate-pulse">
              Custom Path
            </span>
          )}
        </div>
      </div>

      {/* Main KPI Dashboard Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Projected Net Worth */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#0b0821]/45 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Projected Net Worth</span>
            <DollarSign className="h-4.5 w-4.5 text-cyber-cyan" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-cyber-cyan text-cyber-glow">
              {formatCurrency(activeMetrics?.netWorth || 0)}
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              At Year {selectedYear} (Age {profile.age + selectedYear})
            </p>
          </div>
        </div>

        {/* Card 2: Financial Health Score */}
        <div className={`glass-card p-6 rounded-2xl border ${getScoreColor(healthScore)} flex flex-col justify-between`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono uppercase tracking-wider opacity-85">Health Index Score</span>
            <HeartPulse className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">
              {healthScore}<span className="text-lg opacity-60">/100</span>
            </h2>
            <p className="text-[10px] opacity-80 mt-1">
              Compound efficiency rating
            </p>
          </div>
        </div>

        {/* Card 3: Burnout / Stress Level */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#0b0821]/45 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Burnout & Stress</span>
            <Brain className="h-4.5 w-4.5 text-cyber-rose animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-200">{activeMetrics?.stressScore}/100</h2>
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
                activeMetrics?.burnoutRisk > 60 ? 'bg-rose-500/10 text-rose-400' :
                activeMetrics?.burnoutRisk > 30 ? 'bg-amber-500/10 text-amber-400' :
                'bg-emerald-500/10 text-emerald-400'
              }`}>
                {activeMetrics?.burnoutRisk > 60 ? 'High' : activeMetrics?.burnoutRisk > 30 ? 'Med' : 'Low'} Risk
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Burnout Risk: {activeMetrics?.burnoutRisk}%
            </p>
          </div>
        </div>

        {/* Card 4: Freedom Probability */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#0b0821]/45 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Freedom Prob. (FIRE)</span>
            <Compass className="h-4.5 w-4.5 text-cyber-violet" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-cyber-violet text-violet-glow">
              {activeMetrics?.freedomProbability}%
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              Prob. of sustaining 15+ years
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts & Sidebars Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Area Graph: Net Worth Over Time */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 bg-[#0a071c]/45 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded bg-cyber-cyan"></span>
              Net Worth Accumulation Curve
            </h3>
            
            {/* Year Projection Toggle */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-white/5">
              {[1, 3, 5, 10].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr as any)}
                  className={`px-3 py-1 rounded-md text-[10px] font-mono font-semibold transition-all ${
                    selectedYear === yr
                      ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/20'
                      : 'text-slate-500 hover:text-slate-300 border border-transparent'
                  }`}
                >
                  {yr}Y
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.slice(0, selectedYear * 4)}>
                <defs>
                  <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false}
                  tickFormatter={(v) => `₹${Math.round(v / 100000)}L`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#0c0a21',
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#f8fafc'
                  }}
                  formatter={(val: any) => [formatCurrency(Number(val || 0)), '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="Net Worth" 
                  stroke="#00f0ff" 
                  fillOpacity={1} 
                  fill="url(#colorNetWorth)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="Investments" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#colorInvest)" 
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar: Financial Ledger & Metrics */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#0a071c]/45 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-200 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded bg-cyber-pink"></span>
              Ledger (Year {selectedYear})
            </h3>

            {/* Recharts Income vs Expense */}
            <div className="w-full h-40 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" stroke="none" />
                  <YAxis stroke="#475569" fontSize={10} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0c0a21', borderColor: 'rgba(255,255,255,0.08)', fontSize: '11px' }}
                    formatter={(v: any) => formatCurrency(Number(v || 0))}
                  />
                  <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: '10px' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* List Details */}
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                <span className="text-slate-400">Total Liquid Savings:</span>
                <span className="font-mono font-bold text-slate-200">{formatCurrency(activeMetrics?.savings || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                <span className="text-slate-400">Total Capital Investments:</span>
                <span className="font-mono font-bold text-cyber-violet">{formatCurrency(activeMetrics?.investments || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                <span className="text-slate-400">Outstanding Debt:</span>
                <span className={`font-mono font-bold ${activeMetrics?.debtRemaining > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {formatCurrency(activeMetrics?.debtRemaining || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pb-1">
                <span className="text-slate-400">Emergency Fund Score:</span>
                <span className={`font-mono font-bold ${activeMetrics?.emergencyFundScore >= 6 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {activeMetrics?.emergencyFundScore} months
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <Link
              href="/scenarios"
              className="glow-btn block w-full py-2 bg-gradient-to-r from-cyber-cyan to-cyber-violet text-center text-slate-950 text-xs font-bold rounded-lg hover:opacity-95"
            >
              Modify Life Decisions
            </Link>
          </div>
        </div>
      </div>

      {/* Milestones & Decision Tree Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Milestone Badge Grid */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#0a071c]/45 space-y-5 lg:col-span-1">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded bg-cyber-violet"></span>
            Milestones unlocked
          </h3>
          
          <div className="flex flex-wrap gap-2.5">
            {results.summary.milestonesMet.map((mile) => (
              <span 
                key={mile}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.06)]"
              >
                <Award className="h-3.5 w-3.5 shrink-0" />
                {mile}
              </span>
            ))}
            {results.summary.milestonesMet.length === 0 && (
              <p className="text-xs italic text-slate-500">No milestones achieved yet on this timeline. Try increasing income, reducing expenses or investing more.</p>
            )}
          </div>

          {/* Quick AI Suggestion banner */}
          <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/60 text-xs text-slate-400 flex items-start gap-2.5 leading-relaxed">
            <Sparkles className="h-4.5 w-4.5 text-cyber-cyan shrink-0 animate-pulse mt-0.5" />
            <div>
              <span className="font-bold text-slate-200">Interactive Tip:</span> Make a custom scenario inside the Scenarios page to test any unique decisions (e.g. buying a bike, renting in a cheaper area).
            </div>
          </div>
        </div>

        {/* Decision Flow Tree (takes 2 columns) */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded bg-cyber-cyan"></span>
              Career & Decision Path Branches
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Visually track active scenarios on the decision tree map.</p>
          </div>
          {/* Include our DecisionTree component */}
          <iframe 
            srcDoc="" 
            style={{ display: 'none' }} 
            title="dummy"
          />
          {/* Instantiating DecisionTree */}
          {/* Filter scenario ids that are enabled */}
          <div className="flex-1">
            <iframe srcDoc="" style={{ display: 'none' }} title="dummy2" />
            <div className="w-full">
              <div className="w-full">
                {/* Dynamically passing scenario active states */}
                {(() => {
                  const activeSc = predefinedPaths.find((p) => p.name === activePath)?.scenarioIds || 
                    (scenarios && scenarios.filter(s => s.isEnabled).map(s => s.id)) || [];
                  return <DecisionTree activeScenarios={activeSc} />;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
