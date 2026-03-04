import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis,
    CartesianGrid, Tooltip as RechartsTooltip, Cell, ReferenceLine
} from 'recharts';
import {
    Target, CheckCircle2, AlertTriangle, TrendingUp, DollarSign, Globe
} from 'lucide-react';

interface CompetitorIntelProps {
    inputs: any;
    competitors: any[];
}

const QUADRANT_LABELS = [
    { x: 15, y: 85, label: 'Innovators', color: '#10B981' },
    { x: 85, y: 85, label: 'Leaders', color: '#00D4FF' },
    { x: 15, y: 15, label: 'Niche Players', color: '#F59E0B' },
    { x: 85, y: 15, label: 'Established', color: '#7C3AED' },
];

export default function CompetitorIntel({ inputs, competitors }: CompetitorIntelProps) {
    // Add the user's startup to the scatter data
    const scatterData = useMemo(() => {
        const data = (competitors || []).map((c: any) => ({
            x: c.market_share_percent || Math.random() * 60 + 10,
            y: c.innovation_score || Math.random() * 60 + 20,
            z: (c.market_share_percent || 20) * 10,
            name: c.name,
            threat: c.threat_level,
            funding: c.funding_stage,
            valuation: c.est_valuation,
            isYou: false
        }));

        // Add user's startup
        data.push({
            x: 15,
            y: 80,
            z: 200,
            name: inputs.name || 'Your Startup',
            threat: 'you',
            funding: inputs.fundingStage || 'Pre-Seed',
            valuation: inputs.targetRaiseAmount ? `$${(inputs.targetRaiseAmount / 1000000).toFixed(1)}M raise` : 'Early',
            isYou: true
        });

        return data;
    }, [competitors, inputs]);

    const threatColor = (threat: string) => {
        if (threat === 'you') return '#00D4FF';
        if (threat === 'high') return '#EF4444';
        if (threat === 'medium') return '#F59E0B';
        return '#10B981';
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const d = payload[0].payload;
        return (
            <div className="bg-background-card/95 backdrop-blur-md border border-border-cyan/30 rounded-xl p-4 shadow-xl min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: threatColor(d.threat) }} />
                    <h4 className="font-bold text-text-primary text-sm">{d.name}</h4>
                </div>
                {d.isYou && <span className="text-accent-primary text-[10px] font-bold uppercase block mb-2">← YOU ARE HERE</span>}
                <div className="space-y-1 text-xs text-text-secondary">
                    <p>Market Maturity: {d.x}%</p>
                    <p>Innovation Score: {d.y}</p>
                    <p>Funding: {d.funding}</p>
                    <p>Valuation: {d.valuation}</p>
                    {!d.isYou && <p className="capitalize">Threat: <span className="font-medium" style={{ color: threatColor(d.threat) }}>{d.threat}</span></p>}
                </div>
            </div>
        );
    };

    return (
        <section id="competition" className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-white border-b border-border-cyan/30 pb-3 flex items-center gap-3">
                <Target className="text-accent-primary w-6 h-6" /> Competitor Intelligence Engine
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 2×2 Matrix */}
                <div className="glass-card p-6 min-h-[400px]">
                    <h3 className="text-center font-bold text-text-secondary mb-2">Competitive Position Matrix</h3>
                    <p className="text-center text-xs text-text-muted mb-4">X: Market Maturity • Y: Innovation Score</p>

                    <ResponsiveContainer width="100%" height={320}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
                            <XAxis type="number" dataKey="x" name="Market Maturity" unit="%" stroke="#94A3B8" domain={[0, 100]} tick={{ fontSize: 11 }} />
                            <YAxis type="number" dataKey="y" name="Innovation" stroke="#94A3B8" domain={[0, 100]} tick={{ fontSize: 11 }} />
                            <ZAxis type="number" dataKey="z" range={[80, 500]} name="Size" />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <ReferenceLine x={50} stroke="#334155" strokeDasharray="4 4" />
                            <ReferenceLine y={50} stroke="#334155" strokeDasharray="4 4" />
                            <Scatter data={scatterData}>
                                {scatterData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={threatColor(entry.threat)}
                                        opacity={entry.isYou ? 1 : 0.65}
                                        stroke={entry.isYou ? '#00D4FF' : 'none'}
                                        strokeWidth={entry.isYou ? 3 : 0}
                                    />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>

                    {/* Quadrant labels */}
                    <div className="flex justify-between px-4 -mt-2">
                        {QUADRANT_LABELS.map((q, i) => (
                            <span key={i} className="text-[10px] font-bold uppercase tracking-wider" style={{ color: q.color + '90' }}>{q.label}</span>
                        ))}
                    </div>
                </div>

                {/* Competitor Cards */}
                <div className="space-y-3 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
                    {competitors?.map((comp: any, i: number) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="glass-card p-4 hover:border-accent-primary/50 transition-colors border-l-3"
                            style={{ borderLeftWidth: '3px', borderLeftColor: threatColor(comp.threat_level) }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-text-primary text-base leading-tight">{comp.name}</h4>
                                    <div className="flex gap-2 mt-1.5 flex-wrap">
                                        <span className="text-xs text-accent-secondary bg-accent-secondary/10 px-2 py-0.5 rounded border border-accent-secondary/20">{comp.funding_stage}</span>
                                        <span className="text-xs text-text-muted bg-background-primary px-2 py-0.5 rounded border border-border-cyan/20 flex items-center gap-1"><Globe className="w-3 h-3" />{comp.hq_country}</span>
                                        {comp.est_valuation && <span className="text-xs text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded border border-accent-gold/20 flex items-center gap-1"><DollarSign className="w-3 h-3" />{comp.est_valuation}</span>}
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border flex-shrink-0 ${comp.threat_level === 'high' ? 'text-accent-danger border-accent-danger/50 bg-accent-danger/10' :
                                        comp.threat_level === 'medium' ? 'text-accent-warning border-accent-warning/50 bg-accent-warning/10' :
                                            'text-accent-success border-accent-success/50 bg-accent-success/10'
                                    }`}>
                                    {comp.threat_level} threat
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <div className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0 mt-0.5" />
                                    <span className="text-text-secondary text-xs">{comp.key_strength}</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <AlertTriangle className="w-4 h-4 text-accent-danger flex-shrink-0 mt-0.5" />
                                    <span className="text-text-secondary text-xs">{comp.key_weakness}</span>
                                </div>
                            </div>

                            {/* Mini bar for market share & innovation */}
                            <div className="flex gap-4 mt-3">
                                <div className="flex-1">
                                    <div className="flex justify-between text-[10px] text-text-muted mb-1">
                                        <span>Market Share</span><span>{comp.market_share_percent}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-background-elevated overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${comp.market_share_percent}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-full rounded-full bg-accent-primary" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-[10px] text-text-muted mb-1">
                                        <span>Innovation</span><span>{comp.innovation_score}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-background-elevated overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${comp.innovation_score}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-full rounded-full bg-accent-secondary" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
