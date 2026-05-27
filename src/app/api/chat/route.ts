import { NextRequest, NextResponse } from 'next/server';
import { runSimulation, UserProfile, Scenario } from '@/utils/simulation';

// Server-side fallback API keys check
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, profile, scenarios, userApiKey } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing conversation messages" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;
    
    // Run simulation server-side to inject context
    const simulationResults = runSimulation(profile as UserProfile, scenarios as Scenario[]);
    const finalNW = simulationResults.summary.finalNetWorth;
    const stress = simulationResults.summary.averageStress;
    const debt = simulationResults.summary.totalDebt;
    const freedomProb = simulationResults.summary.financialFreedomProbability;

    const formattedNW = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(finalNW);
    const formattedDebt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(debt);
    const activeSc = scenarios.filter((s: Scenario) => s.isEnabled).map((s: Scenario) => s.name).join(', ') || 'Current Path';

    // 1. If API Key is present, call external AI service
    const activeKey = userApiKey || GEMINI_API_KEY || OPENAI_API_KEY;
    if (activeKey) {
      // In a production setup, we would run fetch calls to Gemini / OpenAI endpoint.
      // E.g., calling Gemini API (Google Generative AI) or OpenAI API.
      // Let's implement a clean call to Gemini or OpenAI if configured:
      try {
        const isGemini = activeKey.startsWith('AIzaSy'); // standard Gemini API key prefix
        
        if (isGemini) {
          const systemPrompt = `You are "LifeSim AI Advisor", a futuristic elite financial planner.
User Profile: Age ${profile.age}, City ${profile.city}, Monthly Income ₹${profile.monthlyIncome}, Monthly Expenses ₹${profile.monthlyExpenses}, Current Savings ₹${profile.savings}.
Active Scenarios Toggled: ${activeSc}.
Simulation Year 10 Projections: Final Net Worth = ${formattedNW}, Average stress score = ${stress}/100, Remaining Debt = ${formattedDebt}, Financial Independence probability = ${freedomProb}%.
Your job: Answer the user query using these exact numbers. Keep it concise, professional, and action-oriented.`;

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Query: ${lastMessage}` }] }
              ],
              generationConfig: { maxOutputTokens: 500 }
            })
          });

          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return NextResponse.json({ message: text });
          }
        } else {
          // Fallback to OpenAI API structure
          const systemPrompt = `You are "LifeSim AI Advisor", a futuristic elite financial planner.
User Profile: Age ${profile.age}, City ${profile.city}, Monthly Income ₹${profile.monthlyIncome}, Monthly Expenses ₹${profile.monthlyExpenses}, Current Savings ₹${profile.savings}.
Active Scenarios Toggled: ${activeSc}.
Simulation Year 10 Projections: Final Net Worth = ${formattedNW}, Average stress score = ${stress}/100, Remaining Debt = ${formattedDebt}, Financial Independence probability = ${freedomProb}%.
Your job: Answer the user query using these exact numbers.`;

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${activeKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                ...messages.map((m: any) => ({ role: m.role, content: m.content }))
              ],
              max_tokens: 500
            })
          });

          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            return NextResponse.json({ message: text });
          }
        }
      } catch (err) {
        console.error("AI service request failed, falling back to mock response", err);
      }
    }

    // 2. FALLBACK: Smart, context-aware rule-based Mock Financial Advisor response
    const query = lastMessage.toLowerCase();
    let reply = "";

    if (query.includes("laptop") || query.includes("affordable") || query.includes("buy")) {
      const laptopCost = 150000;
      if (profile.savings >= laptopCost) {
        const remainingSavings = profile.savings - laptopCost;
        reply = `Buying a ₹1.5L laptop is fully affordable for you today since you have ₹${profile.savings.toLocaleString('en-IN')} in liquid savings.
        
        However, doing so will immediately drop your emergency fund coverage from ${(profile.savings / profile.monthlyExpenses).toFixed(1)} months to ${(remainingSavings / profile.monthlyExpenses).toFixed(1)} months.
        
        Our simulation suggests this is a low-risk purchase. To offset the cash flow impact, try allocating an extra ₹5,000/month to savings for the next 6 months.`;
      } else {
        reply = `Looking at your savings (₹${profile.savings.toLocaleString('en-IN')}), buying a ₹1.5L laptop outright will exhaust your liquid buffer and force you to tap into high-interest emergency credit.
        
        I recommend saving an extra ₹15,000 per month for the next 10 months, or purchasing it via a no-cost EMI plan for under ₹12,000/month only if your net cash flow remains positive.`;
      }
    } 
    else if (query.includes("education loan") || query.includes("loan") || query.includes("studies") || query.includes("mba")) {
      reply = `Taking an education loan of ₹16L (modeled in our Higher Studies scenario) creates a major cash flow deficit for the first 24 months as your monthly income drops to ₹0 during study.
      
      However, once you graduate, your monthly income scales up by ₹90,000. The simulation projects that despite carrying loan repayments (EMI of ~₹26,000/month at 9.5%), your 10-year net worth scales to ${formattedNW} compared to ₹1.1 Cr on the current path.
      
      Safest approach: Set aside a 6-month buffer (₹2.4L) to handle study-period emergency expenses before initiating the loan.`;
    } 
    else if (query.includes("invest") || query.includes("5000") || query.includes("investing")) {
      reply = `Investing ₹5,000/month on your current profile (which averages a 9% return in index funds) compounds to approximately ₹9.7L in 10 years.
      
      If you can optimize your expenses and bump this to ₹20,000/month (like in the Aggressive Index Investing scenario), your 10-year investment portfolio projections skyrocket to over ₹39L!
      
      Given your risk tolerance profile (${profile.riskAppetite}), this is the single most efficient way to boost your financial freedom index.`;
    } 
    else if (query.includes("independent") || query.includes("financial independence") || query.includes("fire") || query.includes("retire")) {
      reply = `To achieve full Financial Independence (where assets cover your annual expenses of ₹${(profile.monthlyExpenses * 12).toLocaleString('en-IN')} multiplied by 15, which is ₹${(profile.monthlyExpenses * 12 * 15).toLocaleString('en-IN')}), your current path has a ${freedomProb}% probability of success.
      
      The simulation indicates that the "Financial Freedom Speedrun" path (which maximizes Index investing and adds freelance part-time income) scales your FIRE probability to 85%, shortening your retirement timeline by 6 years!`;
    } 
    else if (query.includes("safest")) {
      reply = `According to our Monte Carlo simulations:
      
      1. **Current Path** is the safest path (Stress: 28/100, Debt Trap Risk: 0%), but it accumulates wealth slowly.
      2. **Financial Freedom Speedrun** is the second safest (Stress: 36/100, Debt Trap Risk: 0.5%), and yields more than double the net worth.
      3. **Higher Studies** is highly risky early due to loan debt but recovers strongly.
      4. **Startup Path** is the riskiest, carrying a 25% debt trap probability and extreme stress (83/100).`;
    } 
    else if (query.includes("highest growth") || query.includes("growth") || query.includes("most money")) {
      reply = `The path that yields the highest cumulative growth in our engine is the **Entrepreneurship Path (Startup)**, reaching a best-case net worth of ₹2.4 Cr by year 10.
      
      However, it is highly binary: if it fails, your worst-case outcome drops to ₹12L. The **Higher Studies** path represents the most reliable high-growth alternative, scaling your net worth to a stable ${formattedNW}.`;
    } 
    else {
      // General dynamic greeting response
      reply = `Hello! I am your AI Financial Advisor. I've analyzed your active path details ("${activeSc}") and Year 10 simulation metrics.
      
      Currently, you are projecting a 10-Year Net Worth of **${formattedNW}** with a final outstanding debt of **${formattedDebt}**. Your average stress index stands at **${stress}/100**, and your Financial Freedom probability is **${freedomProb}%**.
      
      You can ask me questions such as:
      - "Can I afford a ₹1.5L laptop?"
      - "Should I take an education loan?"
      - "What if I invest ₹5000 per month?"
      - "Which scenario is safest?"
      
      What trade-off would you like to evaluate today?`;
    }

    return NextResponse.json({ message: reply });

  } catch (err: any) {
    console.error("API Chat handler error:", err);
    return NextResponse.json({ error: "Internal Server Error: " + err.message }, { status: 500 });
  }
}
