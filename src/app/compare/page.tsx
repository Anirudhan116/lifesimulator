'use client';

import { useAppContext } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import RadarChart from '@/components/RadarChart';
import { ShieldCheck, AlertTriangle, Flame, Compass, Sparkles, TrendingUp, Info } from 'lucide-react';
import Link from 'next/link';

export default function ComparePage() {
  const { compareResults, activePath, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-violet p-[1px] animate-spin">
          <div className="h-full w-full rounded-xl bg-[#080614]"></div>
        </div>
        <p className="mt-4 text-xs font-mono text-slate-400">Comparing dimensions...</p>
      </div>
    );
  }

  // Predefined Path settings with colors
  const pathSettings = [
    { name: 'Current Path', id: 'current', color: '#94a3b8' },
    { name: 'High Salary & Burnout Path', id: 'high_salary', color: '#8b5cf6' },
    { name: 'Higher Studies & Growth Path', id: 'higher_studies', color: '#f59e0b' },
    { name: 'Entrepreneurship Path', id: 'startup', color: '#f43f5e' },
    { name: 'Financial Freedom Speedrun', id: 'freedom_speedrun', color: '#00f0ff' }
  ];

  // Map settings to result keys
  const getResultsForId = (id: string) => {
    switch (id) {
      case 'current': return compareResults['Current Path'];
      case 'high_salary': return compareResults['High Salary & Burnout Path'];
      case 'higher_studies': return compareResults['Higher Studies & Growth Path'];
      case 'startup': return compareResults['Entrepreneurship Path'];
      case 'freedom_speedrun': return compareResults['Financial Freedom Speedrun'];
      default: return null;
    }
  };

  // 1. Prepare Line Chart overlay dataset
  // We align monthly intervals of all 5 simulations.
  const sampleMonthsCount = 120; // 10 years
  const chartData = [];
  
  for (let m = 0; m < sampleMonthsCount; m += 3) { // quarterly sampling
    const name = `Yr ${Math.round(m / 12 * 10) / 10}`;
    const dataPoint: any = { name };
    
    pathSettings.forEach((path) => {
      const runRes = getResultsForId(path.id);
      if (runRes && runRes.timeline[m]) {
        dataPoint[path.name] = runRes.timeline[m].netWorth;
      }
    });
    
    chartData.push(dataPoint);
  }

  // 2. Prepare Radar Chart comparison dataset
  // Scale dimensions 0 to 100 for proper visual mapping
  const subjects = [
    { name: 'Wealth Accumulation', key: 'wealth' },
    { name: 'Stress Safety', key: 'stress' }, // higher = less stress
    { name: 'Cash Flow Health', key: 'cashflow' },
    { name: 'Freedom (FIRE)', key: 'freedom' },
    { name: 'Burnout Safety', key: 'burnout' }, // higher = less burnout
    { name: 'Debt Safety', key: 'debt' } // higher = less debt
  ];

  const radarData = subjects.map((sub) => {
    const pt: any = { subject: sub.name };
    
    pathSettings.forEach((path) => {
      const runRes = getResultsForId(path.id);
      if (!runRes) return;
      
      const finalMonth = runRes.timeline[runRes.timeline.length - 1];
      let val = 50; // default baseline

      if (sub.key === 'wealth') {
        // max wealth threshold ₹3 Cr = 100
        val = Math.min((runRes.summary.finalNetWorth / 30000000) * 100, 100);
      } else if (sub.key === 'stress') {
        val = 100 - runRes.summary.averageStress; // higher = better
      } else if (sub.key === 'cashflow') {
        // average monthly cash flow relative to 1.5L = 100
        const avgCF = finalMonth?.cashFlow || 0;
        val = Math.max(0, Math.min((avgCF / 150000) * 100, 100));
      } else if (sub.key === 'freedom') {
        val = runRes.summary.financialFreedomProbability;
      } else if (sub.key === 'burnout') {
        const yr10Metrics = runRes.metricsByYear[10] || runRes.metricsByYear[5];
        val = 100 - (yr10Metrics?.burnoutRisk || 0); // higher = less burnout
      } else if (sub.key === 'debt') {
        const debt = runRes.summary.totalDebt;
        if (debt === 0) val = 100;
        else val = Math.max(0, 100 - Math.min((debt / 1000000) * 50, 95)); // deduct score for debt
      }

      pt[path.id] = Math.round(val);
    });

    return pt;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Generate automated explanation details for each path
  const getPathDescription = (id: string, name: string) => {
    const res = getResultsForId(id);
    if (!res) return '';

    const nw = res.summary.finalNetWorth;
    const stress = res.summary.averageStress;
    const free = res.summary.financialFreedomProbability;

    if (id === 'startup') {
      return `Very high volatility. Reaches a simulated best-case net worth of ${formatCurrency(res.summary.bestCaseNetWorth)} but carries severe stress levels (${stress}/100) and risk of early-stage financial distress.`;
    }
    if (id === 'high_salary') {
      return `Generates highly efficient savings early, leading to ${formatCurrency(nw)} net worth. However, sustained work hour loads increase burnout probability to ${res.metricsByYear[10]?.burnoutRisk || 0}%.`;
    }
    if (id === 'higher_studies') {
      return `Requires significant initial debt overhead. Projections showcase negative cash flows for years 1-2, followed by rapid salary scaling. Safety increases dramatically in later years.`;
    }
    if (id === 'freedom_speedrun') {
      return `Maximizes early investment compounding. Combined indices and side income generate a ${free}% financial independence probability, while keeping stress levels at a comfortable ${stress}/100.`;
    }
    return `The low-variance control path. Avoids high-interest debts, maintaining low stress (${stress}/100) but accumulates wealth at a slower rate, delaying retirement options.`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10 space-y-10">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-cyber-cyan via-white to-cyber-violet bg-clip-text text-transparent">
          Parallel Universe Comparison
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Overlay projected futures side-by-side. Analyze cumulative net worth curves, stress tolerances, and risk indices across five paths.
        </p>
      </div>

      {/* Overlaid Line Chart */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#0a071c]/45 space-y-4">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded bg-cyber-cyan"></span>
          Net Worth Projections Overlay (10 Years)
        </h3>
        
        <div className="w-full h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
              <YAxis 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                tickFormatter={(v) => `₹${Math.round(v / 100000)}L`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#070514',
                  borderColor: 'rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  fontSize: '11px'
                }}
                formatter={(v: any) => formatCurrency(Number(v || 0))}
              />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: '10px' }} />
              {pathSettings.map((path) => (
                <Line
                  key={path.id}
                  type="monotone"
                  dataKey={path.name}
                  stroke={path.color}
                  strokeWidth={activePath === path.name ? 3 : 1.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Overlay & Automated Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
        {/* Radar Chart (3 cols) */}
        <div className="lg:col-span-3 glass-card p-6 rounded-2xl border border-white/5 bg-[#0a071c]/45">
          <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded bg-cyber-violet"></span>
            Multidimensional Comparison Matrix
          </h3>
          <RadarChart 
            data={radarData}
            scenarios={pathSettings.map(p => ({ id: p.id, name: p.name, color: p.color }))}
          />
        </div>

        {/* Text descriptions (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-2">
            <span className="w-1.5 h-5 rounded bg-cyber-pink"></span>
            Trade-off Analytics
          </h3>
          
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
            {pathSettings.map((path) => (
              <div key={path.id} className="p-3.5 rounded-xl border border-white/5 bg-slate-950/40 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: path.color }}></span>
                  <h4 className="text-xs font-bold text-slate-200">{path.name}</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {getPathDescription(path.id, path.name)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="glass-card rounded-2xl border border-white/5 bg-[#0a071c]/45 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded bg-cyber-emerald"></span>
            Parallel Projections Metrics Table
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-slate-950/60 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Path name</th>
                <th className="p-4 text-right">10Y Net Worth</th>
                <th className="p-4 text-right">Best Case (95%)</th>
                <th className="p-4 text-right">Worst Case (5%)</th>
                <th className="p-4 text-center">Avg Stress</th>
                <th className="p-4 text-center">Burnout Risk</th>
                <th className="p-4 text-center">Freedom (FIRE)</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300 divide-y divide-white/3">
              {pathSettings.map((path) => {
                const res = getResultsForId(path.id);
                if (!res) return null;
                const finalMetrics = res.metricsByYear[10] || res.metricsByYear[5];

                return (
                  <tr key={path.id} className="hover:bg-white/2 transition-colors">
                    <td className="p-4 pl-6 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: path.color }}></span>
                      {path.name}
                    </td>
                    <td className="p-4 text-right font-mono text-cyber-cyan font-semibold">
                      {formatCurrency(res.summary.finalNetWorth)}
                    </td>
                    <td className="p-4 text-right font-mono text-emerald-400">
                      {formatCurrency(res.summary.bestCaseNetWorth)}
                    </td>
                    <td className="p-4 text-right font-mono text-rose-400">
                      {formatCurrency(res.summary.worstCaseNetWorth)}
                    </td>
                    <td className="p-4 text-center font-mono">
                      {res.summary.averageStress}/100
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        res.summary.burnoutRiskCategory === 'high' ? 'bg-rose-500/10 text-rose-400' :
                        res.summary.burnoutRiskCategory === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {res.summary.burnoutRiskCategory.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono text-cyber-violet font-semibold">
                      {res.summary.financialFreedomProbability}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
