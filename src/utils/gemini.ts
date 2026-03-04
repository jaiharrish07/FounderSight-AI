/// <reference types="vite/client" />

// Puter.js is loaded globally via script tag in index.html
// Access it via window.puter
declare const puter: any;

const DEFAULT_MODEL = 'gemini-2.5-flash';

const parseJSON = (text: string) => {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse Gemini JSON:", text);
    return null;
  }
}

const chatWithGemini = async (prompt: string, model: string = DEFAULT_MODEL): Promise<string> => {
  const response = await puter.ai.chat(prompt, { model });
  // puter.ai.chat returns a response object with message.content
  if (typeof response === 'string') return response;
  if (response?.message?.content) return response.message.content;
  if (response?.text) return response.text;
  return JSON.stringify(response);
};

export const createChatSession = (systemInstruction: string, history: any[] = []) => {
  // Maintain conversation history manually for Puter.js
  const messages: { role: string; content: string }[] = [];

  // Add system instruction as the first message
  messages.push({ role: 'system', content: systemInstruction });

  // Convert existing history to Puter.js format
  history.forEach(msg => {
    const role = msg.role === 'model' ? 'assistant' : msg.role;
    const content = msg.parts?.map((p: any) => p.text).join('') || msg.content || '';
    if (content) {
      messages.push({ role, content });
    }
  });

  return {
    sendMessageStream: async (text: string) => {
      messages.push({ role: 'user', content: text });

      const response = await puter.ai.chat(messages, {
        model: DEFAULT_MODEL,
        stream: true
      });

      // Store accumulated text for history
      let fullText = '';

      return {
        stream: (async function* () {
          for await (const part of response) {
            if (part?.text) {
              fullText += part.text;
              yield { text: () => part.text };
            }
          }
          // After streaming completes, add assistant message to history
          messages.push({ role: 'assistant', content: fullText });
        })()
      };
    }
  };
};

export const fetchAICompetitors = async (inputs: any) => {
  const geoMain = [inputs.country, inputs.geoState].filter(Boolean).join(', ');
  const cityNote = inputs.geoCity ? ` The startup is specifically based in ${inputs.geoCity}.` : '';
  const prompt = `Return a JSON array of exactly 6 REAL companies currently operating in 2025/2026 that compete with a startup matching this profile: Name: ${inputs.name}, Industry: ${inputs.industry}, Geography HQ: ${geoMain}, Target Market: ${inputs.targetMarket}, Business Model: ${inputs.revenuePredictability}, Differentiation: ${inputs.differentiationType}.${cityNote} 
    3 MUST be from ${inputs.country} or regional (they do NOT need to be from the same city), 3 can be global leaders. These must be real company names that actually exist, with real funding stages.
    JSON structure strictly:
    [
      { "name": "Real Company Name", "type": "direct" | "indirect", "funding_stage": "e.g. Series C", "est_valuation": "e.g. $1B", "market_share_percent": 15, "innovation_score": 85, "threat_level": "high"|"medium"|"low", "key_strength": "...", "key_weakness": "...", "founded_year": "...", "hq_country": "..." }
    ]`;

  const result = await chatWithGemini(prompt);
  return parseJSON(result);
};

export const fetchAIIndustryData = async (inputs: any) => {
  const geo = [inputs.country, inputs.geoState, inputs.geoCity].filter(Boolean).join(', ');
  const prompt = `Provide real industry metrics and benchmarks for the ${inputs.industry} sector in ${geo} as of 2025/2026.
    Return strictly JSON matching this structure:
    {
      "annual_growth_rate_pct": 12,
      "global_market_size": "$50B",
      "tam": "$10B",
      "failure_rate_pct": 90,
      "months_to_series_a": 24,
      "avg_seed_check": "$2M",
      "top_investors": ["Name1", "Name2", "Name3"],
      "recent_exits": ["Acquisition1", "Acquisition2"],
      "sentiment": "bullish" | "bearish" | "neutral",
      "hottest_subsectors": ["Sub1", "Sub2"],
      "biggest_risk": "One sentence",
      "biggest_opportunity": "One sentence",
      "regulation_trend": "tightening" | "loosening",
      "benchmarks": {
        "burn_rate": 50000,
        "cac": 150,
        "ltv_cac_ratio": 3,
        "median_runway_months": 18
      }
    }`;
  const result = await chatWithGemini(prompt);
  return parseJSON(result);
};

export const fetchAIExecSummary = async (inputs: any, scores: any) => {
  const geo = [inputs.country, inputs.geoState, inputs.geoCity].filter(Boolean).join(', ');
  const prompt = `Write a real VC-style executive summary specific to this exact startup: Name: ${inputs.name}, Industry: ${inputs.industry} (${geo}). Current Runway: ${inputs.runwayMonths}mo, Overall Risk: ${scores.overallRisk}/100.
    Return strictly JSON:
    {
      "executiveSummary": "2-paragraph professional VC summary.",
      "ventureClassification": "e.g. Moonshot, Stable Yield, High Risk",
      "investmentThesis": "One sentence thesis.",
      "keyRisks": ["Risk 1", "Risk 2"],
      "keyStrengths": ["Strength 1", "Strength 2"],
      "comparableExits": ["Company A", "Company B"],
      "recommendedNextMilestone": "Specific operational milestone.",
      "fundingRecommendation": { "amount": "e.g. $2M", "timeline": "e.g. next 3 months" },
      "investorReadinessScore": 85,
      "pitchScorecard": [
        { "section": "Problem", "score": 8, "feedback": "1 line critique" },
        { "section": "Solution", "score": 7, "feedback": "1 line critique" },
        { "section": "Market Size", "score": 6, "feedback": "1 line critique" },
        { "section": "Business Model", "score": 9, "feedback": "1 line critique" },
        { "section": "Traction", "score": 5, "feedback": "1 line critique" },
        { "section": "Team", "score": 8, "feedback": "1 line critique" },
        { "section": "Competition", "score": 4, "feedback": "1 line critique" },
        { "section": "Financials", "score": 6, "feedback": "1 line critique" },
        { "section": "The Ask", "score": 7, "feedback": "1 line critique" }
      ]
    }`;
  const result = await chatWithGemini(prompt);
  return parseJSON(result);
};

export const fetchAISWOT = async (inputs: any, scores: any) => {
  const geo = [inputs.country, inputs.geoState, inputs.geoCity].filter(Boolean).join(', ');
  const prompt = `Generate a highly specific strategic analysis for ${inputs.name} (${inputs.industry}, ${geo}) given overall risk ${scores.overallRisk}.
    Return strictly JSON:
    {
      "swot": {
        "strengths": ["Detailed strength 1 with specifics", "Detailed strength 2", "Detailed strength 3", "Detailed strength 4"], 
        "weaknesses": ["Detailed weakness 1 with specifics", "Detailed weakness 2", "Detailed weakness 3", "Detailed weakness 4"], 
        "opportunities": ["Detailed opportunity 1 with specifics", "Detailed opportunity 2", "Detailed opportunity 3", "Detailed opportunity 4"], 
        "threats": ["Detailed threat 1 with specifics", "Detailed threat 2", "Detailed threat 3", "Detailed threat 4"]
      },
      "strategicWeaknesses": [
        { "title": "...", "severity": "critical"|"high"|"medium"|"low", "description": "2 sentences tied to risk scores.", "mitigation": ["Step 1", "Step 2", "Step 3"], "timeframe": "e.g. 30 days" }
      ],
      "recommendations": [
         { "title": "...", "priority": 1, "impact": "high"|"medium"|"low", "category": "growth"|"team"|"funding"|"product"|"risk", "action": "2-3 sentences.", "expected_outcome": "...", "timeframe_weeks": 4 }
      ],
      "strategyRoadmap": [
        { "phase": "Phase 1: Foundation (Weeks 1-4)", "goals": ["Goal 1", "Goal 2"], "kpis": ["KPI 1", "KPI 2"] },
        { "phase": "Phase 2: Traction (Weeks 5-12)", "goals": ["Goal 1", "Goal 2"], "kpis": ["KPI 1", "KPI 2"] },
        { "phase": "Phase 3: Scale (Weeks 13-24)", "goals": ["Goal 1", "Goal 2"], "kpis": ["KPI 1", "KPI 2"] },
        { "phase": "Phase 4: Optimize (Weeks 25-52)", "goals": ["Goal 1", "Goal 2"], "kpis": ["KPI 1", "KPI 2"] }
      ]
    }`;
  const result = await chatWithGemini(prompt);
  return parseJSON(result);
};

export const fetchAIRegulations = async (inputs: any) => {
  const geo = [inputs.country, inputs.geoState, inputs.geoCity].filter(Boolean).join(', ');
  const prompt = `Identify real applicable regulations for a ${inputs.industry} startup operating in ${geo} in 2025. 
    Return strictly JSON:
    {
      "regulations": [
        { "name": "e.g. DPDP Act 2023", "authority": "...", "description": "1-2 sentence description of what this regulation covers and why it matters.", "applies": "Yes"|"Conditional", "priority": "High"|"Medium"|"Low", "timeline": "e.g. 6 months", "compliance_cost_local": "e.g. ₹5,00,000", "risk": "Specific risk if ignored", "action": "Specific steps the founder needs to take to comply.", "what_to_do": "Plain english step-by-step: 1. Do X 2. Do Y 3. Do Z" }
      ],
      "compliance_roadmap": [
        { "milestone": "...", "month": 2, "description": "What to do and why" }
      ],
      "total_estimated_cost_local": "e.g. ₹15,00,000"
    }`;
  const result = await chatWithGemini(prompt);
  return parseJSON(result);
};

export const fetchAITrends = async () => {
  const prompt = `Return a JSON array of exactly 5 current real macroeconomic trends, startup news, or government scheme announcements in the global startup ecosystem for 2025/2026.
    For each item, include a real relevant URL where users can read more about the trend or scheme. Use real news source URLs or official government program pages.
    Return strictly JSON:
    [
      { "id": 1, "title": "e.g. AI Funding Surges Past $100B in 2025", "summary": "2-3 sentence detail with specific numbers and facts.", "impact": "positive"|"negative"|"neutral", "sector": "e.g. AI/ML", "url": "https://real-news-source.com/article", "source": "e.g. TechCrunch" }
    ]`;
  const result = await chatWithGemini(prompt);
  return parseJSON(result);
};

export const fetchGovernmentSchemes = async (country: string) => {
  const prompt = `Return a JSON array of exactly 5 real, currently active government schemes, grants, or startup programs available in ${country} for startups and entrepreneurs in 2025/2026. 
    These must be REAL programs with actual application URLs. Include the official government or program website URL.
    Return strictly JSON:
    [
      { "id": 1, "name": "e.g. Startup India Seed Fund Scheme", "description": "2-3 sentence description of the program, eligibility, and benefits.", "funding_amount": "e.g. Up to ₹50 Lakhs", "deadline": "e.g. Open year-round" | "e.g. March 2026", "url": "https://official-program-url.gov", "category": "grant"|"loan"|"tax_benefit"|"incubation"|"mentorship" }
    ]`;
  const result = await chatWithGemini(prompt);
  return parseJSON(result);
};

export const fetchAIInsight = async () => {
  const prompt = `Provide one brilliant, highly-specific, counter-intuitive venture capital insight for early stage founders for 2025/2026.
    Return strictly JSON:
    { "insight": "..." }`;
  const result = await chatWithGemini(prompt);
  return parseJSON(result);
};

export const fetchChatSuggestions = async (context: string) => {
  const prompt = `Based on this startup: ${context}. Suggest exactly 6 urgent, highly specific strategic questions the founder should ask an expert VC right now. Focus ONLY on actionable strategic gaps or their specific runway.
    Return strictly JSON array: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5", "Question 6"]`;
  const result = await chatWithGemini(prompt);
  return parseJSON(result);
};
