export async function callClaudeAPI(inputs: any, riskScores: any) {
    // In a real hackathon app with a backend, this would make an actual call to Anthropic API.
    // For this fully in-browser demo, we use highly realistic fallback data 
    // localized based on the user's inputs.

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                executiveSummary: `Based on the provided profile, ${inputs.name || 'this startup'} is uniquely positioned to disrupt the ${inputs.industry} sector in ${inputs.country}. However, the ${riskScores.classification} rating suggests significant execution and capital constraints that must be addressed before the next funding round.`,

                competitors: [
                    { name: `Global ${inputs.industry} Leader`, type: 'direct', funding_stage: 'Public/Late Stage', est_valuation: '$5B+', market_share_percent: 45, innovation_score: 60, threat_level: 'high', key_strength: 'Massive distribution network', key_weakness: 'Slow product velocity', founded_year: '2012', hq_country: 'USA' },
                    { name: `Regional ${inputs.country} Challenger`, type: 'direct', funding_stage: 'Series C', est_valuation: '$500M', market_share_percent: 15, innovation_score: 85, threat_level: 'high', key_strength: 'Highly localized product', key_weakness: 'High cash burn', founded_year: '2020', hq_country: inputs.country },
                    { name: `Niche ${inputs.targetMarket} Startup`, type: 'indirect', funding_stage: 'Seed', est_valuation: '$15M', market_share_percent: 2, innovation_score: 95, threat_level: 'medium', key_strength: 'Elite technical team', key_weakness: 'Weak GTM motion', founded_year: '2023', hq_country: inputs.country },
                    { name: 'Incumbent Tech Giant', type: 'indirect', funding_stage: 'Public', est_valuation: '$1T+', market_share_percent: 30, innovation_score: 40, threat_level: 'medium', key_strength: 'Infinite capital', key_weakness: 'Lack of focus on this niche', founded_year: '1998', hq_country: 'USA' },
                    { name: 'Adjacent Vertical Player 1', type: 'indirect', funding_stage: 'Series A', est_valuation: '$60M', market_share_percent: 5, innovation_score: 75, threat_level: 'low', key_strength: 'Strong overlapping user base', key_weakness: 'Different core competency', founded_year: '2021', hq_country: 'UK' },
                    { name: 'Emerging Stealth Co.', type: 'direct', funding_stage: 'Pre-Seed', est_valuation: 'Unknown', market_share_percent: 0, innovation_score: 90, threat_level: 'medium', key_strength: 'Novel AI-native approach', key_weakness: 'Unproven product', founded_year: '2024', hq_country: 'Singapore' },
                ],

                revenueModelAssessment: [
                    { dimension: 'Predictability', score: inputs.revenuePredictability === 'Recurring' ? 90 : 40, rationale: 'Recurring SaaS models offer high visibility.' },
                    { dimension: 'Scalability', score: 85, rationale: 'Software margins allow infinite scaling once built.' },
                    { dimension: 'Defensibility', score: 60, rationale: 'Low switching costs may hurt long-term retention.' },
                    { dimension: 'CAC Efficiency', score: 55, rationale: 'Heavy reliance on paid channels degrades margins.' },
                    { dimension: 'LTV Potential', score: 75, rationale: 'Strong B2B retention drives excellent lifetime value.' }
                ],

                regulations: [
                    { name: inputs.country === 'India' ? 'DPDP Act 2023' : 'GDPR / CCPA', applies: 'Yes', priority: 'High', timeline: '3-6 months', risk: 'Heavy fines, operational shutdown' },
                    { name: inputs.industry === 'FinTech' ? 'Financial Services Licensing' : 'ISO 27001', applies: 'Yes', priority: 'High', timeline: '6-12 months', risk: 'Inability to launch / Enterprise rejection' },
                    { name: inputs.industry === 'HealthTech' ? 'HIPAA / equivalent' : 'SOC 2 Type II', applies: 'Yes', priority: 'Medium', timeline: '9-12 months', risk: 'Loss of major B2B contracts' },
                    { name: 'Data Localization Laws', applies: 'Conditional', priority: 'Medium', timeline: '6 months', risk: 'Infrastructure migration costs' },
                    { name: 'AI Act / Algorithmic Audits', applies: 'Pending', priority: 'Low', timeline: '18-24 months', risk: 'Future regulatory squeeze' }
                ],

                strategicWeaknesses: [
                    { title: 'Dangerous Burn-to-Runway Ratio', severity: 'critical', description: 'At the current burn rate, capital exhaustion occurs before the proven break-even point.', mitigation: ['Cut non-essential marketing spend immediately by 30%', 'Renegotiate vendor contracts', 'Bridge round from existing angels'], timeframe: 'Immediate (0-30 days)' },
                    { title: 'Weak Moat in Crowded Market', severity: 'high', description: `With ${inputs.competitorCount} estimated competitors, relying purely on ${inputs.differentiationType} is insufficient.`, mitigation: ['Develop proprietary data loops', 'Lock in early customers with annual contracts', 'Pivot messaging to a sub-niche'], timeframe: 'Next 90 days' },
                    { title: 'Founder Key-Person Risk', severity: 'medium', description: 'The current team structure over-relies on the founder for both product and sales.', mitigation: ['Hire strong VP of Sales', 'Document core technical processes', 'Implement standard operating procedures'], timeframe: 'Q3-Q4' },
                    { title: 'Regulatory Compliance Debt', severity: 'low', description: 'Operating without SOC2 will eventually block enterprise sales motions.', mitigation: ['Begin gap analysis', 'Automate continuous compliance using Vanta/Drata'], timeframe: 'Next 12 months' },
                    { title: 'Suboptimal Capital Structure', severity: 'low', description: 'Cap table fragmentation could complicate future VC raises.', mitigation: ['Roll up small angels into an SPV', 'Cleanup equity ledger'], timeframe: 'Before next priced round' }
                ],

                swot: {
                    strengths: ['Identified clear target market', 'Modern tech stack', 'Strong founding team alignment', 'Nimble operation'],
                    weaknesses: ['Limited capital runway', 'Unproven CAC at scale', 'Lack of enterprise certifications', 'Low brand awareness'],
                    opportunities: ['Shift in macro environment favoring efficiency', 'Competitors raising prices', 'New AI tooling reduces dev costs', 'Untapped adjacent markets'],
                    threats: ['Incumbents copying features', 'Rising ad rates', 'Looming regulatory changes', 'Venture funding winter']
                },

                pitchScorecard: [
                    { section: 'Problem', score: 8, feedback: 'Well-defined, but quantify the pain monetarily.' },
                    { section: 'Solution', score: 7, feedback: 'Good UX, but explain the "magic" better.' },
                    { section: 'Market Size', score: 6, feedback: 'TAM looks artificially inflated. Show realistic SOM.' },
                    { section: 'Business Model', score: 9, feedback: 'Standard, proven SaaS scaling mechanics.' },
                    { section: 'Traction', score: 5, feedback: 'Too early to prove product-market fit. Focus on early signals.' },
                    { section: 'Team', score: 8, feedback: 'Strong domain expertise. Highlight it more.' },
                    { section: 'Competition', score: 4, feedback: 'Don\'t say you have no competitors. Use a 2x2 matrix.' },
                    { section: 'Financials', score: 6, feedback: 'Projections are too aggressive for year 3.' },
                    { section: 'The Ask', score: 7, feedback: 'Clear amount, but vague use of funds. Be specific.' }
                ],

                recommendations: [
                    { title: 'Extend Runway Immediately', priority: 1, impact: 'high', category: 'funding', action: 'Reduce monthly burn by 25% focusing on software subscriptions and low-ROI ads.', expected_outcome: 'Adds 4 months of survival time.', timeframe_weeks: 2 },
                    { title: 'Launch Enterprise Pilot', priority: 2, impact: 'high', category: 'growth', action: 'Offer the product at cost to 3 marquee brands in exchange for case studies.', expected_outcome: 'Social proof unlocks mid-market sales.', timeframe_weeks: 6 },
                    { title: 'Initiate SOC-2 Readiness', priority: 3, impact: 'medium', category: 'risk', action: 'Start the automated observance period using compliance software.', expected_outcome: 'Unblocks enterprise procurement.', timeframe_weeks: 4 },
                    { title: 'Refine GTM Motion', priority: 4, impact: 'high', category: 'product', action: 'Shift from broad SEO to highly targeted outbound sequences.', expected_outcome: 'Lower CAC and higher quality leads.', timeframe_weeks: 3 },
                    { title: 'Shore up Technical Debt', priority: 5, impact: 'medium', category: 'team', action: 'Dedicate one sprint purely to infrastructure stabilization.', expected_outcome: 'Prevents downtime during upcoming launch.', timeframe_weeks: 2 }
                ]
            });
        }, 1000); // 1s delay for realistic mock
    });
}

// Chat API mock
export async function streamExpertChat(startupContext: any, history: any[], newMessage: string, onUpdate: (chunk: string) => void) {
    // Mock streaming response
    return new Promise((resolve) => {
        const responses = [
            `Based on your ${startupContext.runwayMonths} month runway and $${startupContext.burnRate} burn, I highly suggest shifting focus from top-of-funnel acquisition to pure retention.`,
            `Your Execution Risk is ${startupContext.riskScores?.executionRisk}/100. Let's talk about strategies to mitigate this by augmenting your team with specialized fractional talent.`,
            `For ${startupContext.industry} startups in ${startupContext.country}, the typical Series A milestone right now expects at least $1.5M ARR with >100% YoY growth.`,
            `Here's a quick 30-second investor pitch:\n\n"We are building the intelligence layer for ${startupContext.industry}. While competitors rely on legacy architecture, our AI-native platform reduces operational costs by 40%. We're raising $${startupContext.targetRaiseAmount} to hit $1M in ARR within 18 months."`
        ];

        const finalMessage = responses[Math.floor(Math.random() * responses.length)] + "\n\nIs there a specific aspect of this you'd like to dive deeper into?";

        let i = 0;
        const interval = setInterval(() => {
            onUpdate(finalMessage.slice(0, i));
            i += 3; // speed of typing
            if (i > finalMessage.length) {
                clearInterval(interval);
                resolve(finalMessage);
            }
        }, 20);
    });
}
