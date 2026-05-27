import { UserProfile, Scenario } from './simulation';

export const defaultProfile: UserProfile = {
  age: 24,
  city: "Bangalore",
  monthlyIncome: 85000, // ₹85,000/month
  monthlyExpenses: 35000, // ₹35,000/month
  savings: 250000, // ₹2.5L starting savings
  debts: [
    {
      id: "debt-1",
      name: "Car Loan",
      amount: 150000, // ₹1.5L remaining
      interestRate: 0.085, // 8.5% annual
      monthlyPayment: 6500, // ₹6.5k/month
    }
  ],
  investmentPerMonth: 15000, // ₹15k/month
  careerField: "Software Engineering",
  expectedSalaryGrowth: 10, // 10% annual base salary growth
  riskAppetite: "medium",
  majorGoals: [
    {
      id: "goal-1",
      name: "Higher Studies (MBA)",
      targetAmount: 1500000, // ₹15L
      targetAge: 27,
    },
    {
      id: "goal-2",
      name: "Buy a House Downpayment",
      targetAmount: 3000000, // ₹30L
      targetAge: 32,
    },
    {
      id: "goal-3",
      name: "Financial Independence",
      targetAmount: 15000000, // ₹1.5 Cr
      targetAge: 40,
    }
  ]
};

export const defaultScenarios: Scenario[] = [
  {
    id: "sc-high-salary",
    name: "High Salary & Stress Job",
    category: "job",
    isEnabled: false,
    variables: {
      upfrontCost: 30000, // relocation cost
      monthlyCost: 15000, // higher rent/expense in premium city/office
      monthlyCostDuration: -1,
      expectedIncomeChange: 65000, // ₹65k salary increase
      expectedIncomeChangeDelay: 3, // starts in 3 months
      riskLevel: "medium",
      timeDuration: 10, // impacts the full 10-year duration
      stressImpact: 25, // heavy stress increase
      growthPotential: 80, // high career ladder velocity
    }
  },
  {
    id: "sc-higher-studies",
    name: "Pursue MBA Abroad / Higher Studies",
    category: "education",
    isEnabled: false,
    variables: {
      upfrontCost: 300000, // visa, travel, exams
      monthlyCost: 20000, // living cost abroad (excluding loan payment)
      monthlyCostDuration: 24, // 2 years of study
      expectedIncomeChange: 90000, // salary increases by ₹90k after graduating
      expectedIncomeChangeDelay: 24, // starts in 24 months
      riskLevel: "medium",
      timeDuration: 10,
      stressImpact: 15,
      growthPotential: 90, // very high long-term career growth
      debtPrincipal: 1600000, // ₹16L education loan
      debtInterest: 0.095, // 9.5% interest rate
      debtTerm: 84, // 7 years repayment
    }
  },
  {
    id: "sc-startup",
    name: "Launch a FinTech Startup",
    category: "startup",
    isEnabled: false,
    variables: {
      upfrontCost: 200000, // initial bootstrapping capital
      monthlyCost: 10000, // operational expenses
      monthlyCostDuration: 36, // 3 years of bootstrapping
      expectedIncomeChange: -45000, // drop salary by ₹45k for first 3 years
      expectedIncomeChangeDelay: 0,
      riskLevel: "high",
      timeDuration: 10,
      stressImpact: 45, // extreme stress
      growthPotential: 95, // extreme growth potential if it succeeds
    }
  },
  {
    id: "sc-aggressive-investing",
    name: "Aggressive Index Investing",
    category: "investment",
    isEnabled: false,
    variables: {
      upfrontCost: 0,
      monthlyCost: 20000, // divert extra ₹20k from consumption to investments
      monthlyCostDuration: -1,
      expectedIncomeChange: 0,
      expectedIncomeChangeDelay: 0,
      riskLevel: "medium",
      timeDuration: 10,
      stressImpact: 5, // slight stress from strict budgeting/frugality
      growthPotential: 60, // increases investment yields
    }
  },
  {
    id: "sc-buy-luxury-car",
    name: "Buy a Luxury Car",
    category: "purchase",
    isEnabled: false,
    variables: {
      upfrontCost: 150000, // Downpayment
      monthlyCost: 18000, // Maintenance, fuel, insurance
      monthlyCostDuration: 60, // 5 years of loan EMI + maintenance
      expectedIncomeChange: 0,
      expectedIncomeChangeDelay: 0,
      riskLevel: "low",
      timeDuration: 5,
      stressImpact: -5, // slight boost to happiness/happiness utility (-5 stress)
      growthPotential: 0,
      debtPrincipal: 800000, // ₹8L car loan
      debtInterest: 0.09, // 9% interest rate
      debtTerm: 60, // 5 years
    }
  },
  {
    id: "sc-freelance",
    name: "Start Freelancing Part-Time",
    category: "freelance",
    isEnabled: false,
    variables: {
      upfrontCost: 60000, // High-performance laptop & workspace
      monthlyCost: 3000, // software subscriptions
      monthlyCostDuration: -1,
      expectedIncomeChange: 25000, // ₹25k extra per month
      expectedIncomeChangeDelay: 2, // starts in 2 months
      riskLevel: "low",
      timeDuration: 10,
      stressImpact: 10, // working weekends increases stress
      growthPotential: 40,
    }
  }
];

export interface PredefinedPaths {
  name: string;
  description: string;
  scenarioIds: string[];
}

export const predefinedPaths: PredefinedPaths[] = [
  {
    name: "Current Path",
    description: "Continue with your current career trajectory, spending habits, and investment rate.",
    scenarioIds: []
  },
  {
    name: "High Salary & Burnout Path",
    description: "Take the high salary corporate offer. High earnings, but high stress and relocation costs.",
    scenarioIds: ["sc-high-salary"]
  },
  {
    name: "Higher Studies & Growth Path",
    description: "Pursue an MBA. High upfront loan debt and zero income for two years, followed by rapid career acceleration.",
    scenarioIds: ["sc-higher-studies"]
  },
  {
    name: "Entrepreneurship Path",
    description: "Quit your corporate job to start a venture. Extreme risk, high stress, but high upside in outer years.",
    scenarioIds: ["sc-startup"]
  },
  {
    name: "Financial Freedom Speedrun",
    description: "Live extremely frugally, invest aggressively in equity index funds, and side hustle.",
    scenarioIds: ["sc-aggressive-investing", "sc-freelance"]
  }
];
