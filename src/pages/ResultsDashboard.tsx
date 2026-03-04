import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { formatCurrencyScaled, getCurrencySymbol } from '../utils/Localization';
import { computeRiskExplanations, RiskExplanation } from '../utils/RiskEngine';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
    RadialBarChart, RadialBar, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert, TrendingUp, Users, Activity,
    MessageSquare, ChevronRight, Scale, BookOpen,
    CheckCircle2, AlertTriangle, ChevronDown, ChevronUp,
    Sparkles, Award, XOctagon, Layers, Target, Info,
    HelpCircle, ExternalLink, Clock, Milestone, ArrowRight,
    Map, BarChart3, FileText
} from 'lucide-react';

// Feature Components
import VCPersonaModal from '../components/features/VCPersonaModal';
import GrowthSimPanel from '../components/features/GrowthSimPanel';
import RejectionReasons from '../components/features/RejectionReasons';
import CompetitorIntel from '../components/features/CompetitorIntel';
import InvestmentReadiness from '../components/features/InvestmentReadiness';
import ScenarioBuilder from '../components/features/ScenarioBuilder';

// Mini tooltip component
function InfoTip({ text }: { text: string }) {
    const [show, setShow] = useState(false);
    return (
        <span className="relative inline-block ml-1.5">
            <button
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                onClick={() => setShow(!show)}
                className="text-text-muted hover:text-accent-primary transition-colors"
            >
                <HelpCircle className="w-3.5 h-3.5" />
            </button>
            {show && (
                <div className="absolute z-40 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-background-card border border-border-cyan/50 rounded-lg p-3 shadow-[0_0_20px_rgba(0,212,255,0.15)] text-xs text-text-secondary leading-relaxed">
                    {text}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-background-card border-r border-b border-border-cyan/50 rotate-45" />
                </div>
            )}
        </span>
    );
}

export default function ResultsDashboard() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('summary');
    const [expandedWeaknesses, setExpandedWeaknesses] = useState<number[]>([]);
    const [vcModalOpen, setVcModalOpen] = useState(false);
    const [showRiskBreakdown, setShowRiskBreakdown] = useState(false);

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'analyses', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAnalysis({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error("Error fetching analysis:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, [id]);

    const toggleWeakness = (idx: number) => {
        setExpandedWeaknesses(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-accent-primary">Loading Intelligence...</div>;
    }

    if (!analysis) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <h2 className="text-2xl font-bold text-accent-danger mb-4">Analysis Not Found</h2>
                <button className="btn-primary" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
            </div>
        );
    }

    const { inputs, riskScores, competitors, industryData, aiAnalysis, strategicData, regulatoryData } = analysis;
    const currencySymbol = getCurrencySymbol(inputs.country);

    // Compute risk explanations
    const riskExplanations = computeRiskExplanations(inputs, riskScores);

    const navAnchors = [
        { id: 'summary', label: 'Executive Summary', icon: Activity },
        { id: 'readiness', label: 'Investment Readiness', icon: Award },
        { id: 'risk', label: 'Risk Analysis', icon: ShieldAlert },
        { id: 'rejections', label: 'Rejection Reasons', icon: XOctagon },
        { id: 'growth', label: 'Growth Simulation', icon: TrendingUp },
        { id: 'competition', label: 'Competitor Intel', icon: Target },
        { id: 'scenarios', label: 'Scenario Builder', icon: Layers },
        { id: 'strategic', label: 'Strategic Analysis', icon: BookOpen },
        { id: 'regulatory', label: 'Regulatory', icon: Scale },
    ];

    const scrollTo = (sectionId: string) => {
        setActiveSection(sectionId);
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    };

    const radarData = [
        { subject: 'Market', startup: riskScores.marketRisk, avg: 50 },
        { subject: 'Execution', startup: riskScores.executionRisk, avg: 50 },
        { subject: 'Financial', startup: riskScores.financialRisk, avg: 50 },
        { subject: 'Competition', startup: riskScores.competitionRisk, avg: 50 },
        { subject: 'Regulatory', startup: riskScores.regulatoryRisk, avg: 50 },
    ];

    const categoryColors: Record<string, string> = {
        growth: '#10B981',
        team: '#00D4FF',
        funding: '#F5C842',
        product: '#7C3AED',
        risk: '#EF4444'
    };

    return (
        <div className="flex h-[calc(100vh-5rem)]">

            {/* Left Anchor Sidebar */}
            <aside className="w-64 hidden xl:block border-r border-border-cyan/30 bg-background-primary/50 p-6 overflow-y-auto custom-scrollbar sticky top-0 h-full">
                <h2 className="text-xl font-display font-bold text-white mb-2 leading-tight">{inputs.name}</h2>
                <p className="text-text-muted text-sm mb-6">{inputs.tagline}</p>

                <div className={`p-4 rounded-xl mb-4 border border-border-cyan/30 flex flex-col items-center justify-center ${riskScores.overallRisk > 60 ? 'bg-accent-danger/10 border-accent-danger/30' : riskScores.overallRisk > 30 ? 'bg-accent-warning/10 border-accent-warning/30' : 'bg-accent-success/10 border-accent-success/30'}`}>
                    <span className="text-3xl font-mono font-bold">{riskScores.overallRisk}</span>
                    <span className="text-xs uppercase tracking-wider font-medium text-text-muted mt-1">{riskScores.classification}</span>
                </div>

                {/* VC Simulation Button */}
                <button
                    onClick={() => setVcModalOpen(true)}
                    className="w-full mb-6 flex items-center justify-between px-3 py-3 rounded-lg bg-gradient-to-r from-accent-gold/10 to-accent-warning/10 border border-accent-gold/30 hover:shadow-[0_0_15px_rgba(245,200,66,0.2)] transition-all text-sm group"
                >
                    <span className="flex items-center gap-2 text-accent-gold font-medium group-hover:text-white"><Sparkles className="w-4 h-4" /> VC Simulation</span>
                    <ChevronRight className="w-4 h-4 text-accent-gold group-hover:text-white" />
                </button>

                <nav className="space-y-1.5 mb-8">
                    {navAnchors.map(nav => (
                        <button
                            key={nav.id}
                            onClick={() => scrollTo(nav.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${activeSection === nav.id ? 'bg-accent-primary/20 text-accent-primary font-medium' : 'text-text-secondary hover:text-white hover:bg-background-elevated'}`}
                        >
                            <nav.icon className="w-4 h-4" /> {nav.label}
                        </button>
                    ))}
                    <div className="my-4 border-t border-border-cyan/20"></div>
                    <button onClick={() => navigate(`/chat/${analysis.id}`)} className="w-full flex items-center justify-between px-3 py-3 rounded-lg bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 border border-accent-primary/30 hover:shadow-glow transition-all text-sm group">
                        <span className="flex items-center gap-2 text-accent-primary font-medium group-hover:text-white"><MessageSquare className="w-4 h-4" /> Expert Chat</span>
                        <ChevronRight className="w-4 h-4 text-accent-primary group-hover:text-white" />
                    </button>
                </nav>
            </aside>

            {/* Main Content Dashboard */}
            <main className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth p-6 lg:p-10 space-y-20">

                {/* SECTION: BENTO BOX SUMMARY */}
                <section id="summary" className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-display font-bold leading-tight mb-2">{inputs.name}</h1>
                            <p className="text-xl text-text-secondary">Venture Intelligence & Strategic Report</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold border ${riskScores.overallRisk > 60 ? 'text-accent-danger border-accent-danger/50 bg-accent-danger/10' : 'text-accent-success border-accent-success/50 bg-accent-success/10'}`}>
                                {aiAnalysis?.ventureClassification || riskScores.classification}
                            </span>
                            <button
                                onClick={() => setVcModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-accent-gold/50 bg-accent-gold/10 text-accent-gold hover:shadow-[0_0_15px_rgba(245,200,66,0.3)] transition-all"
                            >
                                <Sparkles className="w-4 h-4" /> VC Pitch Sim
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
                        {/* BENTO: MAIN OVERALL RISK (Spans 4 columns) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="glass-card md:col-span-4 p-6 flex flex-col items-center justify-center relative overflow-hidden group border-border-cyan/30 bg-gradient-to-br from-background-card to-background-elevated"
                        >
                            <div className="absolute inset-0 bg-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <h3 className="text-text-secondary text-sm font-bold tracking-widest uppercase mb-2">Overall Risk Index</h3>
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={15} data={[{ name: 'Risk', value: riskScores.overallRisk }]} startAngle={90} endAngle={-270}>
                                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                        <RadialBar
                                            background={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                            dataKey="value"
                                            cornerRadius={10}
                                        >
                                            <Cell fill={riskScores.overallRisk > 60 ? '#EF4444' : riskScores.overallRisk > 30 ? '#F59E0B' : '#10B981'} />
                                        </RadialBar>
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.3 }}
                                        className={`text-5xl font-mono font-bold ${riskScores.overallRisk > 60 ? 'text-accent-danger' : riskScores.overallRisk > 30 ? 'text-accent-warning' : 'text-accent-success'}`}
                                    >
                                        {riskScores.overallRisk}
                                    </motion.span>
                                    <span className="text-xs text-text-muted mt-1">/ 100</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* BENTO: EXECUTIVE SUMMARY (Spans 8 columns) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="glass-card md:col-span-8 p-6 flex flex-col border-border-cyan/30 custom-scrollbar overflow-y-auto max-h-[300px]"
                        >
                            <h3 className="text-text-secondary text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-accent-primary" /> Executive Thesis
                            </h3>
                            <p className="text-text-primary text-lg leading-relaxed font-medium">
                                {aiAnalysis?.executiveSummary}
                            </p>
                        </motion.div>

                        {/* BENTO: FINANCIAL METRICS (Spans 4 columns) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="glass-card md:col-span-4 p-6 grid grid-rows-2 gap-4 border-border-cyan/30"
                        >
                            <div className="flex flex-col justify-center border-b border-border-cyan/20 pb-4">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center">
                                        Mo. Burn <InfoTip text="Monthly burn rate. Compare with industry average." />
                                    </span>
                                    {industryData?.benchmarks?.burn_rate && (
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${inputs.burnRate > industryData.benchmarks.burn_rate ? 'bg-accent-danger/20 text-accent-danger' : 'bg-accent-success/20 text-accent-success'}`}>
                                            Vs Avg: {formatCurrencyScaled(industryData.benchmarks.burn_rate, inputs.country)}
                                        </span>
                                    )}
                                </div>
                                <span className="text-3xl font-mono text-accent-secondary font-bold truncate">
                                    {formatCurrencyScaled(inputs.burnRate, inputs.country)}
                                </span>
                            </div>
                            <div className="flex flex-col justify-center pt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center">
                                        Runway <InfoTip text="Months before cash depletion." />
                                    </span>
                                    {industryData?.benchmarks?.median_runway_months && (
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${inputs.runwayMonths < industryData.benchmarks.median_runway_months ? 'bg-accent-danger/20 text-accent-danger' : 'bg-accent-success/20 text-accent-success'}`}>
                                            Vs Avg: {industryData.benchmarks.median_runway_months}mo
                                        </span>
                                    )}
                                </div>
                                <span className="text-3xl font-mono text-accent-warning font-bold">
                                    {inputs.runwayMonths} M
                                </span>
                            </div>
                        </motion.div>

                        {/* BENTO: RADAR CHART (Spans 5 columns) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="glass-card md:col-span-5 p-6 flex flex-col items-center border-border-cyan/30 h-[320px]"
                        >
                            <h3 className="text-text-secondary text-sm font-bold tracking-widest uppercase mb-2 w-full text-left">Risk Topography</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid stroke="rgba(0,212,255,0.15)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '12px', boxShadow: '0 0 20px rgba(0,212,255,0.1)' }} itemStyle={{ color: '#00D4FF' }} />
                                    <Radar name="Industry Average" dataKey="avg" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.15} />
                                    <Radar name={inputs.name} dataKey="startup" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* BENTO: INVESTOR READINESS (Spans 3 columns) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="glass-card md:col-span-3 p-6 flex flex-col items-center justify-center border-border-cyan/30 text-center relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-success/20 via-background-card to-background-card opacity-50" />
                            <Award className="w-10 h-10 text-accent-success mb-4 relative z-10" />
                            <h3 className="text-text-secondary text-xs font-bold tracking-widest uppercase mb-1 relative z-10">Investor Readiness</h3>
                            <span className="text-5xl font-mono font-bold text-accent-success mb-2 relative z-10">
                                {aiAnalysis?.investorReadinessScore || riskScores.successProbability}%
                            </span>
                            <p className="text-[11px] text-text-muted w-full relative z-10">
                                Viability score based on product maturity & team execution.
                            </p>
                        </motion.div>
                    </div>

                    {/* Risk Score Breakdown Accordion */}
                    <div className="glass-card overflow-hidden border-border-cyan/30 mt-6">
                        <button
                            onClick={() => setShowRiskBreakdown(!showRiskBreakdown)}
                            className="w-full p-6 flex items-center justify-between hover:bg-background-elevated/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <ShieldAlert className="w-5 h-5 text-accent-primary" />
                                <div className="text-left">
                                    <h3 className="font-bold text-text-primary tracking-wide">Deconstruct Risk Algorithm</h3>
                                    <p className="text-xs text-text-muted mt-0.5">View the dimensional breakdown of how {inputs.name}'s risk score was calculated.</p>
                                </div>
                            </div>
                            {showRiskBreakdown ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
                        </button>

                        <AnimatePresence>
                            {showRiskBreakdown && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 pb-6 pt-2 space-y-8 border-t border-border-cyan/20"
                                >
                                    {/* Overall formula */}
                                    <div className="p-4 bg-background-elevated/40 rounded-xl border border-border-cyan/20">
                                        <h4 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-accent-primary" /> Overall Risk Formula</h4>
                                        <p className="text-xs text-text-secondary leading-relaxed">
                                            Your overall risk score of <strong className="text-white">{riskScores.overallRisk}/100</strong> is a weighted average of 5 dimensions:
                                            Market (22%), Execution (25%), Financial (20%), Competition (18%), and Regulatory (15%).
                                            A higher score means higher risk. Below 30 is LOW RISK, 30-60 is MODERATE, above 60 is HIGH RISK.
                                        </p>
                                    </div>

                                    {riskExplanations.map((dim, idx) => (
                                        <div key={dim.dimension} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-text-primary flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dim.score > 60 ? '#EF4444' : dim.score > 30 ? '#F59E0B' : '#10B981' }}></span>
                                                    {dim.dimension}
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-text-muted">Weight: {(dim.weight * 100)}%</span>
                                                    <span className={`font-mono font-bold text-sm ${dim.score > 60 ? 'text-accent-danger' : dim.score > 30 ? 'text-accent-warning' : 'text-accent-success'}`}>{dim.score}/100</span>
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="h-2 rounded-full bg-background-elevated overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${dim.score}%`,
                                                        backgroundColor: dim.score > 60 ? '#EF4444' : dim.score > 30 ? '#F59E0B' : '#10B981'
                                                    }}
                                                />
                                            </div>

                                            {/* Factors */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                {dim.factors.map((f, fi) => (
                                                    <div key={fi} className="p-4 bg-background-elevated/30 rounded-xl border border-border-cyan/10 hover:border-border-cyan/30 transition-colors">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-xs font-bold text-text-primary">{f.factor}</span>
                                                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${f.impact > 15 ? 'bg-accent-danger/20 text-accent-danger' : f.impact > 8 ? 'bg-accent-warning/20 text-accent-warning' : 'bg-accent-success/20 text-accent-success'}`}>+{f.impact} pts</span>
                                                        </div>
                                                        <p className="text-xs text-text-muted leading-relaxed">{f.reason}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <p className="text-sm text-text-secondary italic border-l-2 border-accent-primary/50 pl-4 mt-4 py-1">{dim.summary}</p>
                                        </div>
                                    ))}

                                    {/* Contribution to overall */}
                                    <div className="p-5 bg-background-elevated/40 rounded-xl border border-border-cyan/20">
                                        <h4 className="text-sm font-bold text-text-primary mb-4 tracking-wide">Factor Contribution to Final Score ({riskScores.overallRisk})</h4>
                                        <div className="flex gap-1 h-8 rounded-full overflow-hidden shadow-inner">
                                            {riskExplanations.map((dim, i) => (
                                                <div
                                                    key={i}
                                                    className="h-full flex items-center justify-center text-[10px] font-bold text-white transition-all hover:opacity-80 cursor-default"
                                                    style={{
                                                        width: `${(dim.weightedContribution / riskScores.overallRisk) * 100}%`,
                                                        backgroundColor: ['#3b82f6', '#7C3AED', '#F59E0B', '#EF4444', '#10B981'][i],
                                                        minWidth: '30px'
                                                    }}
                                                    title={`${dim.dimension}: ${dim.weightedContribution} pts`}
                                                >
                                                    {dim.weightedContribution}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-4 mt-4">
                                            {riskExplanations.map((dim, i) => (
                                                <span key={i} className="text-xs font-medium text-text-muted flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#3b82f6', '#7C3AED', '#F59E0B', '#EF4444', '#10B981'][i] }}></span>
                                                    {dim.dimension.replace(' Risk', '')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* SECTION: PITCH DECK SCORECARD */}
                {aiAnalysis?.pitchScorecard && (
                    <section className="space-y-6">
                        <h2 className="text-2xl font-display font-bold text-white border-b border-border-cyan/30 pb-3">AI Pitch Deck Scorecard</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {aiAnalysis.pitchScorecard.map((item: any, idx: number) => (
                                <div key={idx} className="glass-card p-4 flex flex-col border-l-2 border-accent-primary">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-text-primary">{item.section}</span>
                                        <span className={`font-mono text-sm px-2 py-0.5 rounded ${item.score >= 8 ? 'bg-accent-success/20 text-accent-success' : item.score >= 5 ? 'bg-accent-warning/20 text-accent-warning' : 'bg-accent-danger/20 text-accent-danger'}`}>{item.score}/10</span>
                                    </div>
                                    <p className="text-xs text-text-muted">{item.feedback}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* FEATURE: INVESTMENT READINESS SCORE */}
                <InvestmentReadiness inputs={inputs} riskScores={riskScores} aiAnalysis={aiAnalysis} />

                {/* FEATURE: WHY YOU WILL GET REJECTED */}
                <RejectionReasons inputs={inputs} riskScores={riskScores} aiAnalysis={aiAnalysis} />

                {/* FEATURE: GROWTH SIMULATION ENGINE */}
                <GrowthSimPanel inputs={inputs} riskScores={riskScores} />

                {/* FEATURE: COMPETITOR INTELLIGENCE ENGINE */}
                <CompetitorIntel inputs={inputs} competitors={competitors || []} />

                {/* FEATURE: SCENARIO BUILDER */}
                <ScenarioBuilder inputs={inputs} riskScores={riskScores} />

                {/* SECTION: STRATEGIC ANALYSIS (SWOT & WEAKNESSES & ROADMAP) */}
                <section id="strategic" className="space-y-6 pb-10">
                    <h2 className="text-2xl font-display font-bold text-white border-b border-border-cyan/30 pb-3 flex items-center gap-3"><BookOpen className="text-accent-primary w-6 h-6" /> SWOT & AI Strategic Analysis</h2>

                    {/* SWOT Grid */}
                    {strategicData?.swot ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="glass-card p-5 border-t-2 border-accent-success/50">
                                <h3 className="font-bold text-accent-success mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Strengths</h3>
                                <ul className="space-y-2 text-sm text-text-secondary">
                                    {strategicData.swot.strengths.map((s: string, i: number) => <li key={`s-${i}`} className="flex items-start gap-2"><span className="text-accent-success mt-0.5">✓</span> {s}</li>)}
                                </ul>
                            </div>
                            <div className="glass-card p-5 border-t-2 border-accent-danger/50">
                                <h3 className="font-bold text-accent-danger mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Weaknesses</h3>
                                <ul className="space-y-2 text-sm text-text-secondary">
                                    {strategicData.swot.weaknesses.map((w: string, i: number) => <li key={`w-${i}`} className="flex items-start gap-2"><span className="text-accent-danger mt-0.5">✗</span> {w}</li>)}
                                </ul>
                            </div>
                            <div className="glass-card p-5 border-t-2 border-accent-primary/50">
                                <h3 className="font-bold text-accent-primary mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Opportunities</h3>
                                <ul className="space-y-2 text-sm text-text-secondary">
                                    {strategicData.swot.opportunities.map((o: string, i: number) => <li key={`o-${i}`} className="flex items-start gap-2"><span className="text-accent-primary mt-0.5">→</span> {o}</li>)}
                                </ul>
                            </div>
                            <div className="glass-card p-5 border-t-2 border-accent-warning/50">
                                <h3 className="font-bold text-accent-warning mb-3 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Threats</h3>
                                <ul className="space-y-2 text-sm text-text-secondary">
                                    {strategicData.swot.threats.map((t: string, i: number) => <li key={`t-${i}`} className="flex items-start gap-2"><span className="text-accent-warning mt-0.5">⚠</span> {t}</li>)}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card p-10 text-center border-dashed border-border-cyan/50">
                            <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
                            <p className="text-text-secondary text-lg mb-2">SWOT data not available</p>
                            <p className="text-text-muted text-sm">Re-run your analysis to generate strategic insights.</p>
                        </div>
                    )}

                    {/* Strategic Weaknesses */}
                    <div className="space-y-4">
                        {strategicData?.strategicWeaknesses?.map((weakness: any, idx: number) => (
                            <div key={idx} className={`glass-card overflow-hidden transition-all duration-300 border-l-4 ${weakness.severity === 'critical' ? 'border-l-accent-danger' : weakness.severity === 'high' ? 'border-l-accent-warning' : 'border-l-accent-primary'}`}>
                                <button
                                    onClick={() => toggleWeakness(idx)}
                                    className="w-full text-left p-5 flex items-center justify-between focus:outline-none hover:bg-background-elevated/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${weakness.severity === 'critical' ? 'bg-accent-danger/20 text-accent-danger' : weakness.severity === 'high' ? 'bg-accent-warning/20 text-accent-warning' : 'bg-accent-primary/20 text-accent-primary'}`}>
                                            {weakness.severity}
                                        </span>
                                        <h3 className="font-bold text-text-primary text-lg">{weakness.title}</h3>
                                    </div>
                                    {expandedWeaknesses.includes(idx) ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
                                </button>

                                {expandedWeaknesses.includes(idx) && (
                                    <div className="p-5 pt-0 mt-2 bg-background-elevated/10">
                                        <p className="text-text-secondary mb-4 italic">{weakness.description}</p>
                                        <div className="space-y-3 pt-3 border-t border-border-cyan/10">
                                            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Recommended Mitigation</h4>
                                            <ul className="space-y-2">
                                                {weakness.mitigation.map((m: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-text-primary"><div className="w-5 h-5 rounded bg-accent-success/10 text-accent-success flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle2 className="w-3 h-3" /></div> {m}</li>
                                                ))}
                                            </ul>
                                            <div className="mt-4 inline-block px-3 py-1 bg-background-primary rounded-full text-xs text-text-muted border border-border-cyan/20">Timeline: {weakness.timeframe}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Strategic Recommendations Roadmap */}
                    {strategicData?.recommendations && strategicData.recommendations.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-3">
                                <Map className="w-5 h-5 text-accent-secondary" /> Strategic Roadmap
                            </h3>
                            <div className="relative">
                                {/* Vertical line connector */}
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-primary via-accent-secondary to-accent-success opacity-30" />

                                <div className="space-y-4">
                                    {strategicData.recommendations.map((rec: any, idx: number) => (
                                        <div key={idx} className="relative flex gap-4 pl-2">
                                            {/* Timeline node */}
                                            <div className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm border-2"
                                                style={{
                                                    backgroundColor: (categoryColors[rec.category] || '#00D4FF') + '20',
                                                    borderColor: categoryColors[rec.category] || '#00D4FF'
                                                }}
                                            >
                                                {rec.priority || idx + 1}
                                            </div>

                                            <div className="flex-1 glass-card p-5 hover:border-accent-primary/30 transition-all group">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <h4 className="font-bold text-text-primary group-hover:text-accent-primary transition-colors">{rec.title}</h4>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${rec.impact === 'high' ? 'bg-accent-success/20 text-accent-success' : rec.impact === 'medium' ? 'bg-accent-warning/20 text-accent-warning' : 'bg-accent-primary/20 text-accent-primary'}`}>
                                                        {rec.impact} impact
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-text-muted bg-background-elevated border border-border-cyan/20">
                                                        {rec.category}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-text-secondary mb-3">{rec.action}</p>
                                                <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                                                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-accent-success" /> {rec.expected_outcome}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-accent-warning" /> {rec.timeframe_weeks} weeks</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Phased Strategy Roadmap */}
                    {strategicData?.strategyRoadmap && strategicData.strategyRoadmap.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-3">
                                <Milestone className="w-5 h-5 text-accent-primary" /> Phased Growth Strategy
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {strategicData.strategyRoadmap.map((phase: any, idx: number) => (
                                    <div key={idx} className="glass-card p-5 border-t-2 hover:shadow-[0_0_20px_rgba(0,212,255,0.1)] transition-all"
                                        style={{ borderTopColor: ['#00D4FF', '#7C3AED', '#10B981', '#F5C842'][idx] || '#00D4FF' }}
                                    >
                                        <h4 className="font-bold text-text-primary text-sm mb-3">{phase.phase}</h4>
                                        <div className="space-y-2 mb-4">
                                            <h5 className="text-[10px] text-text-muted uppercase tracking-wider">Goals</h5>
                                            {phase.goals?.map((g: string, i: number) => (
                                                <p key={i} className="text-xs text-text-secondary flex items-start gap-1.5"><ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-accent-primary" /> {g}</p>
                                            ))}
                                        </div>
                                        {phase.kpis && (
                                            <div className="space-y-1.5 pt-3 border-t border-border-cyan/10">
                                                <h5 className="text-[10px] text-text-muted uppercase tracking-wider">KPIs</h5>
                                                {phase.kpis.map((k: string, i: number) => (
                                                    <p key={i} className="text-[11px] text-text-muted flex items-start gap-1.5"><BarChart3 className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: ['#00D4FF', '#7C3AED', '#10B981', '#F5C842'][idx] }} /> {k}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* SECTION: REGULATORY & COMPLIANCE */}
                <section id="regulatory" className="space-y-6 pb-20">
                    <h2 className="text-2xl font-display font-bold text-white border-b border-border-cyan/30 pb-3 flex items-center gap-3"><Scale className="text-accent-primary w-6 h-6" /> Regulatory & Compliance Roadmap ({inputs.country})</h2>

                    {/* Regulations Table — Enhanced */}
                    <div className="overflow-x-auto custom-scrollbar pb-4">
                        <table className="w-full min-w-[800px] text-left">
                            <thead className="bg-background-elevated">
                                <tr className="text-text-muted text-sm uppercase tracking-wider">
                                    <th className="py-3 px-4 font-medium rounded-tl-lg">
                                        Regulation
                                        <InfoTip text="The specific law, act, or standard that applies to your startup based on your industry and geography." />
                                    </th>
                                    <th className="py-3 px-4 font-medium">
                                        Priority
                                        <InfoTip text="How urgently you need to address this regulation. High = must act now, Medium = plan within 6 months, Low = monitor." />
                                    </th>
                                    <th className="py-3 px-4 font-medium">
                                        Timeline
                                        <InfoTip text="How long compliance typically takes to achieve from start to completion." />
                                    </th>
                                    <th className="py-3 px-4 font-medium">What You Need To Do</th>
                                    <th className="py-3 px-4 font-medium text-right rounded-tr-lg">
                                        Cost Est.
                                        <InfoTip text="Estimated cost of achieving compliance in your local currency, including legal fees, certifications, and implementation." />
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-cyan/10">
                                {regulatoryData?.regulations?.map((reg: any, i: number) => (
                                    <tr key={i} className="group hover:bg-background-elevated/30 transition-colors">
                                        <td className="py-4 px-4 font-medium text-text-primary">
                                            {reg.name}
                                            <div className="text-xs text-text-muted mt-1 font-normal">{reg.authority}</div>
                                            {reg.description && <div className="text-xs text-text-secondary mt-1 font-normal leading-relaxed">{reg.description}</div>}
                                        </td>
                                        <td className="py-4 px-4 align-top pt-5">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${reg.priority === 'High' ? 'bg-accent-danger/20 text-accent-danger' : reg.priority === 'Medium' ? 'bg-accent-warning/20 text-accent-warning' : 'bg-accent-success/20 text-accent-success'}`}>{reg.priority}</span>
                                        </td>
                                        <td className="py-4 px-4 text-text-secondary align-top pt-5 whitespace-nowrap">{reg.timeline}</td>
                                        <td className="py-4 px-4 align-top pt-5">
                                            <p className="text-xs text-text-secondary">{reg.action || reg.what_to_do}</p>
                                            <p className="text-xs text-accent-danger mt-1.5 font-medium">⚠ Risk if ignored: {reg.risk}</p>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-text-muted text-right font-mono align-top pt-5">{reg.compliance_cost_local}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total cost summary */}
                    {regulatoryData?.total_estimated_cost_local && (
                        <div className="glass-card p-4 flex items-center justify-between border-l-4 border-accent-warning">
                            <div>
                                <h4 className="font-bold text-text-primary">Total Estimated Compliance Cost</h4>
                                <p className="text-xs text-text-muted">Budget this amount over the next 12-18 months for full regulatory compliance.</p>
                            </div>
                            <span className="text-2xl font-mono font-bold text-accent-warning">{regulatoryData.total_estimated_cost_local}</span>
                        </div>
                    )}

                    {/* Compliance Roadmap Timeline */}
                    {regulatoryData?.compliance_roadmap && regulatoryData.compliance_roadmap.length > 0 && (
                        <div className="mt-6">
                            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-accent-primary" /> Compliance Timeline
                            </h3>
                            <div className="relative">
                                {/* Horizontal timeline line */}
                                <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-success opacity-30" />

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {regulatoryData.compliance_roadmap.map((step: any, idx: number) => (
                                        <div key={idx} className="relative pt-10">
                                            {/* Timeline dot */}
                                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-accent-primary bg-background-card flex items-center justify-center z-10">
                                                <span className="text-[9px] font-bold text-accent-primary">{step.month || idx + 1}</span>
                                            </div>
                                            <div className="glass-card p-3 text-center hover:border-accent-primary/30 transition-all">
                                                <span className="text-[10px] text-accent-primary font-mono mb-1 block">Month {step.month || idx + 1}</span>
                                                <p className="text-xs text-text-primary font-medium">{step.milestone}</p>
                                                {step.description && <p className="text-[10px] text-text-muted mt-1">{step.description}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* VC PERSONA MODAL */}
            <VCPersonaModal
                isOpen={vcModalOpen}
                onClose={() => setVcModalOpen(false)}
                inputs={inputs}
                riskScores={riskScores}
            />
        </div>
    );
}
