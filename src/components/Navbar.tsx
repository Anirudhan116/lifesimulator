'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, BarChart3, Sliders, Split, MessageSquare, FileText, UserCircle, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // If on landing page, we might want a slightly transparent style.
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: UserCircle },
    { name: 'Scenarios', path: '/scenarios', icon: Sliders },
    { name: 'Compare Paths', path: '/compare', icon: Split },
    { name: 'AI Advisor', path: '/advisor', icon: MessageSquare },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#030014]/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-violet p-[1px] transition-transform duration-300 group-hover:scale-105">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#080614]">
                  <Compass className="h-5 w-5 text-cyber-cyan animate-pulse" />
                </div>
              </div>
              <div>
                <span className="bg-gradient-to-r from-cyber-cyan via-white to-cyber-violet bg-clip-text text-lg font-bold tracking-wider text-transparent group-hover:text-cyber-cyan transition-colors">
                  LifeSim AI
                </span>
                <span className="ml-1 text-[9px] uppercase tracking-widest text-cyber-cyan border border-cyber-cyan/30 px-1 py-0.2 rounded font-mono">
                  Beta
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:block">
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="relative px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'text-cyber-cyan' : 'text-slate-400 hover:text-white'}`}>
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 rounded-lg bg-white/5 border border-white/5"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User profile icon / status */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-slate-900/60 border border-white/5 px-3 py-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-400 font-mono">Local Sandbox</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-white/5 bg-[#030014]/95 backdrop-blur-2xl"
          >
            <div className="space-y-1 px-2 pb-4 pt-2">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-cyber-cyan/10 text-cyber-cyan border-l-2 border-cyber-cyan'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="flex items-center gap-2 px-3 py-3 border-t border-white/5 mt-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-400 font-mono text-xs">Local Sandbox Mode</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
