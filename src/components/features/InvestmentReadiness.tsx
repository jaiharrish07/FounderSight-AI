import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, BarChart3, Target, Users, FileText, DollarSign, Edit3 } from 'lucide-react';

interface InvestmentReadinessProps {
    inputs: any;
    riskScores: any;
    aiAnalysis?: any;
}

interface Pillar {
    name: string;
    weight: number;
    icon: any;
    color: string;
    score: number;
}

function computePillars(inputs: any, riskScores: any, overrides: { mrr: number; users: number; lois: number }): Pillar[] {
    // Product (20%) — inverse of execution risk + product stage bonus
    const productStageBonus = { 'Scaling': 30, 'Launched': 20, 'Beta': 10, 'MVP': 5, 'Idea': 0 } as Record<string, number>;
    const productScore = Math.min(100, Math.max(0,
        (100 - riskScores.executionRisk) * 0.7 + (productStageBonus[inputs.productDevelopmentStage] || 5)
    ));

    // Market (20%) — inverse of market risk
    const marketScore = Math.min(100, Math.max(0, 100 - riskScores.marketRisk));

    // Traction (25%) — based on MRR, users, and financial metrics
    let tractionScore = 20; // base
    if (overrides.mrr > 50000) tractionScore += 40;
    else if (overrides.mrr > 10000) tractionScore += 25;
    else if (overrides.mrr > 1000) tractionScore += 10;
    if (overrides.users > 10000) tractionScore += 25;
    else if (overrides.users > 1000) tractionScore += 15;
    else if (overrides.users > 100) tractionScore += 8;
    if (overrides.lois > 3) tractionScore += 15;
    else if (overrides.lois > 0) tractionScore += 8;
    tractionScore = Math.min(100, tractionScore);

    // Narrative (20%) — team + differentiation
    let narrativeScore = 30;
    if ((inputs.teamSize || 1) >= 5) narrativeScore += 15;
    if (['Technology Innovation', 'Proprietary Data', 'Network Effects'].includes(inputs.differentiationType)) narrativeScore += 20;
    else narrativeScore += 8;
    if ((inputs.runwayMonths || 6) >= 12) narrativeScore += 15;
    narrativeScore += (100 - riskScores.competitionRisk) * 0.2;
    narrativeScore = Math.min(100, Math.max(0, narrativeScore));

    // Financials (15%) — inverse of financial risk + runway bonus
    let financialsScore = Math.max(0, 100 - riskScores.financialRisk);
    if (overrides.mrr > 0) financialsScore = Math.min(100, financialsScore + 10);
    financialsScore = Math.min(100, Math.max(0, financialsScore));

    return [
        { name: 'Product', weight: 0.20, icon: Target, color: '#00D4FF', score: Math.round(productScore) },
        { name: 'Market', weight: 0.20, icon: BarChart3, color: '#7C3AED', score: Math.round(marketScore) },
        { name: 'Traction', weight: 0.25, icon: Users, color: '#10B981', score: Math.round(tractionScore) },
        { name: 'Narrative', weight: 0.20, icon: FileText, color: '#F59E0B', score: Math.round(narrativeScore) },
        { name: 'Financials', weight: 0.15, icon: DollarSign, color: '#EF4444', score: Math.round(financialsScore) },
    ];
}

export default function InvestmentReadiness({ inputs, riskScores, aiAnalysis }: InvestmentReadinessProps) {
    const [showInputs, setShowInputs] = useState(false);
    const [overrides, setOverrides] = useState({ mrr: 0, users: 0, lois: 0 });

    const pillars = useMemo(() => computePillars(inputs, riskScores, overrides), [inputs, riskScores, overrides]);
    const overallScore = useMemo(() =>
        Math.round(pillars.reduce((sum, p) => sum + p.score * p.weight, 0)),
        [pillars]
    );

    const gradeLabel = overallScore >= 80 ? 'Investor Ready' : overallScore >= 60 ? 'Nearly Ready' : overallScore >= 40 ? 'Needs Work' : 'Not Ready';
    const gradeColor = overallScore >= 80 ? '#10B981' : overallScore >= 60 ? '#00D4FF' : overallScore >= 40 ? '#F59E0B' : '#EF4444';

    return (
        <section id="readiness" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border-cyan/30 pb-3 gap-4">
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                    <Award className="w-6 h-6" style={{ color: gradeColor }} /> Investment Readiness Score
                </h2>
                <button
                    onClick={() => setShowInputs(!showInputs)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-background-elevated border border-border-cyan/20 text-text-secondary hover:text-white transition-all"
                >
                    <Edit3 className="w-4 h-4" />
                    {showInputs ? 'Hide Inputs' : 'Add Traction Data'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Ring */}
                <div className="glass-card p-6 flex flex-col items-center justify-center">
                    <div className="relative w-40 h-40">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                            <motion.circle
                                cx="50" cy="50" r="42" fill="none"
                                stroke={gradeColor}
                                strokeWidth="6" strokeLinecap="round"
                                strokeDasharray={`${overallScore * 2.64} 264`}
                                initial={{ strokeDasharray: '0 264' }}
                                animate={{ strokeDasharray: `${overallScore * 2.64} 264` }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                key={overallScore}
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                className="text-4xl font-mono font-bold text-white"
                            >
                                {overallScore}
                            </motion.span>
                            <span className="text-[11px] text-text-muted uppercase tracking-wider mt-1">/ 100</span>
                        </div>
                    </div>
                    <motion.span
                        key={gradeLabel}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm font-bold mt-4 px-4 py-1.5 rounded-full border"
                        style={{ color: gradeColor, borderColor: gradeColor + '50', backgroundColor: gradeColor + '15' }}
                    >
                        {gradeLabel}
                    </motion.span>
                </div>

                {/* Pillar Bars */}
                <div className="lg:col-span-2 glass-card p-6 space-y-4">
                    <h3 className="font-bold text-text-primary text-sm mb-4">5-Pillar Breakdown</h3>
                    {pillars.map((pillar, idx) => (
                        <div key={pillar.name}>
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <pillar.icon className="w-4 h-4" style={{ color: pillar.color }} />
                                    <span className="text-sm text-text-primary font-medium">{pillar.name}</span>
                                    <span className="text-[10px] text-text-muted">({(pillar.weight * 100)}%)</span>
                                </div>
                                <span className="text-sm font-mono font-bold" style={{ color: pillar.color }}>{pillar.score}</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-background-elevated overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pillar.score}%` }}
                                    transition={{ duration: 0.8, delay: idx * 0.15, ease: 'easeOut' }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: pillar.color }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Optional Inputs */}
            {showInputs && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-card p-6"
                >
                    <h3 className="font-bold text-text-primary text-sm mb-4 flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-accent-primary" /> Add Your Traction Metrics
                    </h3>
                    <p className="text-xs text-text-muted mb-4">These inputs will refine your Traction and Financials pillar scores in real-time.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs text-text-muted mb-1 block">Monthly Recurring Revenue ($)</label>
                            <input
                                type="number"
                                value={overrides.mrr || ''}
                                onChange={e => setOverrides(o => ({ ...o, mrr: parseInt(e.target.value) || 0 }))}
                                placeholder="e.g. 10000"
                                className="input-field text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-text-muted mb-1 block">Active Users</label>
                            <input
                                type="number"
                                value={overrides.users || ''}
                                onChange={e => setOverrides(o => ({ ...o, users: parseInt(e.target.value) || 0 }))}
                                placeholder="e.g. 1500"
                                className="input-field text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-text-muted mb-1 block">Letters of Intent (LOIs)</label>
                            <input
                                type="number"
                                value={overrides.lois || ''}
                                onChange={e => setOverrides(o => ({ ...o, lois: parseInt(e.target.value) || 0 }))}
                                placeholder="e.g. 3"
                                className="input-field text-sm"
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </section>
    );
}
