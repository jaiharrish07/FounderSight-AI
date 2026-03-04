import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layers, TrendingDown, TrendingUp, DollarSign, Shield,
    CloudLightning, Scale, Swords, Snowflake, ArrowRight, AlertTriangle
} from 'lucide-react';

interface ScenarioBuilderProps {
    inputs: any;
    riskScores: any;
}

interface Scenario {
    id: string;
    name: string;
    icon: any;
    color: string;
    description: string;
    multipliers: {
        valuationPct: number;
        riskPts: number;
        runwayMonths: number;
        burnRatePct: number;
        successProbPct: number;
    };
    narrative: string;
}

const SCENARIOS: Scenario[] = [
    {
        id: 'recession',
        name: 'Global Recession',
        icon: TrendingDown,
        color: '#EF4444',
        description: 'GDP contracts 3-5%, consumer spending drops, enterprise budgets frozen',
        multipliers: { valuationPct: -30, riskPts: 15, runwayMonths: -4, burnRatePct: 10, successProbPct: -20 },
        narrative: 'In a recession, VCs become risk-averse. Fundraising timelines double, valuations compress by 30-50%. Startups with positive unit economics survive; those burning cash face extinction.'
    },
    {
        id: 'regulation',
        name: 'Regulation Crackdown',
        icon: Scale,
        color: '#F59E0B',
        description: 'New data privacy laws, industry-specific licensing, compliance costs surge',
        multipliers: { valuationPct: -15, riskPts: 12, runwayMonths: -2, burnRatePct: 25, successProbPct: -10 },
        narrative: 'Regulatory tightening increases compliance costs and slows product velocity. First-movers who invested in compliance gain competitive advantage. Others face fines or market exit.'
    },
    {
        id: 'competitor',
        name: 'New Competitor Entry',
        icon: Swords,
        color: '#7C3AED',
        description: 'A well-funded competitor (Series C+) enters your exact space with 10x budget',
        multipliers: { valuationPct: -20, riskPts: 10, runwayMonths: -1, burnRatePct: 15, successProbPct: -15 },
        narrative: 'When a well-funded competitor enters, your differentiation is tested. Winners focus on a niche, deepen customer relationships, and out-execute on specific use cases rather than competing on features.'
    },
    {
        id: 'funding_winter',
        name: 'Funding Winter',
        icon: Snowflake,
        color: '#00D4FF',
        description: 'VC funding drops 60%, round sizes shrink, markdowns across the board',
        multipliers: { valuationPct: -40, riskPts: 18, runwayMonths: -5, burnRatePct: 5, successProbPct: -25 },
        narrative: 'A funding winter separates real businesses from hype. Companies with revenue survive. Those without must cut to profitability or die. Bridge rounds become the norm, and terms shift heavily toward investors.'
    }
];

export default function ScenarioBuilder({ inputs, riskScores }: ScenarioBuilderProps) {
    const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);

    const computeDelta = (scenario: Scenario) => {
        const currentRunway = inputs.runwayMonths || 12;
        const currentBurn = inputs.burnRate || 30000;
        const currentValuation = inputs.targetRaiseAmount ? inputs.targetRaiseAmount * 5 : 5000000;
        const currentSuccessProb = riskScores.successProbability || 50;

        const m = scenario.multipliers;

        return {
            valuation: {
                before: currentValuation,
                after: Math.round(currentValuation * (1 + m.valuationPct / 100)),
                delta: m.valuationPct,
                label: 'Valuation'
            },
            risk: {
                before: riskScores.overallRisk,
                after: Math.min(100, Math.max(0, riskScores.overallRisk + m.riskPts)),
                delta: m.riskPts,
                label: 'Risk Score'
            },
            runway: {
                before: currentRunway,
                after: Math.max(1, currentRunway + m.runwayMonths),
                delta: m.runwayMonths,
                label: 'Runway (mo)'
            },
            burn: {
                before: currentBurn,
                after: Math.round(currentBurn * (1 + m.burnRatePct / 100)),
                delta: m.burnRatePct,
                label: 'Burn Rate'
            },
            successProb: {
                before: currentSuccessProb,
                after: Math.max(0, Math.min(100, currentSuccessProb + m.successProbPct)),
                delta: m.successProbPct,
                label: 'Success Prob'
            }
        };
    };

    const deltas = activeScenario ? computeDelta(activeScenario) : null;

    const formatVal = (key: string, val: number) => {
        if (key === 'valuation') return `$${(val / 1000000).toFixed(1)}M`;
        if (key === 'burn') return `$${(val / 1000).toFixed(0)}k`;
        if (key === 'runway') return `${val}mo`;
        return `${val}${key === 'risk' ? '/100' : '%'}`;
    };

    return (
        <section id="scenarios" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border-cyan/30 pb-3 gap-4">
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                    <Layers className="text-accent-primary w-6 h-6" /> Scenario Builder
                </h2>
                <span className="text-xs text-text-muted bg-background-elevated px-3 py-1.5 rounded-full border border-border-cyan/20">
                    Stress-test your startup
                </span>
            </div>

            {/* Scenario Selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SCENARIOS.map(s => (
                    <motion.button
                        key={s.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveScenario(activeScenario?.id === s.id ? null : s)}
                        className={`glass-card p-4 text-left transition-all ${activeScenario?.id === s.id
                                ? 'border-2 shadow-lg'
                                : 'hover:border-accent-primary/30'
                            }`}
                        style={activeScenario?.id === s.id ? { borderColor: s.color, boxShadow: `0 0 20px ${s.color}30` } : {}}
                    >
                        <s.icon className="w-6 h-6 mb-2" style={{ color: s.color }} />
                        <h3 className="font-bold text-text-primary text-sm">{s.name}</h3>
                        <p className="text-[11px] text-text-muted mt-1 line-clamp-2">{s.description}</p>
                    </motion.button>
                ))}
            </div>

            {/* Delta View */}
            <AnimatePresence mode="wait">
                {activeScenario && deltas && (
                    <motion.div
                        key={activeScenario.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Impact Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {Object.entries(deltas).map(([key, d], idx) => (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                    className="glass-card p-4 text-center"
                                >
                                    <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-2">{d.label}</span>

                                    {/* Before → After */}
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <span className="text-text-muted text-sm font-mono line-through">{formatVal(key, d.before)}</span>
                                        <ArrowRight className="w-3 h-3 text-text-muted" />
                                        <span className="text-white text-sm font-mono font-bold">{formatVal(key, d.after)}</span>
                                    </div>

                                    {/* Delta badge */}
                                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${(key === 'risk' || key === 'burn')
                                            ? (d.delta > 0 ? 'bg-accent-danger/20 text-accent-danger' : 'bg-accent-success/20 text-accent-success')
                                            : (d.delta < 0 ? 'bg-accent-danger/20 text-accent-danger' : 'bg-accent-success/20 text-accent-success')
                                        }`}>
                                        {(key === 'risk' || key === 'burn')
                                            ? (d.delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)
                                            : (d.delta < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />)
                                        }
                                        {d.delta > 0 ? '+' : ''}{d.delta}{key === 'valuation' || key === 'burn' || key === 'successProb' ? '%' : key === 'runway' ? 'mo' : 'pts'}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Narrative */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card p-5 border-l-4"
                            style={{ borderLeftColor: activeScenario.color }}
                        >
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: activeScenario.color }} />
                                <div>
                                    <h4 className="font-bold text-text-primary text-sm mb-2">Impact Analysis: {activeScenario.name}</h4>
                                    <p className="text-sm text-text-secondary leading-relaxed">{activeScenario.narrative}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
