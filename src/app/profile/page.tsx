'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import { UserProfile, Debt } from '@/utils/simulation';
import { Plus, Trash2, Save, RotateCcw, AlertCircle, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProfilePage() {
  const { profile, updateProfile, resetAll } = useAppContext();
  const [localProfile, setLocalProfile] = useState<UserProfile>({ ...profile });
  const [successMsg, setSuccessMsg] = useState(false);

  // Temp state for adding a debt
  const [newDebt, setNewDebt] = useState<Omit<Debt, 'id'>>({
    name: '',
    amount: 0,
    interestRate: 0.08,
    monthlyPayment: 0,
  });

  // Temp state for adding a goal
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: 0,
    targetAge: 30,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Parse numeric fields
    const numericFields = ['age', 'monthlyIncome', 'monthlyExpenses', 'savings', 'investmentPerMonth', 'expectedSalaryGrowth'];
    const parsedValue = numericFields.includes(name) ? parseFloat(value) || 0 : value;

    setLocalProfile((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleAddDebt = () => {
    if (!newDebt.name) return;
    const debtToAdd: Debt = {
      id: `debt-${Date.now()}`,
      name: newDebt.name,
      amount: newDebt.amount,
      interestRate: newDebt.interestRate,
      monthlyPayment: newDebt.monthlyPayment || Math.round(newDebt.amount / 36), // default to 3-year term estimate
    };

    setLocalProfile((prev) => ({
      ...prev,
      debts: [...prev.debts, debtToAdd],
    }));

    setNewDebt({ name: '', amount: 0, interestRate: 0.08, monthlyPayment: 0 });
  };

  const handleRemoveDebt = (id: string) => {
    setLocalProfile((prev) => ({
      ...prev,
      debts: prev.debts.filter((d) => d.id !== id),
    }));
  };

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetAge) return;
    const goalToAdd = {
      id: `goal-${Date.now()}`,
      name: newGoal.name,
      targetAmount: newGoal.targetAmount,
      targetAge: newGoal.targetAge,
    };

    setLocalProfile((prev) => ({
      ...prev,
      majorGoals: [...prev.majorGoals, goalToAdd],
    }));

    setNewGoal({ name: '', targetAmount: 0, targetAge: localProfile.age + 5 });
  };

  const handleRemoveGoal = (id: string) => {
    setLocalProfile((prev) => ({
      ...prev,
      majorGoals: prev.majorGoals.filter((g) => g.id !== id),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(localProfile);
    setSuccessMsg(true);
    
    // Fire celebration confetti!
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#00f0ff', '#8b5cf6', '#d946ef'],
    });

    setTimeout(() => {
      setSuccessMsg(false);
    }, 3000);
  };

  const handleReset = () => {
    if (confirm("Reset financial profile to system defaults? Any custom scenarios will also be restored.")) {
      resetAll();
      // Re-trigger load
      window.location.reload();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-cyber-cyan to-cyber-violet bg-clip-text text-transparent">
            Financial Profile Configurator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Define your starting state. The simulation engine uses these variables to run your default projections.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Financials Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#0a071c]/45">
            <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 rounded bg-cyber-cyan"></span>
              Core Inputs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Age */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-400 mb-1.5 font-mono uppercase tracking-wider">Current Age</label>
                <input
                  type="number"
                  name="age"
                  value={localProfile.age}
                  onChange={handleInputChange}
                  min={18}
                  max={80}
                  className="cyber-input"
                  required
                />
              </div>

              {/* City */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-400 mb-1.5 font-mono uppercase tracking-wider">City of Residence</label>
                <input
                  type="text"
                  name="city"
                  value={localProfile.city}
                  onChange={handleInputChange}
                  className="cyber-input"
                  required
                />
              </div>

              {/* Income */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-400 mb-1.5 font-mono uppercase tracking-wider">Monthly Base Income (₹)</label>
                <input
                  type="number"
                  name="monthlyIncome"
                  value={localProfile.monthlyIncome}
                  onChange={handleInputChange}
                  min={0}
                  className="cyber-input"
                  required
                />
              </div>

              {/* Expenses */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-400 mb-1.5 font-mono uppercase tracking-wider">Monthly Base Expenses (₹)</label>
                <input
                  type="number"
                  name="monthlyExpenses"
                  value={localProfile.monthlyExpenses}
                  onChange={handleInputChange}
                  min={0}
                  className="cyber-input"
                  required
                />
              </div>

              {/* Liquid Savings */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-400 mb-1.5 font-mono uppercase tracking-wider">Liquid Savings / Cash (₹)</label>
                <input
                  type="number"
                  name="savings"
                  value={localProfile.savings}
                  onChange={handleInputChange}
                  min={0}
                  className="cyber-input"
                  required
                />
              </div>

              {/* Investment Amount */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-400 mb-1.5 font-mono uppercase tracking-wider">Monthly Investment (₹)</label>
                <input
                  type="number"
                  name="investmentPerMonth"
                  value={localProfile.investmentPerMonth}
                  onChange={handleInputChange}
                  min={0}
                  className="cyber-input"
                  required
                />
              </div>

              {/* Career Field */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-400 mb-1.5 font-mono uppercase tracking-wider">Career Field</label>
                <input
                  type="text"
                  name="careerField"
                  value={localProfile.careerField}
                  onChange={handleInputChange}
                  className="cyber-input"
                  required
                />
              </div>

              {/* Expected Growth */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-400 mb-1.5 font-mono uppercase tracking-wider">Expected Annual Salary Growth (%)</label>
                <input
                  type="number"
                  name="expectedSalaryGrowth"
                  value={localProfile.expectedSalaryGrowth}
                  onChange={handleInputChange}
                  min={0}
                  max={100}
                  step={0.5}
                  className="cyber-input"
                  required
                />
              </div>

              {/* Risk Appetite */}
              <div className="flex flex-col sm:col-span-2">
                <label className="text-xs font-medium text-slate-400 mb-1.5 font-mono uppercase tracking-wider">Investment Risk Appetite</label>
                <select
                  name="riskAppetite"
                  value={localProfile.riskAppetite}
                  onChange={handleInputChange}
                  className="cyber-input"
                >
                  <option value="low">Low (Conservative: 6% average portfolio return)</option>
                  <option value="medium">Medium (Moderate: 9% average portfolio return)</option>
                  <option value="high">High (Aggressive: 12% average portfolio return)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dynamic Debts Section */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#0a071c]/45">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 rounded bg-cyber-pink"></span>
              Current Debts & Obligations
            </h3>
            
            {localProfile.debts.length > 0 ? (
              <div className="space-y-3 mb-6">
                {localProfile.debts.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-white/3 border border-white/5">
                    <div>
                      <p className="text-sm font-bold text-slate-200">{d.name}</p>
                      <p className="text-xs text-slate-400 font-mono">
                        Outstanding: ₹{d.amount.toLocaleString('en-IN')} • Interest: {(d.interestRate * 100).toFixed(1)}% • EMI: ₹{d.monthlyPayment}/mo
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDebt(d.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-slate-500 mb-6">No active debt obligations. Excellent!</p>
            )}

            {/* Add Debt Inline Form */}
            <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1 block uppercase">Debt Name</label>
                <input
                  type="text"
                  placeholder="e.g. Home Loan"
                  value={newDebt.name}
                  onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                  className="cyber-input py-1 text-xs w-full"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1 block uppercase">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="₹ Remaining"
                  value={newDebt.amount || ''}
                  onChange={(e) => setNewDebt({ ...newDebt, amount: parseFloat(e.target.value) || 0 })}
                  className="cyber-input py-1 text-xs w-full"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1 block uppercase">Interest Rate</label>
                <input
                  type="number"
                  placeholder="e.g. 0.085"
                  step="0.001"
                  value={newDebt.interestRate || ''}
                  onChange={(e) => setNewDebt({ ...newDebt, interestRate: parseFloat(e.target.value) || 0 })}
                  className="cyber-input py-1 text-xs w-full"
                />
              </div>
              <button
                type="button"
                onClick={handleAddDebt}
                className="w-full py-2 bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Debt
              </button>
            </div>
          </div>
        </div>

        {/* Goals & Actions Column */}
        <div className="space-y-6">
          {/* Dynamic Goals Section */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#0a071c]/45">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 rounded bg-cyber-violet"></span>
              Future Milestones / Goals
            </h3>

            {localProfile.majorGoals.length > 0 ? (
              <div className="space-y-3 mb-6">
                {localProfile.majorGoals.map((g) => (
                  <div key={g.id} className="flex items-center justify-between p-3 rounded-lg bg-white/3 border border-white/5">
                    <div>
                      <p className="text-sm font-bold text-slate-200">{g.name}</p>
                      <p className="text-xs text-slate-400 font-mono">
                        Target: ₹{g.targetAmount.toLocaleString('en-IN')} • Target Age: {g.targetAge}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(g.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-slate-500 mb-6">No major financial goals added yet.</p>
            )}

            {/* Add Goal Form */}
            <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40 space-y-4">
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1 block uppercase">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Higher Studies"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="cyber-input py-1 text-xs w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-slate-500 mb-1 block uppercase">Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="₹ Target"
                    value={newGoal.targetAmount || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) || 0 })}
                    className="cyber-input py-1 text-xs w-full"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-500 mb-1 block uppercase">Target Age</label>
                  <input
                    type="number"
                    placeholder="Age"
                    value={newGoal.targetAge || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAge: parseInt(e.target.value) || 0 })}
                    className="cyber-input py-1 text-xs w-full"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddGoal}
                className="w-full py-2 bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Goal
              </button>
            </div>
          </div>

          {/* Form Actions Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-[#0a071c]/45 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-slate-200 mb-1">Apply Changes</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Saving your changes will recalculate all parallel projections and restart the simulation curves.
            </p>
            
            {successMsg && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0 animate-bounce" />
                <span>Configuration successfully synchronized! Recalculating timelines...</span>
              </div>
            )}

            <button
              type="submit"
              className="glow-btn w-full py-3 bg-gradient-to-r from-cyber-cyan to-cyber-violet hover:opacity-90 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              <Save className="h-4 w-4" />
              Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
