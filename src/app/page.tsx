'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, Sparkles, TrendingUp, Sliders, Zap, MessageSquare, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-16 overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl text-center flex flex-col items-center relative z-10"
      >
        {/* Glow badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-1.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 px-3 py-1 text-xs text-cyber-cyan mb-8"
        >
          <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '3s' }} />
          <span>Futuristic Parallel Future Simulator</span>
        </motion.div>

        {/* Hero title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-cyber-cyan via-white to-cyber-violet bg-clip-text text-transparent"
        >
          Simulate How Life Choices <br />
          Shape Your Financial Future
        </motion.h1>

        {/* Hero description */}
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed"
        >
          LifeSim AI is NOT a budgeting tracker. It is a parallel universe simulator where you test life decisions—buying a luxury car, going for higher studies, launching a startup—and see how they impact your Net Worth, stress, and financial freedom probability over 10 years.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 w-full max-w-sm sm:max-w-none"
        >
          <Link
            href="/dashboard"
            className="glow-btn flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-violet px-6 py-3.5 text-sm font-bold text-slate-950 hover:opacity-90 transition-all w-full sm:w-auto shadow-[0_0_20px_rgba(0,240,255,0.25)]"
          >
            Launch Simulator
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
          <Link
            href="/profile"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all px-6 py-3.5 text-sm font-semibold text-white w-full sm:w-auto"
          >
            Setup Financial Profile
          </Link>
        </motion.div>

        {/* Floating preview cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-8"
        >
          {/* Card 1 */}
          <div className="glass-card p-6 rounded-2xl text-left border border-white/5 bg-[#0a071d]/40 flex flex-col justify-between h-48">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Scenario Builder</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add decisions like starting a business or moving cities. Toggle them on/off to see their compound effects.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6 rounded-2xl text-left border border-white/5 bg-[#0a071d]/40 flex flex-col justify-between h-48">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-violet/10 border border-cyber-violet/30 text-cyber-violet">
              <TrendingUp className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Stochastic Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates net worth curves, stress burnout scales, debt traps, and runs Monte Carlo models for FIRE readiness.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 rounded-2xl text-left border border-white/5 bg-[#0a071d]/40 flex flex-col justify-between h-48">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-pink/10 border border-cyber-pink/30 text-cyber-pink">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">AI Financial Advisor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Consult a specialized virtual planner. Chat about major expenditures, safety metrics, or ask which scenario is safest.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
