import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, User, Briefcase, TrendingUp, MessageSquare, CheckCircle2,
    DollarSign, Percent, Award, ThumbsUp, ThumbsDown, Sparkles, Send, Loader2, Info
} from 'lucide-react';

// 50 realistic investor questions — randomly sampled each session
const QUESTION_POOL: string[] = [
    // Market & Opportunity
    "How big is your total addressable market, and what's your realistic path to capturing 1% of it?",
    "What market trends are driving demand for your solution right now?",
    "Who is your ideal customer, and how did you identify them?",
    "What happens to your business if this market shrinks by 30% next year?",
    "How do you plan to expand beyond your initial target market?",
    "What's the single biggest tailwind in your market?",
    "Is this a 'nice-to-have' or a 'must-have' for your customers? How do you know?",
    "What's the total spend in this category today, and who is getting that money?",
    // Traction & Metrics
    "Walk me through your unit economics — what's your current CAC and LTV?",
    "Show me your monthly cohort retention curves. What does month-3 retention look like?",
    "What's your current monthly recurring revenue, and what was it 6 months ago?",
    "How many paying customers do you have right now?",
    "What's your conversion rate from free trial to paid?",
    "What is your net revenue retention rate?",
    "What single metric do you obsess over every single day?",
    "What's your month-over-month growth rate for the last 3 months?",
    // Team & Execution
    "Tell me about your founding team. Why are you the right people to solve this problem?",
    "Who's your co-founder and what's the dynamic between you?",
    "What key hires do you need to make in the next 6 months?",
    "Have any team members left? If so, why?",
    "What's your biggest execution risk right now, and how are you mitigating it?",
    "How do you make decisions as a founding team when you disagree?",
    "What happens to the company if you, the CEO, get hit by a bus tomorrow?",
    // Product & Technology
    "What's your core product differentiation — what can you do that no one else can?",
    "How long would it take a well-funded competitor to replicate your technology?",
    "What does your product roadmap look like for the next 12 months?",
    "How do you prioritize feature development?",
    "What's the biggest technical risk in your product?",
    "Do you have any patents or proprietary data advantages?",
    "How much of your product is built versus how much is still on the roadmap?",
    // Financials & Fundraising
    "What's your current burn rate and runway?",
    "How will you use the funds from this raise specifically? Walk me through the allocation.",
    "What milestones will this funding help you achieve before your next raise?",
    "What's your path to profitability without any additional funding?",
    "What are your revenue projections for the next 12-18 months? What assumptions drive them?",
    "How did you arrive at your current valuation?",
    "Have you raised money before? From whom and on what terms?",
    "What's your gross margin, and how does it trend as you scale?",
    // Competition & Moat
    "Who are your top 3 competitors and why will you beat them?",
    "What would Google/Microsoft/Amazon do differently if they entered your space?",
    "Why won't a well-funded incumbent crush you in the next 18 months?",
    "What's your competitive moat, and how does it deepen over time?",
    "If a competitor raised $100M tomorrow, how would you respond?",
    // Growth & Distribution
    "How are you acquiring your first 100 customers?",
    "What's your go-to-market strategy for the next 12 months?",
    "What distribution channels have worked best so far?",
    "What's your sales cycle length, and how do you plan to shorten it?",
    // Hard Questions
    "Why should I invest in you instead of one of your competitors?",
    "What's the one thing that could kill this company in the next year?",
    "If this fails, what's the most likely reason?",
    "What do you know about this problem that others don't?",
];

function pickRandomQuestions(count: number): string[] {
    const shuffled = [...QUESTION_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

interface VCPersonaModalProps {
    isOpen: boolean;
    onClose: () => void;
    inputs: any;
    riskScores: any;
}

export default function VCPersonaModal({ isOpen, onClose, inputs, riskScores }: VCPersonaModalProps) {
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [phase, setPhase] = useState<'interview' | 'result'>('interview');
    const [typing, setTyping] = useState(false);
    const [showQuestion, setShowQuestion] = useState(false);

    // Pick 5 random questions when modal opens
    useEffect(() => {
        if (isOpen) {
            setQuestions(pickRandomQuestions(5));
            setPhase('interview');
            setCurrentQuestion(0);
            setAnswers([]);
            setCurrentAnswer('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (phase === 'interview' && questions.length > 0) {
            setTyping(true);
            setShowQuestion(false);
            const timer = setTimeout(() => {
                setTyping(false);
                setShowQuestion(true);
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [currentQuestion, phase, questions]);

    const handleSubmitAnswer = () => {
        if (!currentAnswer.trim()) return;
        const newAnswers = [...answers, currentAnswer];
        setAnswers(newAnswers);
        setCurrentAnswer('');

        if (currentQuestion < 4) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            setPhase('result');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitAnswer();
        }
    };

    const handleReset = () => {
        setQuestions(pickRandomQuestions(5));
        setPhase('interview');
        setCurrentQuestion(0);
        setAnswers([]);
        setCurrentAnswer('');
    };

    // --- Scoring Logic ---
    const computeResult = () => {
        const risk = riskScores.overallRisk;
        const runway = inputs.runwayMonths || 6;

        // Base score from risk (inverted — lower risk = higher score)
        let score = Math.round(100 - risk * 0.75);
        // Runway bonus
        score += runway >= 18 ? 10 : runway >= 12 ? 5 : runway >= 6 ? 0 : -10;
        // Team bonus
        const teamSize = inputs.teamSize || 1;
        score += teamSize >= 5 ? 5 : teamSize >= 3 ? 3 : 0;
        // Answer engagement bonus (longer, more detailed answers score higher)
        const avgLen = answers.reduce((s, a) => s + a.length, 0) / Math.max(answers.length, 1);
        score += avgLen > 150 ? 10 : avgLen > 100 ? 8 : avgLen > 50 ? 5 : 2;

        score = Math.max(0, Math.min(100, score));

        const wouldInvest = score >= 65;

        // Term sheet
        const checkAmt = score >= 75 ? 500000 : score >= 50 ? 250000 : 100000;
        const preMoneyValuation = Math.round(checkAmt / (wouldInvest ? 0.12 : 0.20));
        const equityPct = Math.round((checkAmt / (preMoneyValuation + checkAmt)) * 100 * 10) / 10;

        const reasons = wouldInvest ? [
            `Strong potential based on risk profile of ${risk}/100 — within investable range.`,
            `${runway >= 12 ? 'Healthy' : 'Manageable'} runway of ${runway} months demonstrates fiscal planning.`,
            `Your answers demonstrated ${avgLen > 100 ? 'strong' : 'adequate'} depth of understanding of the business.`,
            `Team size of ${teamSize} shows ${teamSize >= 5 ? 'operational readiness' : 'lean efficiency'}.`
        ] : [
            `Overall risk of ${risk}/100 is ${risk > 60 ? 'too high' : 'borderline'} for investment at this stage.`,
            `${runway < 12 ? 'Runway of ' + runway + ' months is too short — need 12+ months' : 'Financial metrics need stronger validation'}.`,
            `${riskScores.competitionRisk > 60 ? 'Competitive landscape is too crowded' : 'Execution risk needs mitigation before we can commit'}.`,
            `Recommend focusing on ${avgLen < 50 ? 'articulating your vision more clearly' : 'strengthening unit economics'} before the next pitch.`
        ];

        return { score, wouldInvest, preMoneyValuation, equityPct, reasons, checkAmt };
    };

    if (!isOpen) return null;

    const result = phase === 'result' ? computeResult() : null;
    const investorColor = '#00D4FF';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-background-card border border-border-cyan rounded-2xl shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-background-card/95 backdrop-blur-md border-b border-border-cyan/30 p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-display font-bold text-white">VC Investor Simulation</h2>
                                <p className="text-xs text-text-muted">
                                    {phase === 'interview' ? `Question ${currentQuestion + 1}/5 — Answer like you're pitching to a real investor` : 'Investment Decision'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-background-elevated transition-colors">
                            <X className="w-5 h-5 text-text-muted" />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* PHASE: INTERVIEW (direct — no persona selection) */}
                        {phase === 'interview' && questions.length > 0 && (
                            <div className="space-y-4">
                                {/* Intro tip */}
                                {currentQuestion === 0 && answers.length === 0 && (
                                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-accent-primary/5 border border-accent-primary/20 mb-4">
                                        <Info className="w-4 h-4 text-accent-primary mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-text-secondary">
                                            You'll face <strong>5 tough investor questions</strong> drawn randomly from a pool of 50. Answer in detail — longer, more specific answers score higher. The AI will evaluate your pitch readiness.
                                        </p>
                                    </div>
                                )}

                                {/* Progress bar */}
                                <div className="flex gap-1.5 mb-6">
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-background-elevated">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: i <= currentQuestion ? '100%' : '0%' }}
                                                className="h-full rounded-full bg-accent-primary"
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Chat history */}
                                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                    {answers.map((answer, idx) => (
                                        <React.Fragment key={idx}>
                                            {/* VC question */}
                                            <div className="flex gap-3 items-start">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-accent-primary/20">
                                                    <Briefcase className="w-4 h-4 text-accent-primary" />
                                                </div>
                                                <div className="glass-card p-3 text-sm text-text-primary max-w-[85%] border-accent-primary/30">
                                                    {questions[idx]}
                                                </div>
                                            </div>
                                            {/* User answer */}
                                            <div className="flex gap-3 items-start justify-end">
                                                <div className="bg-accent-primary/10 border border-accent-primary/30 rounded-xl p-3 text-sm text-text-primary max-w-[85%]">
                                                    {answer}
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    ))}

                                    {/* Current question (VC typing) */}
                                    {typing && (
                                        <div className="flex gap-3 items-start">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-accent-primary/20">
                                                <Briefcase className="w-4 h-4 text-accent-primary" />
                                            </div>
                                            <div className="glass-card p-3 text-sm text-text-muted flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Investor is thinking...
                                            </div>
                                        </div>
                                    )}

                                    {showQuestion && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 items-start">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-accent-primary/20">
                                                <Briefcase className="w-4 h-4 text-accent-primary" />
                                            </div>
                                            <div className="glass-card p-3 text-sm text-text-primary max-w-[85%] border-accent-primary/30">
                                                {questions[currentQuestion]}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Input */}
                                {showQuestion && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 mt-4">
                                        <textarea
                                            value={currentAnswer}
                                            onChange={e => setCurrentAnswer(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Type your answer... (be detailed for a higher score)"
                                            rows={2}
                                            className="flex-1 input-field resize-none text-sm"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleSubmitAnswer}
                                            disabled={!currentAnswer.trim()}
                                            className="self-end p-3 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary text-white disabled:opacity-30 transition-all hover:shadow-glow"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* PHASE: RESULT */}
                        {phase === 'result' && result && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                {/* Decision Badge */}
                                <motion.div
                                    initial={{ scale: 0.5 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 15 }}
                                    className="text-center py-6"
                                >
                                    <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-2xl font-display font-bold border-2 ${result.wouldInvest
                                            ? 'bg-accent-success/10 border-accent-success/50 text-accent-success'
                                            : 'bg-accent-danger/10 border-accent-danger/50 text-accent-danger'
                                        }`}>
                                        {result.wouldInvest ? <ThumbsUp className="w-8 h-8" /> : <ThumbsDown className="w-8 h-8" />}
                                        {result.wouldInvest ? "I WOULD INVEST" : "I WOULD PASS"}
                                    </div>
                                    <p className="text-text-muted text-sm mt-3">— AI Investor Simulation</p>
                                </motion.div>

                                {/* Score */}
                                <div className="flex items-center justify-center gap-8">
                                    <div className="text-center">
                                        <div className="relative w-28 h-28 mx-auto">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                                <motion.circle
                                                    cx="50" cy="50" r="42" fill="none"
                                                    stroke={result.wouldInvest ? '#10B981' : '#EF4444'}
                                                    strokeWidth="8" strokeLinecap="round"
                                                    strokeDasharray={`${result.score * 2.64} 264`}
                                                    initial={{ strokeDasharray: '0 264' }}
                                                    animate={{ strokeDasharray: `${result.score * 2.64} 264` }}
                                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-mono font-bold text-white">{result.score}</span>
                                                <span className="text-[10px] text-text-muted uppercase">Pitch Score</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Reasoning */}
                                <div className="glass-card p-5 space-y-3">
                                    <h3 className="font-bold text-text-primary flex items-center gap-2"><Award className="w-4 h-4 text-accent-primary" /> Investment Reasoning</h3>
                                    {result.reasons.map((r, i) => (
                                        <div key={i} className="flex items-start gap-3 text-sm">
                                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent-primary" />
                                            <span className="text-text-secondary">{r}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Term Sheet */}
                                <div className="glass-card p-5 border-t-2 border-accent-primary">
                                    <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-accent-primary" /> Indicative Term Sheet</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-background-elevated p-4 rounded-lg text-center">
                                            <span className="text-2xl font-mono font-bold text-white">${(result.checkAmt / 1000).toFixed(0)}K</span>
                                            <p className="text-xs text-text-muted mt-1">Check Size</p>
                                        </div>
                                        <div className="bg-background-elevated p-4 rounded-lg text-center">
                                            <span className="text-2xl font-mono font-bold text-white">${(result.preMoneyValuation / 1000000).toFixed(1)}M</span>
                                            <p className="text-xs text-text-muted mt-1">Pre-Money Valuation</p>
                                        </div>
                                        <div className="bg-background-elevated p-4 rounded-lg text-center">
                                            <span className="text-2xl font-mono font-bold text-accent-primary">{result.equityPct}%</span>
                                            <p className="text-xs text-text-muted mt-1">Equity Ask</p>
                                        </div>
                                        <div className="bg-background-elevated p-4 rounded-lg text-center">
                                            <span className="text-2xl font-mono font-bold text-accent-warning">{result.wouldInvest ? 'SAFE' : 'Convertible Note'}</span>
                                            <p className="text-xs text-text-muted mt-1">Instrument</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button onClick={handleReset} className="flex-1 py-3 rounded-lg border border-border-cyan/30 text-text-secondary hover:text-white hover:bg-background-elevated transition-all text-sm font-medium">
                                        Try Again (New Questions)
                                    </button>
                                    <button onClick={onClose} className="flex-1 btn-primary text-sm">
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
