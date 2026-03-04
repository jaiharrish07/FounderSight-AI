import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XOctagon, AlertTriangle, ChevronDown, ChevronUp, Flame, Shield,
    CheckCircle2, Skull, Zap
} from 'lucide-react';

interface RejectionReasonsProps {
    inputs: any;
    riskScores: any;
    aiAnalysis?: any;
}

interface RejectionItem {
    reason: string;
    severity: 'red' | 'yellow' | 'green';
    fix: string[];
    comparableFailure: { name: string; detail: string };
    brutalVersion: string;
}

function generateRejections(inputs: any, riskScores: any): RejectionItem[] {
    const items: RejectionItem[] = [];

    // 1. Runway/Financial
    if ((inputs.runwayMonths || 6) < 12) {
        items.push({
            reason: `Only ${inputs.runwayMonths || 6} months of runway suggests you'll be fundraising in panic mode within weeks.`,
            severity: 'red',
            fix: ['Cut burn rate by 30% immediately — eliminate non-essential hires', 'Secure a bridge round from existing investors before approaching new ones'],
            comparableFailure: { name: 'Quibi', detail: '$1.75B burned in 6 months — ran out before finding PMF' },
            brutalVersion: `${inputs.runwayMonths || 6} months? That's not a runway, it's a plank. No serious VC will fund a company one crisis away from death.`
        });
    } else {
        items.push({
            reason: 'Your burn-to-revenue ratio suggests unsustainable unit economics at scale.',
            severity: 'yellow',
            fix: ['Focus on achieving positive unit economics on a per-customer basis', 'Reduce CAC by shifting from paid to organic and partnership channels'],
            comparableFailure: { name: 'WeWork', detail: 'Negative unit economics at $47B valuation — imploded during IPO' },
            brutalVersion: 'You\'re burning money like it grows on trees. It doesn\'t. VCs have PTSD from 2022.'
        });
    }

    // 2. Competition
    if (riskScores.competitionRisk > 50) {
        items.push({
            reason: `Competition risk of ${riskScores.competitionRisk}/100 means your market is a bloodbath with no clear differentiation.`,
            severity: riskScores.competitionRisk > 70 ? 'red' : 'yellow',
            fix: ['Narrow to a defensible niche before expanding — own one segment completely', 'Build proprietary data moats that competitors cannot replicate easily'],
            comparableFailure: { name: 'Homejoy', detail: 'Zero switching costs in home cleaning — customers fled to cheaper alternatives' },
            brutalVersion: `${riskScores.competitionRisk}/100 competition risk? You're bringing a knife to a gunfight. Why would anyone bet on you when 50 clones exist?`
        });
    } else {
        items.push({
            reason: 'Your competitive positioning lacks a clear, defensible moat against well-funded entrants.',
            severity: 'yellow',
            fix: ['Identify and articulate your unique unfair advantage clearly', 'Secure strategic partnerships that create switching costs for customers'],
            comparableFailure: { name: 'Vine', detail: 'No moat against Instagram/TikTok — acquired then shut down' },
            brutalVersion: 'No moat = no mercy. The moment a Series B startup copies your feature, you\'re toast.'
        });
    }

    // 3. Team/Execution
    if (riskScores.executionRisk > 55) {
        items.push({
            reason: `Your execution risk score of ${riskScores.executionRisk}/100 signals the team may not be equipped to deliver on the vision.`,
            severity: riskScores.executionRisk > 70 ? 'red' : 'yellow',
            fix: ['Hire a senior operator with scaling experience (VP Eng or COO)', 'Implement sprint-based delivery with measurable 2-week milestones'],
            comparableFailure: { name: 'Theranos', detail: 'Brilliant vision, catastrophic execution gap — team couldn\'t build the tech' },
            brutalVersion: `Execution risk at ${riskScores.executionRisk}? Great ideas are cheap. Execution is everything. Your team needs a serious upgrade.`
        });
    } else {
        items.push({
            reason: 'Key-person dependency creates a single point of failure that spooks institutional investors.',
            severity: 'yellow',
            fix: ['Document all critical processes and distribute knowledge across the team', 'Bring on at least one senior hire who can run operations independently'],
            comparableFailure: { name: 'Jawbone', detail: 'Founder-dependent decisions led to product pivots that destroyed $3B in value' },
            brutalVersion: 'If you get hit by a bus tomorrow, does this company survive? No? Then it\'s not investable.'
        });
    }

    // 4. Market
    if (riskScores.marketRisk > 45) {
        items.push({
            reason: `Market risk of ${riskScores.marketRisk}/100 suggests either bad timing, wrong market size, or both.`,
            severity: riskScores.marketRisk > 65 ? 'red' : 'yellow',
            fix: ['Validate TAM with bottom-up analysis, not top-down fantasies', 'Talk to 50+ potential customers to confirm willingness to pay'],
            comparableFailure: { name: 'Segway', detail: 'Revolutionary tech, zero market demand — consumers didn\'t need it' },
            brutalVersion: `Your market analysis is a fairy tale. Show me signed LOIs or customers with credit cards out, not TAM slides.`
        });
    } else {
        items.push({
            reason: 'Your go-to-market strategy lacks the specificity needed to convince a data-driven investor.',
            severity: 'green',
            fix: ['Create a detailed 90-day GTM plan with specific channels, CAC targets, and conversion funnels', 'Show at least 3 customer case studies with concrete ROI metrics'],
            comparableFailure: { name: 'Google+', detail: 'Even Google couldn\'t brute-force a social network without organic GTM' },
            brutalVersion: 'Your GTM slide says "enterprise sales" — that\'s not a strategy, that\'s a prayer.'
        });
    }

    // 5. Regulatory/Compliance
    if (riskScores.regulatoryRisk > 40) {
        items.push({
            reason: `Regulatory risk of ${riskScores.regulatoryRisk}/100 in ${inputs.industry} means potential compliance landmines ahead.`,
            severity: riskScores.regulatoryRisk > 60 ? 'red' : 'yellow',
            fix: ['Hire a compliance advisor and begin SOC-2/GDPR readiness immediately', 'Build compliance into the product architecture, not as an afterthought'],
            comparableFailure: { name: 'Zenefits', detail: 'Bypassed insurance licensing requirements — $7M penalty, CEO fired' },
            brutalVersion: `Regulators don't care about your pitch deck. Non-compliance doesn't just kill your round — it kills your company.`
        });
    } else {
        items.push({
            reason: 'Your narrative doesn\'t compellingly answer the "why now?" question that every VC asks.',
            severity: 'green',
            fix: ['Anchor your timing thesis to a specific macro trend, regulation change, or tech breakthrough', 'Show evidence of recent market pull (inbound demand, waitlist, organic traction)'],
            comparableFailure: { name: 'Webvan', detail: 'Grocery delivery 15 years too early — $830M in losses before market was ready' },
            brutalVersion: '"Why now?" is not optional. If you can\'t answer it in 10 seconds, you haven\'t thought hard enough.'
        });
    }

    // Sort by severity
    const order = { red: 0, yellow: 1, green: 2 };
    items.sort((a, b) => order[a.severity] - order[b.severity]);

    return items;
}

const severityConfig = {
    red: { bg: 'bg-accent-danger/10', border: 'border-accent-danger', text: 'text-accent-danger', label: 'CRITICAL' },
    yellow: { bg: 'bg-accent-warning/10', border: 'border-accent-warning', text: 'text-accent-warning', label: 'CONCERNING' },
    green: { bg: 'bg-accent-success/10', border: 'border-accent-success', text: 'text-accent-success', label: 'MINOR' }
};

export default function RejectionReasons({ inputs, riskScores }: RejectionReasonsProps) {
    const [brutalMode, setBrutalMode] = useState(false);
    const [expanded, setExpanded] = useState<number[]>([0]);

    const rejections = useMemo(() => generateRejections(inputs, riskScores), [inputs, riskScores]);

    const toggleExpand = (idx: number) => {
        setExpanded(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
    };

    return (
        <section id="rejections" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border-cyan/30 pb-3 gap-4">
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                    <XOctagon className="text-accent-danger w-6 h-6" /> Why You Will Get Rejected
                </h2>
                <button
                    onClick={() => setBrutalMode(!brutalMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${brutalMode
                            ? 'bg-accent-danger/20 border-accent-danger/50 text-accent-danger shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                            : 'bg-background-elevated border-border-cyan/20 text-text-secondary hover:text-white'
                        }`}
                >
                    {brutalMode ? <Skull className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                    {brutalMode ? 'Brutal Mode ON' : 'Enable Brutal Mode'}
                </button>
            </div>

            <div className="space-y-3">
                {rejections.map((item, idx) => {
                    const sev = severityConfig[item.severity];
                    const isExpanded = expanded.includes(idx);

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`glass-card overflow-hidden border-l-4 ${sev.border}`}
                        >
                            <button
                                onClick={() => toggleExpand(idx)}
                                className="w-full text-left p-5 flex items-start gap-4 focus:outline-none hover:bg-background-elevated/30 transition-colors"
                            >
                                <span className={`mt-0.5 px-2 py-1 rounded text-[10px] font-bold uppercase ${sev.bg} ${sev.text} flex-shrink-0`}>
                                    {sev.label}
                                </span>
                                <p className={`flex-1 font-medium text-sm ${brutalMode ? 'text-accent-danger' : 'text-text-primary'}`}>
                                    {brutalMode ? item.brutalVersion : item.reason}
                                </p>
                                {isExpanded ? <ChevronUp className="w-5 h-5 text-text-muted flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-text-muted flex-shrink-0" />}
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 space-y-4">
                                            {/* Fix */}
                                            <div>
                                                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                    <Shield className="w-3.5 h-3.5 text-accent-primary" /> How to Fix This
                                                </h4>
                                                {item.fix.map((f, i) => (
                                                    <div key={i} className="flex items-start gap-2 text-sm text-text-secondary mb-1.5">
                                                        <CheckCircle2 className="w-4 h-4 text-accent-success mt-0.5 flex-shrink-0" />
                                                        <span>{f}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Comparable Failure */}
                                            <div className="flex items-start gap-3 bg-background-elevated/50 p-3 rounded-lg border border-border-cyan/10">
                                                <Zap className="w-4 h-4 text-accent-warning mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <span className="text-xs font-bold text-accent-warning">{item.comparableFailure.name}</span>
                                                    <p className="text-xs text-text-muted mt-0.5">{item.comparableFailure.detail}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
