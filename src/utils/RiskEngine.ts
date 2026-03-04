// Deterministic Risk Engine Logic
// Computed purely in JS to score the startup

export interface RiskExplanation {
    dimension: string;
    score: number;
    weight: number;
    weightedContribution: number;
    factors: { factor: string; impact: number; reason: string }[];
    summary: string;
}

export function computeRiskScores(inputs: any) {
    // MARKET RISK (0-100)
    let marketRisk = 0;
    const compCount = inputs.competitorCount || 0;
    marketRisk += compCount > 100 ? 30 : compCount > 50 ? 20 : compCount > 20 ? 10 : 5;
    marketRisk += (inputs.marketOverlapPct || 0) * 0.3; // 0-30 points
    marketRisk += inputs.marketTiming === 'Late/declining' ? 25 : inputs.marketTiming === 'Too early' ? 15 : inputs.marketTiming === 'Peak' ? 10 : 0;
    marketRisk += inputs.networkEffects === 'None' ? 10 : inputs.networkEffects === 'Weak' ? 5 : 0;
    marketRisk += inputs.competitionAggression === 'Tech giants' ? 15 : inputs.competitionAggression === 'Large corporates' ? 10 : 5;
    marketRisk = Math.min(100, marketRisk);

    // EXECUTION RISK (0-100)
    let executionRisk = 0;
    const teamCapMap: Record<string, number> = { 'Low': 30, 'Medium': 20, 'High': 10, 'Expert': 5 };
    executionRisk += teamCapMap[inputs.technicalCapability] || 20;
    const tSize = inputs.teamSize || 1;
    executionRisk += tSize < 2 ? 25 : tSize < 5 ? 15 : tSize < 10 ? 10 : 5;
    const infraMap: Record<string, number> = { 'Low': 5, 'Medium': 15, 'High': 25, 'Very High': 35 };
    executionRisk += infraMap[inputs.infrastructureComplexity] || 15;
    const productStageMap: Record<string, number> = { 'Idea': 25, 'MVP': 15, 'Beta': 10, 'Launched': 5, 'Scaling': 0 };
    executionRisk += productStageMap[inputs.productDevelopmentStage] || 20;
    executionRisk = Math.min(100, executionRisk);

    // FINANCIAL RISK (0-100)
    let financialRisk = 0;
    const runway = inputs.runwayMonths || 0;
    financialRisk += runway < 3 ? 40 : runway < 6 ? 30 : runway < 12 ? 15 : runway < 18 ? 5 : 0;
    financialRisk += inputs.revenuePredictability === 'One-time' ? 20 : inputs.revenuePredictability === 'Seasonal' ? 15 : inputs.revenuePredictability === 'Mixed' ? 8 : 0;
    financialRisk += inputs.fundingStage === 'Pre-Revenue' ? 20 : inputs.fundingStage === 'Revenue (Early)' ? 10 : 5;
    financialRisk += inputs.unitEconomicsKnown === 'No' ? 15 : 0;
    financialRisk = Math.min(100, financialRisk);

    // COMPETITION RISK (0-100)
    let competitionRisk = 0;
    competitionRisk += compCount > 100 ? 35 : compCount > 50 ? 25 : compCount > 20 ? 15 : 5;
    const diffMap: Record<string, number> = { 'Technology Innovation': 5, 'Network Effects': 5, 'Proprietary Data': 8, 'Price': 20, 'UX/Design': 12, 'Niche Focus': 10, 'Other': 15 };
    competitionRisk += diffMap[inputs.differentiationType] || 15;
    competitionRisk += inputs.switchingCost === 'Low' ? 20 : inputs.switchingCost === 'Medium' ? 10 : 3;
    competitionRisk += inputs.competitionAggression === 'Tech giants' ? 15 : inputs.competitionAggression === 'Large corporates' ? 10 : 5;
    competitionRisk = Math.min(100, competitionRisk);

    // REGULATORY RISK (0-100)
    let regulatoryRisk = 0;
    const regMap: Record<string, number> = { 'Highly Regulated': 40, 'Moderately Regulated': 20, 'Low Regulation': 8, 'Unregulated': 0 };
    regulatoryRisk += regMap[inputs.industryCategory] || 15;
    const dataMap: Record<string, number> = { 'No user data': 0, 'Basic data': 5, 'Sensitive personal data': 20, 'Financial data': 30, 'Health data': 35, 'Biometric data': 40 };
    regulatoryRisk += dataMap[inputs.dataPrivacy] || 10;
    regulatoryRisk += inputs.geopoliticalRisk === 'Very High' ? 15 : inputs.geopoliticalRisk === 'High' ? 10 : inputs.geopoliticalRisk === 'Medium' ? 5 : 0;
    regulatoryRisk = Math.min(100, regulatoryRisk);

    // WEIGHTED OVERALL RISK
    const overallRisk = Math.round(
        marketRisk * 0.22 +
        executionRisk * 0.25 +
        financialRisk * 0.20 +
        competitionRisk * 0.18 +
        regulatoryRisk * 0.15
    );

    // SUCCESS PROBABILITY (sigmoid transform)
    const successProbability = Math.round(100 / (1 + Math.exp(0.06 * (overallRisk - 50))));

    // SURVIVAL PROBABILITIES
    const survival12m = Math.round(successProbability * (runway >= 12 ? 1.0 : runway >= 6 ? 0.85 : 0.65));
    const survival24m = Math.round(survival12m * 0.80);
    const survival36m = Math.round(survival24m * 0.75);

    return {
        marketRisk, executionRisk, financialRisk, competitionRisk, regulatoryRisk,
        overallRisk, successProbability,
        survival: { m12: survival12m, m24: survival24m, m36: survival36m },
        classification: overallRisk < 30 ? 'LOW RISK' : overallRisk < 60 ? 'MODERATE RISK' : 'HIGH RISK'
    };
}

/**
 * Generate detailed human-readable explanations for every risk sub-score
 */
export function computeRiskExplanations(inputs: any, riskScores: any): RiskExplanation[] {
    const compCount = inputs.competitorCount || 0;
    const tSize = inputs.teamSize || 1;
    const runway = inputs.runwayMonths || 0;

    const explanations: RiskExplanation[] = [
        {
            dimension: 'Market Risk',
            score: riskScores.marketRisk,
            weight: 0.22,
            weightedContribution: Math.round(riskScores.marketRisk * 0.22),
            factors: [
                {
                    factor: 'Competitor Count',
                    impact: compCount > 100 ? 30 : compCount > 50 ? 20 : compCount > 20 ? 10 : 5,
                    reason: compCount > 50 ? `With ${compCount} competitors, the market is highly crowded making customer acquisition harder.` : compCount > 20 ? `Market has ${compCount} competitors — moderately competitive landscape.` : `Relatively few competitors (${compCount}) — good opportunity window.`
                },
                {
                    factor: 'Market Overlap',
                    impact: Math.round((inputs.marketOverlapPct || 0) * 0.3),
                    reason: `${inputs.marketOverlapPct || 0}% overlap with existing solutions means ${(inputs.marketOverlapPct || 0) > 50 ? 'significant differentiation is needed' : 'there is room for a unique positioning'}.`
                },
                {
                    factor: 'Market Timing',
                    impact: inputs.marketTiming === 'Late/declining' ? 25 : inputs.marketTiming === 'Too early' ? 15 : inputs.marketTiming === 'Peak' ? 10 : 0,
                    reason: inputs.marketTiming === 'Late/declining' ? 'Entering a declining market carries the highest timing risk.' : inputs.marketTiming === 'Too early' ? 'Being too early means the market might not be ready for your solution yet.' : inputs.marketTiming === 'Peak' ? 'Peak market conditions mean high competition but strong demand.' : 'Good market timing — entering at a growing phase.'
                },
                {
                    factor: 'Competition Aggression',
                    impact: inputs.competitionAggression === 'Tech giants' ? 15 : inputs.competitionAggression === 'Large corporates' ? 10 : 5,
                    reason: inputs.competitionAggression === 'Tech giants' ? 'Tech giants in the space can quickly clone features with massive budgets.' : inputs.competitionAggression === 'Large corporates' ? 'Large corporations are active — they have resources but move slowly.' : 'Competitors are mostly startups — more fair competitive landscape.'
                }
            ],
            summary: riskScores.marketRisk > 60 ? 'Your market risk is HIGH. The competitive landscape and timing present significant challenges.' : riskScores.marketRisk > 30 ? 'Your market risk is MODERATE. There are competitive pressures but also opportunities.' : 'Your market risk is LOW. The market conditions favor your entry.'
        },
        {
            dimension: 'Execution Risk',
            score: riskScores.executionRisk,
            weight: 0.25,
            weightedContribution: Math.round(riskScores.executionRisk * 0.25),
            factors: [
                {
                    factor: 'Technical Capability',
                    impact: ({ 'Low': 30, 'Medium': 20, 'High': 10, 'Expert': 5 } as Record<string, number>)[inputs.technicalCapability] || 20,
                    reason: inputs.technicalCapability === 'Expert' ? 'Your team has expert-level technical capability — minimal execution drag.' : inputs.technicalCapability === 'High' ? 'Strong technical skills reduce the risk of delivery failures.' : inputs.technicalCapability === 'Low' ? 'Low technical capability significantly increases execution risk — consider hiring.' : 'Medium technical capability — some execution risk remains.'
                },
                {
                    factor: 'Team Size',
                    impact: tSize < 2 ? 25 : tSize < 5 ? 15 : tSize < 10 ? 10 : 5,
                    reason: tSize < 2 ? `Only ${tSize} team member(s) — single points of failure across all functions.` : tSize < 5 ? `Team of ${tSize} — lean operation, but key-person risk exists.` : `Team of ${tSize} — adequate staffing for early-stage execution.`
                },
                {
                    factor: 'Infrastructure Complexity',
                    impact: ({ 'Low': 5, 'Medium': 15, 'High': 25, 'Very High': 35 } as Record<string, number>)[inputs.infrastructureComplexity] || 15,
                    reason: inputs.infrastructureComplexity === 'Very High' ? 'Very complex infrastructure means higher engineering costs and failure points.' : inputs.infrastructureComplexity === 'High' ? 'High infrastructure complexity adds operational overhead.' : 'Infrastructure complexity is manageable.'
                },
                {
                    factor: 'Product Stage',
                    impact: ({ 'Idea': 25, 'MVP': 15, 'Beta': 10, 'Launched': 5, 'Scaling': 0 } as Record<string, number>)[inputs.productDevelopmentStage] || 20,
                    reason: inputs.productDevelopmentStage === 'Idea' ? 'Still at idea stage — highest execution uncertainty.' : inputs.productDevelopmentStage === 'MVP' ? 'At MVP stage — product direction is set but market validation pending.' : inputs.productDevelopmentStage === 'Launched' || inputs.productDevelopmentStage === 'Scaling' ? 'Product is live — execution risk is significantly reduced.' : 'At Beta stage — good progress, nearing market readiness.'
                }
            ],
            summary: riskScores.executionRisk > 60 ? 'Execution risk is HIGH. Your team and infrastructure need strengthening to deliver reliably.' : riskScores.executionRisk > 30 ? 'Execution risk is MODERATE. Key hires and process improvements can reduce this.' : 'Execution risk is LOW. Your team and product maturity position you well.'
        },
        {
            dimension: 'Financial Risk',
            score: riskScores.financialRisk,
            weight: 0.20,
            weightedContribution: Math.round(riskScores.financialRisk * 0.20),
            factors: [
                {
                    factor: 'Runway Length',
                    impact: runway < 3 ? 40 : runway < 6 ? 30 : runway < 12 ? 15 : runway < 18 ? 5 : 0,
                    reason: runway < 6 ? `Only ${runway} months of runway — critically low. Immediate fundraising or cost-cutting needed.` : runway < 12 ? `${runway} months of runway — manageable but leaves limited margin for error.` : `${runway} months of runway — solid financial buffer.`
                },
                {
                    factor: 'Revenue Predictability',
                    impact: inputs.revenuePredictability === 'One-time' ? 20 : inputs.revenuePredictability === 'Seasonal' ? 15 : inputs.revenuePredictability === 'Mixed' ? 8 : 0,
                    reason: inputs.revenuePredictability === 'Recurring' ? 'Recurring revenue provides excellent cash flow predictability — investors love this.' : inputs.revenuePredictability === 'One-time' ? 'One-time revenue makes forecasting and survival planning very difficult.' : 'Revenue predictability could be improved for better planning.'
                },
                {
                    factor: 'Funding Stage',
                    impact: inputs.fundingStage === 'Pre-Revenue' ? 20 : inputs.fundingStage === 'Revenue (Early)' ? 10 : 5,
                    reason: inputs.fundingStage === 'Pre-Revenue' ? 'No revenue yet — entirely dependent on funding for survival.' : 'Some revenue traction — reduces dependency on external funding.'
                },
                {
                    factor: 'Unit Economics',
                    impact: inputs.unitEconomicsKnown === 'No' ? 15 : 0,
                    reason: inputs.unitEconomicsKnown === 'No' ? 'Not knowing your unit economics is a red flag for investors — calculate CAC and LTV immediately.' : 'Understanding unit economics shows financial maturity.'
                }
            ],
            summary: riskScores.financialRisk > 60 ? 'Financial risk is HIGH. Runway and revenue concerns need immediate attention.' : riskScores.financialRisk > 30 ? 'Financial risk is MODERATE. Focus on extending runway and improving revenue predictability.' : 'Financial risk is LOW. Your financial position is strong.'
        },
        {
            dimension: 'Competition Risk',
            score: riskScores.competitionRisk,
            weight: 0.18,
            weightedContribution: Math.round(riskScores.competitionRisk * 0.18),
            factors: [
                {
                    factor: 'Number of Competitors',
                    impact: compCount > 100 ? 35 : compCount > 50 ? 25 : compCount > 20 ? 15 : 5,
                    reason: compCount > 50 ? `${compCount} competitors — very crowded. You must have a clear moat.` : `${compCount} competitors — manageable competitive landscape.`
                },
                {
                    factor: 'Differentiation Type',
                    impact: ({ 'Technology Innovation': 5, 'Network Effects': 5, 'Proprietary Data': 8, 'Price': 20, 'UX/Design': 12, 'Niche Focus': 10, 'Other': 15 } as Record<string, number>)[inputs.differentiationType] || 15,
                    reason: inputs.differentiationType === 'Price' ? 'Competing on price is the weakest moat — easily copied by bigger players.' : inputs.differentiationType === 'Technology Innovation' || inputs.differentiationType === 'Network Effects' ? `Differentiating via ${inputs.differentiationType} is a strong, defensible moat.` : `${inputs.differentiationType || 'Your differentiation'} provides moderate defensibility.`
                },
                {
                    factor: 'Switching Cost',
                    impact: inputs.switchingCost === 'Low' ? 20 : inputs.switchingCost === 'Medium' ? 10 : 3,
                    reason: inputs.switchingCost === 'Low' ? 'Low switching costs mean customers can easily leave for competitors.' : inputs.switchingCost === 'High' ? 'High switching costs create customer lock-in — excellent for retention.' : 'Medium switching costs provide some customer stickiness.'
                }
            ],
            summary: riskScores.competitionRisk > 60 ? 'Competition risk is HIGH. Your differentiation and moat need significant strengthening.' : riskScores.competitionRisk > 30 ? 'Competition risk is MODERATE. Focus on deepening your competitive advantage.' : 'Competition risk is LOW. Your positioning is defensible.'
        },
        {
            dimension: 'Regulatory Risk',
            score: riskScores.regulatoryRisk,
            weight: 0.15,
            weightedContribution: Math.round(riskScores.regulatoryRisk * 0.15),
            factors: [
                {
                    factor: 'Industry Regulation Level',
                    impact: ({ 'Highly Regulated': 40, 'Moderately Regulated': 20, 'Low Regulation': 8, 'Unregulated': 0 } as Record<string, number>)[inputs.industryCategory] || 15,
                    reason: inputs.industryCategory === 'Highly Regulated' ? 'Your industry is heavily regulated — expect high compliance costs and time.' : inputs.industryCategory === 'Unregulated' ? 'Minimal regulatory burden — lower cost and faster go-to-market.' : 'Moderate regulation — plan for compliance but it won\'t be a blocker.'
                },
                {
                    factor: 'Data Sensitivity',
                    impact: ({ 'No user data': 0, 'Basic data': 5, 'Sensitive personal data': 20, 'Financial data': 30, 'Health data': 35, 'Biometric data': 40 } as Record<string, number>)[inputs.dataPrivacy] || 10,
                    reason: inputs.dataPrivacy === 'Health data' || inputs.dataPrivacy === 'Biometric data' || inputs.dataPrivacy === 'Financial data' ? `Handling ${inputs.dataPrivacy} requires strict compliance (GDPR, HIPAA, etc.) — plan for audits.` : inputs.dataPrivacy === 'No user data' ? 'No user data handling — minimal data privacy burden.' : 'Basic data handling requires standard privacy compliance.'
                },
                {
                    factor: 'Geopolitical Risk',
                    impact: inputs.geopoliticalRisk === 'Very High' ? 15 : inputs.geopoliticalRisk === 'High' ? 10 : inputs.geopoliticalRisk === 'Medium' ? 5 : 0,
                    reason: inputs.geopoliticalRisk === 'Very High' || inputs.geopoliticalRisk === 'High' ? 'Operating in regions with high geopolitical risk adds uncertainty to operations.' : 'Geopolitical risk is low for your operating regions.'
                }
            ],
            summary: riskScores.regulatoryRisk > 60 ? 'Regulatory risk is HIGH. Compliance must be a top priority before scaling.' : riskScores.regulatoryRisk > 30 ? 'Regulatory risk is MODERATE. Budget for compliance but it\'s manageable.' : 'Regulatory risk is LOW. Few regulatory hurdles expected.'
        }
    ];

    return explanations;
}

export function generateGrowthSimulation(inputs: any, sliderValues: any) {
    const months = 36;
    const results = { realistic: [] as any[], optimistic: [] as any[], pessimistic: [] as any[] };

    // Base monthly revenue
    const baseRevenue = inputs.monthlyRevenue || (inputs.targetRaiseAmount ? inputs.targetRaiseAmount * 0.02 : 10000);

    // Growth rates per phase
    const rates = {
        realistic: [sliderValues.phase1 || 0.08, sliderValues.phase2 || 0.12, sliderValues.phase3 || 0.15, sliderValues.phase4 || 0.10],
        optimistic: [(sliderValues.phase1 || 0.08) * 1.5, (sliderValues.phase2 || 0.12) * 1.4, (sliderValues.phase3 || 0.15) * 1.3, (sliderValues.phase4 || 0.10) * 1.2],
        pessimistic: [(sliderValues.phase1 || 0.08) * 0.4, (sliderValues.phase2 || 0.12) * 0.5, (sliderValues.phase3 || 0.15) * 0.6, (sliderValues.phase4 || 0.10) * 0.7]
    };

    (['realistic', 'optimistic', 'pessimistic'] as const).forEach(scenario => {
        let rev = baseRevenue;
        for (let m = 0; m < months; m++) {
            const phase = m < 6 ? 0 : m < 12 ? 1 : m < 24 ? 2 : 3;
            const adoptionFactor = sliderValues.adoptionMultiplier || 1.0;
            const churnFactor = 1 - (sliderValues.churnRate || 0.05);
            rev = rev * (1 + rates[scenario][phase]) * adoptionFactor * churnFactor;
            results[scenario].push({ month: m + 1, revenue: Math.round(rev) });
        }
    });

    return results;
}
