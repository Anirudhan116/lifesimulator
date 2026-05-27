'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, MessageSquare, Terminal, Key, ShieldCheck, HelpCircle, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AdvisorPage() {
  const { profile, scenarios, isLoading } = useAppContext();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your LifeSim AI Financial Advisor. I have synchronized your current profile variables and simulation calculations.
      
      I can help you evaluate critical financial decisions and trade-offs. Ask me anything, or try clicking one of the quick scenarios below!`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [userApiKey, setUserApiKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Load user API key if saved in session
  useEffect(() => {
    const savedKey = localStorage.getItem('lifesim_user_api_key');
    if (savedKey) setUserApiKey(savedKey);
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem('lifesim_user_api_key', userApiKey);
    setShowKeyModal(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || sending) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          profile,
          scenarios,
          userApiKey
        })
      });

      const data = await response.json();
      
      if (response.ok && data.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        setMessages((prev) => [
          ...prev, 
          { 
            role: 'assistant', 
            content: `Advisor connection error: ${data.error || 'Server returned an invalid response.'}` 
          }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev, 
        { 
          role: 'assistant', 
          content: "Sorry, I had trouble reaching the AI coordinator. Please check your internet connection and try again." 
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  // Preset query list
  const quickPrompts = [
    "Can I afford a ₹1.5L laptop?",
    "Should I take an education loan?",
    "What if I invest ₹5000 per month?",
    "Which scenario is safest?",
    "Which scenario gives highest growth?"
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col relative z-10">
      
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-violet p-[1px]">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#080614] text-cyber-cyan">
              <MessageSquare className="h-5 w-5 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-cyber-cyan to-cyber-violet bg-clip-text text-transparent">
              AI Advisor Chat
            </h1>
            <p className="text-xs text-slate-400">
              Interactive financial planning consult synchronized to your simulation curves.
            </p>
          </div>
        </div>

        {/* API Key Configure Button */}
        <button
          onClick={() => setShowKeyModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
            userApiKey 
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' 
              : 'border-white/15 bg-white/5 text-slate-300 hover:text-white'
          }`}
        >
          <Key className="h-3.5 w-3.5" />
          {userApiKey ? 'AI Key Linked' : 'Link API Key'}
        </button>
      </div>

      {/* API Key Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-w-md w-full p-6 rounded-2xl border border-white/10 bg-[#0d0a27] space-y-4"
            >
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Key className="h-5 w-5 text-cyber-cyan" />
                Configure Custom API Key
              </h3>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                By default, LifeSim AI uses a simulation-aware local parser. If you want to use true generative LLM brains, paste your Gemini API Key (begins with <code className="bg-slate-900 px-1 py-0.5 rounded text-cyber-cyan font-mono">AIzaSy</code>) or OpenAI API Key.
              </p>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">API Key String</label>
                <input
                  type="password"
                  placeholder="Paste OpenAI or Gemini API Key"
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                  className="cyber-input text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 border border-white/5 text-slate-400 text-xs font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveKey}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyber-cyan to-cyber-violet text-slate-950 text-xs font-bold hover:opacity-90 shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                >
                  Link Key
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Chat Box Container */}
      <div className="flex-1 min-h-[350px] rounded-2xl border border-white/5 bg-[#0b0821]/45 flex flex-col overflow-hidden relative">
        {/* Holographic overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.005)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {/* Scrollable messages area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[calc(100vh-22rem)]">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-cyber-cyan/15 border border-cyber-cyan/25 text-slate-100 rounded-tr-none'
                    : 'bg-slate-950/60 border border-white/5 text-slate-300 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {sending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-slate-950/60 border border-white/5 rounded-xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2 text-slate-500 font-mono">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-cyber-cyan" />
                <span>Advisor formulating calculations...</span>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        {messages.length === 1 && !sending && (
          <div className="px-4 pb-4 sm:px-6">
            <span className="text-[9px] font-mono text-slate-500 uppercase block mb-2 tracking-wider">Suggested Queries</span>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[10px] text-slate-400 bg-slate-950/60 border border-white/5 rounded-lg px-2.5 py-1.5 hover:border-cyber-cyan/45 hover:text-slate-200 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat input box */}
        <div className="p-3 border-t border-white/5 bg-slate-950/60 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI Advisor about a purchase, scenario, or FIRE probability..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
            disabled={sending}
            className="flex-1 bg-transparent border-0 outline-none text-xs text-slate-200 px-3 placeholder-slate-500 focus:ring-0 focus:outline-none"
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={sending || !inputValue.trim()}
            className="h-8 w-8 rounded-lg bg-gradient-to-r from-cyber-cyan to-cyber-violet flex items-center justify-center text-slate-950 hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
