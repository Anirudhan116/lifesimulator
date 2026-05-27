export interface Debt {
  id: string;
  name: string;
  amount: number;
  interestRate: number; // Annual interest rate, e.g., 0.12 for 12%
  monthlyPayment: number;
}

export interface UserProfile {
  age: number;
  city: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  debts: Debt[];
  investmentPerMonth: number;
  careerField: string;
  expectedSalaryGrowth: number; // Annual rate, e.g., 8 for 8%
  riskAppetite: 'low' | 'medium' | 'high';
  majorGoals: { id: string; name: string; targetAmount: number; targetAge: number }[];
}

export interface Scenario {
  id: string;
  name: string;
  category: 'job' | 'relocation' | 'purchase' | 'debt' | 'education' | 'freelance' | 'startup' | 'investment' | 'expense_reduction';
  isEnabled: boolean;
  variables: {
    upfrontCost: number;
    monthlyCost: number;
    monthlyCostDuration: number; // in months, -1 for infinite/continuous
    expectedIncomeChange: number; // relative monthly change
    expectedIncomeChangeDelay: number; // months before change starts
    riskLevel: 'low' | 'medium' | 'high';
    timeDuration: number; // in years (how long the decision affects)
    stressImpact: number; // -100 to 100
    growthPotential: number; // 0 to 100
    debtPrincipal?: number; // if scenario creates new debt
    debtInterest?: number;
    debtTerm?: number; // in months
  };
}

export interface MonthData {
  month: number;
  age: number;
  income: number;
  expenses: number;
  cashFlow: number;
  savings: number;
  investments: number;
  debtRemaining: number;
  netWorth: number;
  stressScore: number;
  burnoutRisk: number;
}

export interface RunResults {
  timeline: MonthData[];
  metricsByYear: {
    [year: number]: {
      netWorth: number;
      savings: number;
      investments: number;
      debtRemaining: number;
      monthlyCashFlow: number;
      stressScore: number;
      burnoutRisk: number;
      freedomProbability: number;
      debtTrapRisk: number;
      lifestyleInflationRisk: number;
      emergencyFundScore: number; // months of expenses covered
    };
  };
  summary: {
    finalNetWorth: number;
    totalInvestments: number;
    totalDebt: number;
    averageStress: number;
    burnoutRiskCategory: 'low' | 'medium' | 'high';
    debtTrapLikelihood: number; // 0 to 100
    financialFreedomProbability: number; // 0 to 100
    bestCaseNetWorth: number;
    worstCaseNetWorth: number;
    milestonesMet: string[];
  };
}

// Generate random number with normal distribution (Box-Muller transform)
function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
  return mean + stdDev * randStdNormal;
}

export function runSimulation(
  profile: UserProfile,
  scenarios: Scenario[],
  maxYears: number = 10,
  probabilisticRuns: number = 40
): RunResults {
  const activeScenarios = scenarios.filter((s) => s.isEnabled);
  const months = maxYears * 12;

  // Let's run a single deterministic run first to get the main timeline data.
  const deterministicTimeline = runSingleSimulation(profile, activeScenarios, months, false, 0);

  // Run probabilistic runs for Monte Carlo results
  const allRuns: MonthData[][] = [];
  for (let run = 0; run < probabilisticRuns; run++) {
    allRuns.push(runSingleSimulation(profile, activeScenarios, months, true, run));
  }

  // Aggregate metrics by year (1, 3, 5, 10)
  const yearsToTrack = [1, 3, 5, 10].filter((y) => y <= maxYears);
  const metricsByYear: RunResults['metricsByYear'] = {};

  yearsToTrack.forEach((year) => {
    const monthIndex = year * 12 - 1;
    
    // Get deterministic metrics at this year
    const detMonth = deterministicTimeline[monthIndex] || deterministicTimeline[deterministicTimeline.length - 1];

    // Gather Monte Carlo values for this month index
    const runMonths = allRuns.map((run) => run[monthIndex] || run[run.length - 1]);
    const netWorths = runMonths.map((m) => m.netWorth);
    const savingsList = runMonths.map((m) => m.savings);
    const debtsList = runMonths.map((m) => m.debtRemaining);
    const cashFlows = runMonths.map((m) => m.cashFlow);
    const stressScores = runMonths.map((m) => m.stressScore);

    // Calculate probabilities
    // Financial Freedom: net worth and investments can cover expenses for 15+ years
    // We assume expense level at the target year * 12 * 15
    const annualExpenses = detMonth.expenses * 12;
    const freedomThreshold = annualExpenses * 15;
    const freedomCount = runMonths.filter((m) => (m.investments + m.savings) >= freedomThreshold).length;
    const freedomProbability = Math.round((freedomCount / probabilisticRuns) * 100);

    // Debt Trap Risk: proportion of runs where savings fell to 0 (emergency debt triggered)
    // We can evaluate if during the first `year` years, the savings ever hit 0 in that run.
    let debtTrapCount = 0;
    for (let r = 0; r < probabilisticRuns; r++) {
      const runTimeline = allRuns[r];
      let hitZero = false;
      for (let m = 0; m <= monthIndex; m++) {
        if (runTimeline[m] && runTimeline[m].savings <= 0 && runTimeline[m].debtRemaining > detMonth.debtRemaining * 1.5) {
          hitZero = true;
          break;
        }
      }
      if (hitZero) debtTrapCount++;
    }
    const debtTrapRisk = Math.round((debtTrapCount / probabilisticRuns) * 100);

    // Lifestyle Inflation Risk: increases if expenses grow faster than base rate + inflation,
    // caused by upgrading lifestyle when salary grows.
    const initialExpenses = profile.monthlyExpenses;
    const inflationAdjustedInitialExpenses = initialExpenses * Math.pow(1.05, year);
    const lifestyleInflationRisk = detMonth.expenses > inflationAdjustedInitialExpenses * 1.15 ? 70 : 25;

    // Emergency fund score: savings / monthly expenses
    const emergencyFundScore = detMonth.expenses > 0 ? parseFloat((detMonth.savings / detMonth.expenses).toFixed(1)) : 10;

    // Burnout risk is the average burnout probability
    const avgBurnout = runMonths.reduce((sum, m) => sum + m.burnoutRisk, 0) / probabilisticRuns;

    metricsByYear[year] = {
      netWorth: Math.round(detMonth.netWorth),
      savings: Math.round(detMonth.savings),
      investments: Math.round(detMonth.investments),
      debtRemaining: Math.round(detMonth.debtRemaining),
      monthlyCashFlow: Math.round(detMonth.cashFlow),
      stressScore: Math.round(detMonth.stressScore),
      burnoutRisk: Math.round(avgBurnout * 100),
      freedomProbability,
      debtTrapRisk,
      lifestyleInflationRisk,
      emergencyFundScore,
    };
  });

  // Calculate final summary statistics at maxYears
  const finalMonthIndex = months - 1;
  const mcFinals = allRuns.map((run) => run[finalMonthIndex] || run[run.length - 1]);
  const sortedNetWorths = mcFinals.map((m) => m.netWorth).sort((a, b) => a - b);
  
  const bestCaseNetWorth = Math.round(sortedNetWorths[Math.floor(sortedNetWorths.length * 0.95)] || sortedNetWorths[sortedNetWorths.length - 1]);
  const worstCaseNetWorth = Math.round(sortedNetWorths[Math.floor(sortedNetWorths.length * 0.05)] || sortedNetWorths[0]);

  const averageStress = Math.round(deterministicTimeline.reduce((sum, m) => sum + m.stressScore, 0) / months);
  const avgBurnoutFinal = mcFinals.reduce((sum, m) => sum + m.burnoutRisk, 0) / probabilisticRuns;
  
  let burnoutRiskCategory: 'low' | 'medium' | 'high' = 'low';
  if (avgBurnoutFinal > 0.6) burnoutRiskCategory = 'high';
  else if (avgBurnoutFinal > 0.3) burnoutRiskCategory = 'medium';

  // Evaluate milestones met
  const milestonesMet: string[] = [];
  const finalDet = deterministicTimeline[finalMonthIndex];
  
  profile.majorGoals.forEach((goal) => {
    // Check if user has met the goal target before or at target age
    const targetMonths = (goal.targetAge - profile.age) * 12;
    if (targetMonths > 0 && targetMonths <= months) {
      const stateAtTarget = deterministicTimeline[targetMonths - 1] || finalDet;
      if (stateAtTarget.netWorth >= goal.targetAmount) {
        milestonesMet.push(goal.name);
      }
    } else if (targetMonths <= 0) {
      if (profile.savings >= goal.targetAmount) {
        milestonesMet.push(goal.name);
      }
    } else {
      // Goal is beyond simulation window, check if current trajectory allows it
      const currentGrowthRate = (finalDet.netWorth - profile.savings) / months;
      const projectNetWorthAtGoal = finalDet.netWorth + currentGrowthRate * (targetMonths - months);
      if (projectNetWorthAtGoal >= goal.targetAmount) {
        milestonesMet.push(`${goal.name} (On Track)`);
      }
    }
  });

  // Emergency Fund Milestone
  if (finalDet.savings >= finalDet.expenses * 6) {
    milestonesMet.push("6-Month Emergency Fund Built");
  }

  // Debt Free Milestone
  if (finalDet.debtRemaining === 0 && profile.debts.length > 0) {
    milestonesMet.push("Debt Free Status Achieved");
  }

  // Financial Independence Milestone
  const finalYearMetrics = metricsByYear[maxYears] || metricsByYear[10];
  if (finalYearMetrics && finalYearMetrics.freedomProbability >= 70) {
    milestonesMet.push("Financial Freedom Target Achieved");
  }

  return {
    timeline: deterministicTimeline,
    metricsByYear,
    summary: {
      finalNetWorth: Math.round(finalDet.netWorth),
      totalInvestments: Math.round(finalDet.investments),
      totalDebt: Math.round(finalDet.debtRemaining),
      averageStress,
      burnoutRiskCategory,
      debtTrapLikelihood: metricsByYear[maxYears]?.debtTrapRisk || 0,
      financialFreedomProbability: metricsByYear[maxYears]?.freedomProbability || 0,
      bestCaseNetWorth,
      worstCaseNetWorth,
      milestonesMet,
    },
  };
}

function runSingleSimulation(
  profile: UserProfile,
  activeScenarios: Scenario[],
  totalMonths: number,
  isProbabilistic: boolean,
  runSeed: number
): MonthData[] {
  const timeline: MonthData[] = [];
  
  // Local copies of state
  let currentSavings = profile.savings;
  let currentInvestments = 0;
  let currentSalary = profile.monthlyIncome;
  let currentBaseExpenses = profile.monthlyExpenses;
  
  // Clone debts list
  const currentDebts = profile.debts.map((d) => ({ ...d }));

  // Scenarios added debts
  activeScenarios.forEach((sc) => {
    if (sc.variables.debtPrincipal && sc.variables.debtPrincipal > 0) {
      currentDebts.push({
        id: `sc-debt-${sc.id}`,
        name: `${sc.name} Loan`,
        amount: sc.variables.debtPrincipal,
        interestRate: sc.variables.debtInterest || 0.08,
        monthlyPayment: Math.round(
          (sc.variables.debtPrincipal * (sc.variables.debtInterest || 0.08) / 12) /
          (1 - Math.pow(1 + (sc.variables.debtInterest || 0.08) / 12, -(sc.variables.debtTerm || 60)))
        ) || Math.round(sc.variables.debtPrincipal / (sc.variables.debtTerm || 60)),
      });
      // The upfront cost of a debt scenario might represent downpayment
      currentSavings -= sc.variables.upfrontCost || 0;
    } else {
      // General upfront costs deducted immediately in month 1
      currentSavings -= sc.variables.upfrontCost || 0;
    }
  });

  // Ensure savings don't go negative on day 1 from upfront costs
  let emergencyDebt = 0;
  if (currentSavings < 0) {
    emergencyDebt = -currentSavings;
    currentSavings = 0;
  }

  // Base Stress calculation
  const getBaseStress = () => {
    let stress = 30; // base standard stress
    if (profile.riskAppetite === 'high') stress -= 10;
    if (profile.riskAppetite === 'low') stress += 10;
    
    // stress increases if debts are large relative to income
    const totalDebt = currentDebts.reduce((sum, d) => sum + d.amount, 0) + emergencyDebt;
    const debtRatio = profile.monthlyIncome > 0 ? totalDebt / (profile.monthlyIncome * 12) : 1;
    stress += Math.min(debtRatio * 20, 30);
    
    return Math.max(10, Math.min(90, stress));
  };

  for (let m = 1; m <= totalMonths; m++) {
    const currentAge = profile.age + Math.floor(m / 12);
    
    // Annual compounding inflation (5%) and salary raises (every 12 months)
    if (m > 1 && m % 12 === 1) {
      currentBaseExpenses *= 1.05; // 5% inflation
      
      // Calculate active salary multiplier
      let salaryGrowthModifier = 1;
      activeScenarios.forEach((sc) => {
        if (sc.category === 'job' && m >= (sc.variables.expectedIncomeChangeDelay || 0)) {
          salaryGrowthModifier += (sc.variables.growthPotential / 100) * 0.05; 
        }
      });

      // Apply base salary growth
      currentSalary *= (1 + (profile.expectedSalaryGrowth / 100) * salaryGrowthModifier);
    }

    // Process scenarios active in this month
    let extraIncome = 0;
    let extraExpenses = 0;
    let scenarioStress = 0;
    let investmentRateBump = 0;
    let monthlyInvestmentAddition = 0;

    activeScenarios.forEach((sc) => {
      // Check if within active time window
      const durationMonths = sc.variables.timeDuration * 12;
      const isCurrentlyActive = durationMonths === -1 || m <= durationMonths;

      if (isCurrentlyActive) {
        // Income change
        if (m >= (sc.variables.expectedIncomeChangeDelay || 0)) {
          extraIncome += sc.variables.expectedIncomeChange;
        }

        // Monthly cost duration check
        if (sc.variables.monthlyCostDuration === -1 || m <= sc.variables.monthlyCostDuration) {
          extraExpenses += sc.variables.monthlyCost;
        }

        // Stress impact
        scenarioStress += sc.variables.stressImpact;

        // Investment impacts
        if (sc.category === 'investment') {
          // Boost stock returns
          investmentRateBump += (sc.variables.growthPotential / 100) * 0.04; // up to 4% boost
          monthlyInvestmentAddition += sc.variables.monthlyCost; // diverted to investments
        }
      }
    });

    const totalIncome = currentSalary + extraIncome;
    const totalExpenses = currentBaseExpenses + extraExpenses;

    // Calculate Stress Score for this month
    let monthlyStress = getBaseStress() + scenarioStress;
    
    // Add stress if savings are low (less than 3 months of expenses)
    if (currentSavings < totalExpenses * 3) {
      monthlyStress += 15;
    }
    // Add stress if cash flow is negative
    const baseCashFlow = totalIncome - totalExpenses;
    if (baseCashFlow < 0) {
      monthlyStress += 10;
    }
    monthlyStress = Math.max(5, Math.min(100, monthlyStress));

    // Calculate monthly burnout risk (compounding probability if stress is consistently high)
    let burnoutRisk = 0;
    if (monthlyStress > 85) {
      burnoutRisk = 0.85;
    } else if (monthlyStress > 70) {
      burnoutRisk = 0.45;
    } else if (monthlyStress > 50) {
      burnoutRisk = 0.15;
    } else {
      burnoutRisk = 0.02;
    }

    // Stochastic random events in probabilistic mode
    let randomIncomeShock = 0;
    let randomExpenseShock = 0;
    let marketReturnModifier = 0;

    if (isProbabilistic) {
      // Random Emergency Expense (1% chance per month, e.g., health, travel, repairs)
      if (Math.random() < 0.012) {
        // cost: 1.5x to 4x of monthly expenses
        randomExpenseShock = totalExpenses * (1.5 + Math.random() * 2.5);
      }
      
      // Job Gap / Income Interruption (0.5% chance per month if in medium/high risk career/scenarios)
      // Low risk = 0.2%, High risk / startups = 2%
      let layoffChance = 0.005;
      if (profile.riskAppetite === 'high' || activeScenarios.some(sc => sc.category === 'startup')) {
        layoffChance = 0.015;
      }
      if (Math.random() < layoffChance) {
        randomIncomeShock = -totalIncome * 0.8; // Lose 80% of income for this month
        monthlyStress += 30; // Spikes stress
      }

      // Stock market return variance
      // Modifies monthly yield using random distribution
      marketReturnModifier = randomNormal(0, 0.015); // standard deviation of monthly return
    }

    // Process Debts
    let totalDebtPayments = 0;
    currentDebts.forEach((debt) => {
      if (debt.amount > 0) {
        // Compound interest: Add monthly interest
        const monthlyInterest = debt.amount * (debt.interestRate / 12);
        debt.amount += monthlyInterest;

        // Apply payment
        const payment = Math.min(debt.amount, debt.monthlyPayment);
        debt.amount -= payment;
        totalDebtPayments += payment;
      }
    });

    // Emergency high-interest debt compounds
    if (emergencyDebt > 0) {
      const emergencyInterestRate = 0.24; // 24% annual interest rate
      emergencyDebt += emergencyDebt * (emergencyInterestRate / 12);
      
      // Pay down emergency debt aggressively from positive cash flow
      const possibleRepayment = Math.max(0, baseCashFlow - totalDebtPayments);
      const repayment = Math.min(emergencyDebt, possibleRepayment * 0.7); // allocate 70% of cash flow surplus
      emergencyDebt -= repayment;
      totalDebtPayments += repayment;
    }

    // Net Monthly Cash Flow
    const finalExpenses = totalExpenses + totalDebtPayments + randomExpenseShock;
    const finalIncome = totalIncome + randomIncomeShock;
    const netCashFlow = finalIncome - finalExpenses;

    // Apply net cash flow to savings
    if (netCashFlow >= 0) {
      // Allocate surplus to savings
      currentSavings += netCashFlow;

      // Handle monthly investments
      const baseInvestAmt = profile.investmentPerMonth + monthlyInvestmentAddition;
      const actualInvestment = Math.min(currentSavings, baseInvestAmt);
      
      if (actualInvestment > 0) {
        currentSavings -= actualInvestment;
        currentInvestments += actualInvestment;
      }
    } else {
      // Cash flow deficit: Draw from savings
      currentSavings += netCashFlow; // subtracts since it's negative
      
      if (currentSavings < 0) {
        // Out of savings! Triggers high interest emergency debt
        emergencyDebt += -currentSavings;
        currentSavings = 0;
      }
    }

    // Compound Investments growth
    // Base returns based on risk profile + active scenarios
    let annualBaseReturn = 0.08;
    if (profile.riskAppetite === 'low') annualBaseReturn = 0.06;
    if (profile.riskAppetite === 'medium') annualBaseReturn = 0.09;
    if (profile.riskAppetite === 'high') annualBaseReturn = 0.12;

    const monthlyBaseYield = Math.pow(1 + annualBaseReturn + investmentRateBump, 1 / 12) - 1;
    const actualMonthlyYield = monthlyBaseYield + marketReturnModifier;

    currentInvestments *= (1 + actualMonthlyYield);
    if (currentInvestments < 0) currentInvestments = 0;

    const totalRemainingDebt = currentDebts.reduce((sum, d) => sum + d.amount, 0) + emergencyDebt;
    const currentNetWorth = currentSavings + currentInvestments - totalRemainingDebt;

    timeline.push({
      month: m,
      age: currentAge,
      income: Math.round(finalIncome),
      expenses: Math.round(finalExpenses),
      cashFlow: Math.round(netCashFlow),
      savings: Math.round(currentSavings),
      investments: Math.round(currentInvestments),
      debtRemaining: Math.round(totalRemainingDebt),
      netWorth: Math.round(currentNetWorth),
      stressScore: Math.round(monthlyStress),
      burnoutRisk: parseFloat(burnoutRisk.toFixed(2)),
    });
  }

  return timeline;
}
