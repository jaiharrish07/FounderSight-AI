import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ReferenceLine
} from 'recharts';
import { Users, Megaphone, Clock, Tag, TrendingUp, TrendingDown, DollarSign, Activity, Info, X, HelpCircle } from 'lucide-react';
import { formatCurrency, formatCurrencyScaled, getCurrencySymbol } from '../../utils/Localization';

interface GrowthSimPanelProps {
    inputs: any;
    riskScores: any;
}

interface SimSliders {
    teamSize: number;
    marketingSpend: number;
    productDelay: number;
    pricingChange: number;
}

// Tooltip component
function MetricTooltip({ title, description, isOpen, onClose }: { title: string; description: string; isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-30 top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-background-card border border-border-cyan/50 rounded-xl p-4 shadow-[0_0_30px_rgba(0,212,255,0.15)]"
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-accent-primary text-sm">{title}</h4>
                <button onClick={onClose} className="p-0.5 hover:text-white text-text-muted">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-background-card border-l border-t border-border-cyan/50 rotate-45" />
        </motion.div>
    );
}

function computeSimulation(inputs: any, riskScores: any, sliders: SimSliders) {
    const baseRunway = inputs.runwayMonths || 12;
    const baseBurn = inputs.burnRate || 30000;
    const baseRisk = riskScores.overallRisk;
    const baseRevenue = inputs.monthlyRevenue || 0;

    // Team size impact: more people = higher burn but faster execution
    const teamMultiplier = sliders.teamSize / (inputs.teamSize || 3);
    const teamBurnIncrease = (sliders.teamSize - (inputs.teamSize || 3)) * 8000;
    const teamRiskDelta = sliders.teamSize >= 5 ? -5 : sliders.teamSize <= 2 ? 8 : 0;

    // Marketing spend impact: increases burn, increases growth
    const marketingGrowthMultiplier = 1 + (sliders.marketingSpend / 50000) * 0.3;
    const marketingBurnIncrease = sliders.marketingSpend;

    // Product delay impact: more burn, delayed revenue
    const delayBurnIncrease = sliders.productDelay * baseBurn * 0.3;
    const delayRiskDelta = sliders.productDelay * 3;

    // Pricing change impact
    const pricingRevenueMultiplier = 1 + (sliders.pricingChange / 100);
    const pricingRiskDelta = sliders.pricingChange > 30 ? 5 : sliders.pricingChange < -20 ? 3 : 0;

    // Compute outputs
    const newBurn = baseBurn + teamBurnIncrease + marketingBurnIncrease + delayBurnIncrease;
    const totalFunding = baseBurn * baseRunway;
    const newRunway = Math.max(1, Math.round(totalFunding / newBurn));

    const riskDelta = teamRiskDelta + delayRiskDelta + pricingRiskDelta;
    const newRisk = Math.max(0, Math.min(100, baseRisk + riskDelta));

    // Break-even calculation — more conservative growth (5% base)
    const monthlyGrowthRate = 0.05 * teamMultiplier * marketingGrowthMultiplier;
    let breakEvenMonth = 0;
    let rev = (baseRevenue || baseBurn * 0.1) * pricingRevenueMultiplier;
    for (let m = 1; m <= 36; m++) {
        rev = rev * (1 + monthlyGrowthRate);
        if (m <= sliders.productDelay) rev = (baseRevenue || baseBurn * 0.05) * 0.5;
        if (rev >= newBurn && breakEvenMonth === 0) {
            breakEvenMonth = m;
        }
    }

    // Generate chart data
    const chartData = [];
    let chartRev = (baseRevenue || baseBurn * 0.1) * pricingRevenueMultiplier;
    let baselineRev = baseRevenue || baseBurn * 0.1;
    for (let m = 1; m <= 24; m++) {
        if (m <= sliders.productDelay) {
            chartRev = (baseRevenue || baseBurn * 0.05) * 0.5 * pricingRevenueMultiplier;
        } else {
            chartRev = chartRev * (1 + monthlyGrowthRate);
        }
        baselineRev = baselineRev * 1.05;
        chartData.push({
            month: m,
            simulated: Math.round(chartRev),
            baseline: Math.round(baselineRev),
            burn: Math.round(newBurn)
        });
    }

    return {
        runway: newRunway,
        riskDelta,
        newRisk,
        breakEvenMonth: breakEvenMonth || null,
        newBurn,
        chartData
    };
}

// Metric explanations
const METRIC_INFO: Record<string, { title: string; description: string }> = {
    runway: {
        title: 'Runway (Months)',
        description: 'How many months your startup can survive at the current (simulated) burn rate before running out of cash. Calculated as: Total Available Funds ÷ Monthly Burn Rate. A runway below 6 months is critical — you should be fundraising immediately. 12-18 months is healthy.'
    },
    riskShift: {
        title: 'Risk Shift (Points)',
        description: 'How much your overall risk score (0-100) changes based on the scenario levers you\'ve adjusted. Negative values (green) mean you\'re reducing risk. Positive values (red) mean you\'re increasing risk. Factors: larger team reduces risk (-5 pts), product delays increase risk (+3 pts per month), aggressive pricing can increase risk (+5 pts).'
    },
    breakEven: {
        title: 'Break-Even Point',
        description: 'The projected month when your simulated revenue will equal or exceed your monthly burn rate — meaning you stop losing money. "M12" means month 12. "—" means you won\'t break even within 36 months at current rates. This is a key metric investors look at to assess sustainability.'
    },
    moBurn: {
        title: 'Monthly Burn Rate',
        description: 'Your total monthly cash outflow (expenses). This includes base operating costs, team salaries, marketing spend, and any additional costs from product delays. Lower burn = longer runway. Compare this to your current burn to understand the impact of your scenario adjustments.'
    }
};

const SLIDER_DESCRIPTIONS: Record<string, string> = {
    teamSize: 'Each additional person adds ~$8K/month to burn but improves execution speed. Teams ≥5 reduce risk by 5 points.',
    marketingSpend: 'Monthly marketing budget. Higher spend increases customer acquisition growth rate but directly adds to burn rate.',
    productDelay: 'Months of product delay reduce revenue during that period and add 30% of base burn as idle costs. Each month adds 3 risk points.',
    pricingChange: 'Adjusting prices up can improve revenue but prices >+30% may add 5 risk points from customer churn. Dropping prices >-20% also adds risk.'
};

export default function GrowthSimPanel({ inputs, riskScores }: GrowthSimPanelProps) {
    const [sliders, setSliders] = useState<SimSliders>({
        teamSize: inputs.teamSize || 3,
        marketingSpend: 10000,
        productDelay: 0,
        pricingChange: 0
    });
    const [openTooltip, setOpenTooltip] = useState<string | null>(null);

    const sim = useMemo(() => computeSimulation(inputs, riskScores, sliders), [inputs, riskScores, sliders]);

    const sliderConfig = [
        { key: 'teamSize' as const, label: 'Team Size', icon: Users, min: 1, max: 20, step: 1, format: (v: number) => `${v} people`, color: '#00D4FF' },
        { key: 'marketingSpend' as const, label: 'Marketing Spend', icon: Megaphone, min: 0, max: 50000, step: 1000, format: (v: number) => `$${(v / 1000).toFixed(0)}k/mo`, color: '#7C3AED' },
        { key: 'productDelay' as const, label: 'Product Delay', icon: Clock, min: 0, max: 6, step: 1, format: (v: number) => `${v} months`, color: '#F59E0B' },
        { key: 'pricingChange' as const, label: 'Pricing Change', icon: Tag, min: -50, max: 50, step: 5, format: (v: number) => `${v > 0 ? '+' : ''}${v}%`, color: '#10B981' },
    ];

    const currencySymbol = getCurrencySymbol(inputs.country);

    return (
        <section id="growth" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border-cyan/30 pb-3 gap-4">
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                    <TrendingUp className="text-accent-primary w-6 h-6" /> Growth Simulation Engine
                </h2>
                <span className="text-xs text-text-muted bg-background-elevated px-3 py-1.5 rounded-full border border-border-cyan/20">
                    Drag sliders to simulate scenarios
                </span>
            </div>

            {/* Assumptions disclosure */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-accent-secondary/5 border border-accent-secondary/20">
                <Info className="w-4 h-4 text-accent-secondary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-text-secondary">
                    <strong>Simulation Assumptions:</strong> Base monthly burn: <span className="font-mono text-text-primary">{currencySymbol}{(inputs.burnRate || 30000).toLocaleString()}</span> •
                    Base revenue: <span className="font-mono text-text-primary">{currencySymbol}{(inputs.monthlyRevenue || 0).toLocaleString()}</span> •
                    Current runway: <span className="font-mono text-text-primary">{inputs.runwayMonths || 12} months</span> •
                    Growth model: Conservative 5% MoM base rate, adjusted by your lever inputs.
                </p>
            </div>

            {/* Output Metrics with Tooltips */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    key={sim.runway}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="glass-card p-4 text-center border-t-2 border-accent-primary relative"
                >
                    <button
                        onClick={() => setOpenTooltip(openTooltip === 'runway' ? null : 'runway')}
                        className="absolute top-2 right-2 p-1 text-text-muted hover:text-accent-primary transition-colors"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    <MetricTooltip
                        title={METRIC_INFO.runway.title}
                        description={METRIC_INFO.runway.description}
                        isOpen={openTooltip === 'runway'}
                        onClose={() => setOpenTooltip(null)}
                    />
                    <span className="text-3xl font-mono font-bold text-white">{sim.runway}</span>
                    <span className="text-xs text-text-muted mt-1 block uppercase">Runway (months)</span>
                    <span className="text-[10px] text-text-muted mt-0.5 block italic">How long your cash lasts</span>
                    <span className={`text-[11px] mt-1 block ${sim.runway < (inputs.runwayMonths || 12) ? 'text-accent-danger' : 'text-accent-success'}`}>
                        vs {inputs.runwayMonths || 12}mo current
                    </span>
                </motion.div>

                <motion.div
                    key={sim.riskDelta}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className={`glass-card p-4 text-center border-t-2 relative ${sim.riskDelta > 0 ? 'border-accent-danger' : sim.riskDelta < 0 ? 'border-accent-success' : 'border-accent-warning'}`}
                >
                    <button
                        onClick={() => setOpenTooltip(openTooltip === 'riskShift' ? null : 'riskShift')}
                        className="absolute top-2 right-2 p-1 text-text-muted hover:text-accent-primary transition-colors"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    <MetricTooltip
                        title={METRIC_INFO.riskShift.title}
                        description={METRIC_INFO.riskShift.description}
                        isOpen={openTooltip === 'riskShift'}
                        onClose={() => setOpenTooltip(null)}
                    />
                    <div className="flex items-center justify-center gap-1">
                        {sim.riskDelta > 0 ? <TrendingUp className="w-5 h-5 text-accent-danger" /> : sim.riskDelta < 0 ? <TrendingDown className="w-5 h-5 text-accent-success" /> : null}
                        <span className={`text-3xl font-mono font-bold ${sim.riskDelta > 0 ? 'text-accent-danger' : sim.riskDelta < 0 ? 'text-accent-success' : 'text-white'}`}>
                            {sim.riskDelta > 0 ? '+' : ''}{sim.riskDelta}
                        </span>
                    </div>
                    <span className="text-xs text-text-muted mt-1 block uppercase">Risk Shift (pts)</span>
                    <span className="text-[10px] text-text-muted mt-0.5 block italic">Change in risk score</span>
                    <span className="text-[11px] text-text-muted mt-1 block">New: {sim.newRisk}/100</span>
                </motion.div>

                <motion.div
                    key={sim.breakEvenMonth}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="glass-card p-4 text-center border-t-2 border-accent-success relative"
                >
                    <button
                        onClick={() => setOpenTooltip(openTooltip === 'breakEven' ? null : 'breakEven')}
                        className="absolute top-2 right-2 p-1 text-text-muted hover:text-accent-primary transition-colors"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    <MetricTooltip
                        title={METRIC_INFO.breakEven.title}
                        description={METRIC_INFO.breakEven.description}
                        isOpen={openTooltip === 'breakEven'}
                        onClose={() => setOpenTooltip(null)}
                    />
                    <span className="text-3xl font-mono font-bold text-accent-success">
                        {sim.breakEvenMonth ? `M${sim.breakEvenMonth}` : '—'}
                    </span>
                    <span className="text-xs text-text-muted mt-1 block uppercase">Break-even</span>
                    <span className="text-[10px] text-text-muted mt-0.5 block italic">When revenue ≥ burn</span>
                    <span className="text-[11px] text-text-muted mt-1 block">
                        {sim.breakEvenMonth ? `${sim.breakEvenMonth} months out` : 'Not within 36mo'}
                    </span>
                </motion.div>

                <motion.div
                    key={sim.newBurn}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="glass-card p-4 text-center border-t-2 border-accent-warning relative"
                >
                    <button
                        onClick={() => setOpenTooltip(openTooltip === 'moBurn' ? null : 'moBurn')}
                        className="absolute top-2 right-2 p-1 text-text-muted hover:text-accent-primary transition-colors"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    <MetricTooltip
                        title={METRIC_INFO.moBurn.title}
                        description={METRIC_INFO.moBurn.description}
                        isOpen={openTooltip === 'moBurn'}
                        onClose={() => setOpenTooltip(null)}
                    />
                    <span className="text-2xl font-mono font-bold text-accent-warning">{formatCurrencyScaled(sim.newBurn, inputs.country)}</span>
                    <span className="text-xs text-text-muted mt-1 block uppercase">Mo. Burn</span>
                    <span className="text-[10px] text-text-muted mt-0.5 block italic">Total monthly expenses</span>
                    <span className={`text-[11px] mt-1 block ${sim.newBurn > (inputs.burnRate || 30000) ? 'text-accent-danger' : 'text-accent-success'}`}>
                        vs {formatCurrencyScaled(inputs.burnRate || 30000, inputs.country)} current
                    </span>
                </motion.div>
            </div>

            <div className="glass-card p-6 border-accent-secondary/30">
                {/* Chart */}
                <h3 className="text-center font-bold text-text-secondary mb-2">24-Month Revenue Simulation</h3>
                <p className="text-center text-xs text-text-muted mb-4">
                    <span className="inline-flex items-center gap-1.5 mr-4"><span className="w-3 h-0.5 bg-[#00D4FF] inline-block rounded"></span> Simulated Revenue</span>
                    <span className="inline-flex items-center gap-1.5 mr-4"><span className="w-3 h-0.5 bg-[#7C3AED] inline-block rounded border-dashed"></span> Baseline (5% MoM)</span>
                    <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#EF4444] inline-block rounded border-dashed"></span> Burn Line</span>
                </p>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sim.chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" vertical={false} />
                            <XAxis dataKey="month" stroke="#94A3B8" tick={{ fontSize: 12 }} tickFormatter={val => `M${val}`} />
                            <YAxis stroke="#94A3B8" tickFormatter={val => formatCurrencyScaled(val, inputs.country)} tick={{ fontSize: 12 }} />
                            <RechartsTooltip
                                formatter={(value: any, name?: string) => [formatCurrency(value, inputs.country), name === 'simulated' ? 'Simulated Revenue' : name === 'baseline' ? 'Baseline Revenue' : 'Burn Rate']}
                                labelFormatter={label => `Month ${label}`}
                                contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '8px', color: '#fff' }}
                            />
                            <ReferenceLine y={sim.newBurn} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Burn Line', position: 'insideTopLeft', fill: '#EF4444', fontSize: 11 }} />
                            {sim.breakEvenMonth && <ReferenceLine x={sim.breakEvenMonth} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Break-even', position: 'insideTopLeft', fill: '#10B981', fontSize: 11 }} />}
                            <Area type="monotone" dataKey="baseline" stroke="#7C3AED" fill="url(#colorBase)" strokeWidth={2} strokeDasharray="5 5" />
                            <Area type="monotone" dataKey="simulated" stroke="#00D4FF" fill="url(#colorSim)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Sliders with descriptions */}
                <div className="mt-8 pt-6 border-t border-border-cyan/20">
                    <h4 className="flex items-center gap-2 font-bold mb-5 text-accent-secondary"><Activity className="w-5 h-5" /> Scenario Levers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sliderConfig.map(({ key, label, icon: Icon, min, max, step, format, color }) => (
                            <div key={key}>
                                <label className="flex justify-between text-xs text-text-muted mb-1">
                                    <span className="flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" style={{ color }} />{label}</span>
                                    <span className="font-mono text-text-primary font-medium">{format(sliders[key])}</span>
                                </label>
                                <p className="text-[10px] text-text-muted/70 mb-2 leading-relaxed">{SLIDER_DESCRIPTIONS[key]}</p>
                                <input
                                    type="range"
                                    min={min}
                                    max={max}
                                    step={step}
                                    value={sliders[key]}
                                    onChange={e => setSliders(s => ({ ...s, [key]: parseFloat(e.target.value) }))}
                                    className="w-full h-1.5 bg-background-primary rounded appearance-none cursor-pointer"
                                    style={{ accentColor: color }}
                                />
                                <div className="flex justify-between text-[10px] text-text-muted mt-1">
                                    <span>{format(min)}</span>
                                    <span>{format(max)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
