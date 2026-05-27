'use client';

import { motion } from 'framer-motion';
import { Calendar, Briefcase, Award, TrendingUp, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { MonthData } from '@/utils/simulation';

interface LifeTimelineProps {
  timeline: MonthData[];
  milestonesMet: string[];
}

export default function LifeTimeline({ timeline, milestonesMet }: LifeTimelineProps) {
  // Extract key milestone events at years 1, 3, 5, 10
  const getEvents = () => {
    const events: {
      year: number;
      age: number;
      title: string;
      description: string;
      icon: any;
      type: 'success' | 'warning' | 'info' | 'critical';
    }[] = [];

    const years = [1, 3, 5, 10].filter((y) => y * 12 <= timeline.length);

    years.forEach((yr) => {
      const monthIdx = yr * 12 - 1;
      const mData = timeline[monthIdx];
      if (!mData) return;

      const netWorthStr = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(mData.netWorth);

      const cashFlowStr = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(mData.cashFlow);

      // Add a baseline financial status event
      events.push({
        year: yr,
        age: mData.age,
        title: `Year ${yr} Financial Update`,
        description: `Net Worth projects to ${netWorthStr} with a monthly net cash flow of ${cashFlowStr}.`,
        icon: TrendingUp,
        type: 'info',
      });

      // Check for high stress / burnout
      if (mData.stressScore > 80) {
        events.push({
          year: yr,
          age: mData.age,
          title: `Burnout Alert (Year ${yr})`,
          description: `Extremely high stress level (${mData.stressScore}/100) indicates serious risk of professional burnout. Consider reducing expenses or changing jobs.`,
          icon: Flame,
          type: 'critical',
        });
      } else if (mData.stressScore > 65) {
        events.push({
          year: yr,
          age: mData.age,
          title: `High Stress Warning (Year ${yr})`,
          description: `Stress levels are elevated at ${mData.stressScore}/100. Monitor work hours and lifestyle overhead.`,
          icon: AlertTriangle,
          type: 'warning',
        });
      }

      // Check for debt levels
      if (mData.debtRemaining > 0 && yr === 5) {
        events.push({
          year: yr,
          age: mData.age,
          title: `Active Debt Obligations`,
          description: `You still carry ${new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          }).format(mData.debtRemaining)} in debt after 5 years, impacting investment velocity.`,
          icon: AlertTriangle,
          type: 'warning',
        });
      }
    });

    // Match static milestone strings met to years where they logically happen
    if (milestonesMet.includes("6-Month Emergency Fund Built")) {
      const builtMonth = timeline.findIndex((m) => m.savings >= m.expenses * 6);
      if (builtMonth !== -1) {
        const yr = Math.floor(builtMonth / 12) + 1;
        events.push({
          year: yr,
          age: timeline[builtMonth].age,
          title: "Safety Net Secured",
          description: "6 months of living expenses accumulated in cash savings. Your risk tolerance increases.",
          icon: ShieldCheck,
          type: 'success',
        });
      }
    }

    if (milestonesMet.includes("Debt Free Status Achieved")) {
      const freeMonth = timeline.findIndex((m) => m.debtRemaining === 0);
      if (freeMonth !== -1) {
        const yr = Math.floor(freeMonth / 12) + 1;
        events.push({
          year: yr,
          age: timeline[freeMonth].age,
          title: "Debt Free Celebration!",
          description: "All outstanding consumer loans and debts have been fully paid off. Cash flow is entirely yours.",
          icon: Award,
          type: 'success',
        });
      }
    }

    if (milestonesMet.some(m => m.includes("Financial Freedom"))) {
      // Find where liquid assets >= expenses * 12 * 15
      const freeMonth = timeline.findIndex((m) => (m.investments + m.savings) >= m.expenses * 12 * 15);
      if (freeMonth !== -1) {
        const yr = Math.floor(freeMonth / 12) + 1;
        events.push({
          year: yr,
          age: timeline[freeMonth].age,
          title: "Financial Independence (FIRE) Achieved",
          description: "Your investment portfolio generates enough capital to cover your baseline living expenses indefinitely.",
          icon: Award,
          type: 'success',
        });
      }
    }

    // Sort events by year and priority
    return events.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      const typeWeight = { critical: 4, success: 3, warning: 2, info: 1 };
      return typeWeight[b.type] - typeWeight[a.type];
    });
  };

  const events = getEvents();

  return (
    <div className="relative border-l-2 border-slate-800 ml-4 pl-8 space-y-8 my-4 py-2">
      {events.map((event, idx) => {
        const Icon = event.icon;
        
        let colorClasses = "bg-slate-900 border-slate-700 text-slate-300";
        let glowClasses = "";
        
        if (event.type === 'success') {
          colorClasses = "bg-emerald-950/80 border-emerald-500/50 text-emerald-400";
          glowClasses = "shadow-[0_0_15px_rgba(16,185,129,0.15)]";
        } else if (event.type === 'warning') {
          colorClasses = "bg-amber-950/80 border-amber-500/50 text-amber-400";
          glowClasses = "shadow-[0_0_15px_rgba(245,158,11,0.15)]";
        } else if (event.type === 'critical') {
          colorClasses = "bg-rose-950/80 border-rose-500/50 text-rose-400";
          glowClasses = "shadow-[0_0_15px_rgba(244,63,94,0.15)]";
        } else if (event.type === 'info') {
          colorClasses = "bg-sky-950/80 border-sky-500/50 text-sky-400";
          glowClasses = "shadow-[0_0_15px_rgba(14,165,233,0.15)]";
        }

        return (
          <motion.div
            key={`${event.year}-${idx}`}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            className="relative"
          >
            {/* Timeline Dot Indicator */}
            <span className={`absolute -left-[45px] top-1.5 flex h-8 w-8 items-center justify-center rounded-lg border ${colorClasses} ${glowClasses}`}>
              <Icon className="h-4.5 w-4.5" />
            </span>

            {/* Event Details Card */}
            <div className="glass-card p-5 rounded-xl border border-white/5 bg-[#0b081e]/40">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded">
                  Year {event.year} • Age {event.age}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                  event.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                  event.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                  event.type === 'critical' ? 'bg-rose-500/10 text-rose-400' : 'bg-sky-500/10 text-sky-400'
                }`}>
                  {event.type}
                </span>
              </div>
              <h4 className="text-base font-semibold text-slate-100">{event.title}</h4>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{event.description}</p>
            </div>
          </motion.div>
        );
      })}

      {events.length === 0 && (
        <div className="text-slate-500 text-sm italic py-4">No significant milestones simulated for this path yet. Try enabling more life decisions!</div>
      )}
    </div>
  );
}
