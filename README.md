# LifeSim AI - Parallel Finance & Life Decision Simulator

LifeSim AI is a futuristic, interactive personal finance and career path simulator. Rather than tracking historical budgets, it serves as a "stochastic sandbox" for testing major life choices—such as launching a startup, moving to a premium tech city, purchasing luxury vehicles, or financing higher education—and evaluating their compound effects on Net Worth, debt structures, stress levels, and retirement safety indicators over 10 years.

## 🚀 Technology Stack
* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
* **UI/Visualizations:** Recharts (Net worth areas, cash flow bars), Framer Motion (page transitions, spring indicators), `@xyflow/react` (decision branch trees), Lucide icons.
* **Backend:** Next.js Serverless API Route Handlers.
* **AI:** Support for custom server-side keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`), custom client-side API configurations, and an automated simulation-aware mock advisor.

---

## ⚡ Simulation Engine Metrics
* **Net Worth Overlay:** Compounds savings yields and investment returns (based on low/medium/high risk tolerances) minus outstanding interest rates.
* **Financial Freedom (FIRE) Probability:** Monte Carlo simulation running 40 runs factoring in market return variances and standard deviations. Checks probability that investments can sustain expenses for 15+ years.
* **Burnout & Stress Scales:** Evaluates cumulative stress based on active scenarios, debt-to-income loads, and cash balances, predicting burnout risks.
* **Debt Trap Risk:** Projections capturing whether liquid cash drains to zero, forcing high-interest emergency credit compounding.

---

## 📂 Project Architecture
```
src/
├── app/
│   ├── page.tsx            # Landing Page
│   ├── dashboard/          # Life Dashboard with timeline, KPIs
│   ├── profile/            # Profile Setup Form
│   ├── scenarios/          # Scenario Builder
│   ├── compare/            # Parallel Universe Comparison Page
│   ├── advisor/            # AI Chat Advisor Page
│   ├── reports/            # Generated Summary and Recommendations
│   ├── api/
│   │   └── chat/           # Chat API Route (supports Gemini/OpenAI & Mock fallback)
│   ├── layout.tsx          # Global Layout with Navbar and Background
│   └── globals.css         # Theme styles, glassmorphism config
├── components/
│   ├── LifeTimeline.tsx    # Interactive milestone and event timeline
│   ├── DecisionTree.tsx    # Interactive flow tree utilizing React Flow
│   ├── RadarChart.tsx      # Risk/Stress/Burnout metrics
│   ├── FutureSelf.tsx      # Bonus: Future Self Letter generator
│   └── Navbar.tsx          # Sleek navigation header
├── context/
│   └── AppContext.tsx      # Global React state synchronizer with LocalStorage
└── utils/
    ├── simulation.ts       # Main projection math engine (Deterministic + Probabilistic)
    └── mockData.ts         # Preloaded starter profiles & sample scenarios
```

---

## 🛠️ Local Setup Instructions

1. **Clone and Navigate:**
   Ensure you are in the project folder.

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure API Keys (Optional):**
   Copy `.env.example` to `.env.local` and add your keys to query Gemini or OpenAI models. If left blank, the app runs on its simulation-aware mock fallback engine:
   ```bash
   cp .env.example .env.local
   ```

4. **Launch Dev Server:**
   Run the dev command:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

5. **Production Compiling:**
   Ensure zero errors by running:
   ```bash
   npm run build
   ```
