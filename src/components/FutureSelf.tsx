'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, Eye, RefreshCw, Milestone } from 'lucide-react';
import { RunResults } from '@/utils/simulation';

interface FutureSelfProps {
  results: RunResults;
  pathName: string;
}

export default function FutureSelf({ results, pathName }: FutureSelfProps) {
  const [revealed, setRevealed] = useState(false);
  const [glitching, setGlitching] = useState(false);

  const finalNW = results.summary.finalNetWorth;
  const avgStress = results.summary.averageStress;
  const finalDebt = results.summary.totalDebt;
  const freedomProb = results.summary.financialFreedomProbability;
  
  const formattedNW = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(finalNW);

  // Generate future letter content based on results
  const getLetterDetails = () => {
    let tone = 'balanced';
    let subject = 'COMMUNICATION LINK: SECURE_YEAR_2036';
    let letter = '';

    if (avgStress >= 70) {
      tone = 'burnout';
      letter = `Hey me. I'm writing this to you from the year 2036, sitting in a dim office after another 14-hour workday. Yes, we did it—we followed the "${pathName}" path. The bank account looks big, and we have the flat in Bangalore, but to be honest? My joints ache, I've had two panic attacks this month, and I barely remember what it feels like to have a weekend off. We traded our health for numbers on a screen. If you're going to keep down this path, please, invest in a therapist early, and learn to say no. The burnout is real.`;
    } else if (finalDebt > finalNW * 0.5) {
      tone = 'debt';
      letter = `Hey. So, we went ahead with the "${pathName}" plan. I'm writing to you from 2036, and I need to be real: we are stressed. That upfront debt and those monthly EMIs have kept us in a chokehold for a decade. Every time we got a raise, it went straight to paying interest. We can't quit our job because the debt trap is too tight. We have virtually no emergency safety net left. I don't hate you for buying those things or taking those loans, but man, I wish you had calculated the true cost of interest compounding against us.`;
    } else if (freedomProb >= 70 || (finalNW > 5000000 && avgStress < 45)) {
      tone = 'freedom';
      letter = `Dear Younger Me. I am typing this to you from a beach in South Goa, on a Tuesday morning at 10 AM. Yes, we chose the "${pathName}" path and it actually worked! We hit financial independence. Today, our assets generate more monthly cash flow than we could ever spend. Thank you so much for staying frugal, side-hustling, and investing those extra Rupees when everyone else was buying brand-new cars. The compound interest worked its magic. We are officially free. You made this happen.`;
    } else {
      tone = 'balanced';
      letter = `Hey there! It's me from 2036. We chose the "${pathName}" path. I wanted to let you know that we are doing alright. Life is stable—we have a decent apartment, we pay our bills on time, and we take a nice holiday once a year. Our net worth stands at ${formattedNW}. It's a peaceful, middle-of-the-road life. There are no major crises, but there are no early retirements either. Sometimes I wonder: what if we had taken that big leap? What if we had started that startup or invested just a bit more aggressively? You're at the fork in the road right now. It's up to you.`;
    }

    return { tone, subject, letter };
  };

  const { tone, subject, letter } = getLetterDetails();

  const handleReveal = () => {
    setGlitching(true);
    setTimeout(() => {
      setGlitching(false);
      setRevealed(true);
    }, 800);
  };

  return (
    <div className="relative rounded-2xl glass-card border border-white/5 bg-[#0a071c]/50 p-6 overflow-hidden">
      {/* Monospace terminal grid header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <Terminal className="h-4.5 w-4.5 text-cyber-cyan animate-pulse" />
          <span className="text-xs font-mono tracking-widest text-slate-300">FUTURE_SELF_COMMS.EXE</span>
        </div>
        <span className="text-[10px] font-mono text-cyber-cyan">STABLE CONNECTION</span>
      </div>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-cyber-violet/20 blur-xl rounded-full"></div>
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyber-violet/50 bg-[#0f092b] text-cyber-violet">
                <Milestone className="h-8 w-8 animate-bounce" />
              </div>
            </div>
            
            <h4 className="text-lg font-bold text-slate-200 mb-2">Message Received from Year 2036</h4>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              A simulation-based neural projection has generated a message from your future self based on the <span className="text-cyber-cyan font-semibold">{pathName}</span> path.
            </p>

            <button
              onClick={handleReveal}
              disabled={glitching}
              className="glow-btn flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyber-cyan to-cyber-violet px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              {glitching ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Decrypting Neural Link...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Decrypt Transmission
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            {/* Sci-fi Overlay Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,35,0)_95%,rgba(0,240,255,0.05)_95%)] bg-[length:100%_4px] pointer-events-none rounded-lg opacity-40"></div>

            <div className="rounded-lg bg-slate-950/70 p-4 border border-white/5 font-mono text-xs text-slate-300 leading-relaxed mb-4 relative">
              <div className="flex items-center justify-between text-[9px] text-slate-500 mb-3 border-b border-white/5 pb-2">
                <span>SENDER: SELF_SYS_PROJ_34</span>
                <span>DESTINATION: SELF_BASE_24</span>
              </div>
              <p className="whitespace-pre-line text-emerald-400/90 font-mono tracking-wide selection:bg-emerald-500/20">
                {letter}
              </p>
            </div>

            <div className="flex justify-between items-center mt-6">
              <div className="flex gap-2">
                <span className={`text-[9px] uppercase px-2 py-0.5 rounded border ${
                  tone === 'freedom' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' :
                  tone === 'burnout' ? 'bg-rose-950/40 border-rose-500/30 text-rose-400' :
                  tone === 'debt' ? 'bg-amber-950/40 border-amber-500/30 text-amber-400' :
                  'bg-slate-900 border-slate-700 text-slate-400'
                }`}>
                  Tone: {tone}
                </span>
                <span className="text-[9px] uppercase bg-slate-900 border border-slate-800 text-slate-500 px-2 py-0.5 rounded">
                  Calculated Net Worth: {formattedNW}
                </span>
              </div>

              <button
                onClick={() => setRevealed(false)}
                className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Reset link
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
