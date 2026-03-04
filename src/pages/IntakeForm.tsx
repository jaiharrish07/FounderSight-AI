import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { computeRiskScores, generateGrowthSimulation } from '../utils/RiskEngine';
import { ALL_COUNTRIES, getCurrencySymbol, getStatesForCountry, getCitiesForState } from '../utils/Localization';
import { ChevronLeft, Rocket, Edit3, Sparkles, ArrowRight, BrainCircuit } from 'lucide-react';
import { auth, db } from '../utils/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { fetchAICompetitors, fetchAIIndustryData, fetchAIExecSummary, fetchAISWOT, fetchAIRegulations } from '../utils/gemini';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
    'Basics', 'Market', 'Team', 'Finance', 'Risk', 'Review'
];

export default function IntakeForm() {
    const { state } = useAppContext();
    const navigate = useNavigate();

    const [currentStage, setCurrentStage] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [analysisMessage, setAnalysisMessage] = useState('');

    const [formData, setFormData] = useState({
        // Stage 1
        name: '', tagline: '', industry: 'AI/ML', subIndustry: '', foundingYear: '2024',
        country: state.user?.country || 'USA', geoState: '', geoCity: '', targetMarket: 'B2B',
        businessModel: 'Subscription', revenueModel: 'SaaS', tamStr: '', tamUnit: 'Millions',
        pricingStrategy: 'Value-Based',
        // Stage 2
        competitorCount: 15, marketOverlapPct: 40, differentiationType: 'Technology Innovation',
        secDifferentiation: '', customerAcquisition: ['SEO/Content'], geoExpansion: 'Global in 3 years',
        networkEffects: 'Moderate', switchingCost: 'High',
        // Stage 3
        teamSize: 5, founderBg: '1 prior startup', technicalCapability: 'High',
        productDevelopmentStage: 'MVP', infrastructureComplexity: 'High', noveltyLevel: 'New category',
        advisors: '1-2', ipStatus: 'In progress', fullTime: 'All full-time',
        // Stage 4
        burnRate: 15000, currentFunding: 500000, fundingStage: 'Pre-Revenue',
        monthlyRevenue: 0, revenueStartMonths: 6, breakEvenMonths: 24,
        targetRaiseAmount: 2000000, revenuePredictability: 'Recurring', unitEconomicsKnown: 'Yes (not yet profitable)',
        runwayMonths: 18,
        // Stage 5
        industryCategory: 'Moderately Regulated', primaryGeoCompliance: 'Global/Multiple',
        dataPrivacy: 'Basic data', complianceCerts: ['SOC 2'], litigationRisk: 'Low',
        geopoliticalRisk: 'Low', competitionAggression: 'Startups only', marketTiming: 'Good timing',
        exitStrategy: 'Acquisition',
        // Preferences
        includeDetailedCompetitors: true,
        includeRegulatory: true,
        generatePitchInsights: true,
    });

    const updateForm = (updates: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleNext = () => {
        if (currentStage < STAGES.length - 1) setCurrentStage(prev => prev + 1);
    };
    const handlePrev = () => {
        if (currentStage > 0) setCurrentStage(prev => prev - 1);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !isAnalyzing) {
                // Ignore if in textarea or select to allow native interactions
                if (document.activeElement?.tagName === 'SELECT' || document.activeElement?.tagName === 'TEXTAREA') return;

                if (currentStage < STAGES.length - 1) {
                    handleNext();
                } else if (currentStage === STAGES.length - 1) {
                    handleLaunch();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentStage, isAnalyzing]);

    const handleLaunch = () => {
        setIsAnalyzing(true);

        const messages = [
            "Initializing risk quantification engine...",
            "Running market saturation analysis...",
            "Querying competitor intelligence via Gemini...",
            "Evaluating macroeconomic sector trends...",
            "Assessing regulatory compliance matrices...",
            "Calibrating financial stress index...",
            "Synthesizing institutional-grade insights...",
            "Finalizing venture intelligence payload..."
        ];

        let step = 0;
        const interval = setInterval(() => {
            setAnalysisProgress(Math.floor((step / messages.length) * 100));
            setAnalysisMessage(messages[step]);
            step++;

            if (step >= messages.length) {
                clearInterval(interval);
                setAnalysisProgress(100);
            }
        }, 1200);

        finishAnalysis()
            .then(() => {
                clearInterval(interval);
            })
            .catch(err => {
                clearInterval(interval);
                console.error(err);
            });
    };

    const finishAnalysis = async () => {
        try {
            const riskScores = computeRiskScores(formData);
            const [competitors, industryData, execSummary, swotData, regulations] = await Promise.all([
                fetchAICompetitors(formData),
                fetchAIIndustryData(formData),
                fetchAIExecSummary(formData, riskScores),
                fetchAISWOT(formData, riskScores),
                fetchAIRegulations(formData)
            ]);

            const growthData = generateGrowthSimulation(formData, { phase1: 0.1, phase2: 0.15, phase3: 0.2, phase4: 0.15, adoptionMultiplier: 1.0, churnRate: 0.05 });

            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error("User not authenticated");

            const analysisDoc = {
                uid: userId,
                name: formData.name || 'Untitled Startup',
                industry: formData.industry,
                geography: formData.country,
                geoState: formData.geoState,
                geoCity: formData.geoCity,
                overallRisk: riskScores.overallRisk,
                successProbability: riskScores.successProbability,
                riskClassification: riskScores.classification,
                inputs: formData,
                riskScores: riskScores,
                competitors: competitors || [],
                industryData: industryData || {},
                aiAnalysis: execSummary || {},
                strategicData: swotData || {},
                regulatoryData: regulations || {},
                growthData: growthData,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'analyses'), analysisDoc);
            setAnalysisProgress(100);

            setTimeout(() => {
                navigate(`/results/${docRef.id}`);
            }, 800);

        } catch (error: any) {
            console.error("Error generating analysis. Detailed trace:", error);
            const errMsg = error?.message || "Check API connections.";
            setAnalysisMessage(`Error: Failed to generate report. ${errMsg}`);
            setTimeout(() => setIsAnalyzing(false), 5000);
        }
    };

    if (isAnalyzing) {
        return (
            <div className="fixed inset-0 z-[100] bg-background-primary flex flex-col items-center justify-center p-8 overflow-hidden font-mono text-xs select-none">
                {/* Advanced Grid Background */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#000000_80%)]" />
                </div>

                {/* Left Side: Processing Nodes */}
                <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-8 w-48 z-10">
                    <h3 className="text-text-muted/50 tracking-[0.3em] text-[10px] mb-2 uppercase">Core Modules</h3>
                    {[
                        { label: 'MARKET_IQ', val: analysisProgress > 15 ? 'SYNCED' : 'WAIT' },
                        { label: 'COMPETITORS', val: analysisProgress > 35 ? 'SYNCED' : 'WAIT' },
                        { label: 'FIN_MODEL', val: analysisProgress > 55 ? 'SYNCED' : 'WAIT' },
                        { label: 'REGULATORY', val: analysisProgress > 75 ? 'SYNCED' : 'WAIT' },
                        { label: 'SWOT_MATRIX', val: analysisProgress > 90 ? 'SYNCED' : 'WAIT' }
                    ].map((node, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="flex justify-between text-[10px] tracking-widest font-bold">
                                <span className={node.val === 'SYNCED' ? 'text-text-muted' : 'text-text-muted/40'}>{node.label}</span>
                                <span className={node.val === 'SYNCED' ? 'text-accent-success shadow-[0_0_10px_rgba(48,209,88,0.5)]' : 'text-accent-warning animate-pulse'}>{node.val}</span>
                            </div>
                            <div className="h-[2px] w-full bg-background-elevated overflow-hidden">
                                <motion.div
                                    className={`h-full shadow-[0_0_8px_currentColor] ${node.val === 'SYNCED' ? 'bg-accent-success' : 'bg-accent-warning'}`}
                                    initial={{ width: '0%' }}
                                    animate={{ width: node.val === 'SYNCED' ? '100%' : '40%' }}
                                    transition={{ duration: 1, ease: 'easeInOut' }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Side: Raw Hex Output */}
                <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 w-48 text-[9px] text-text-muted/40 text-right tracking-widest z-10 leading-relaxed">
                    <h3 className="text-text-muted/50 tracking-[0.3em] text-[10px] mb-2 text-left uppercase">Memory Stack</h3>
                    <p>0x7F2A: ALLOC_MEM(0x1000)</p>
                    <p>0x7F2B: JMP 0x8A92</p>
                    <p>0x7F2C: SYNC_THREAD(1)</p>
                    <p className="text-accent-primary/70 animate-pulse">0x7F2D: LOAD_LLM(gemini)</p>
                    <p>0x7F2E: CALCULATE_TAM()</p>
                    <p>0x7F2F: AWAIT_RESPONSE</p>
                    <p>0x7F30: PARSE_JSON()</p>
                    <p>0x7F31: CALIBRATE_RISK()</p>
                    <p className="text-accent-secondary/70">0x7F32: FLUSH_BUFFER()</p>
                </div>

                {/* Central HUD elements */}
                <div className="relative z-20 w-full max-w-2xl flex flex-col items-center">
                    {/* Advanced Concentric Spinner */}
                    <div className="relative w-56 h-56 mb-16 flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                            className="absolute inset-0 border border-t-accent-primary border-r-transparent border-b-accent-secondary border-l-transparent rounded-full opacity-50"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                            className="absolute inset-4 border border-dashed border-border-cyan rounded-full opacity-30"
                        />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                            className="absolute inset-8 border border-t-transparent border-r-accent-primary border-b-transparent border-l-accent-primary rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                        />

                        <motion.div
                            animate={{ scale: [0.95, 1.05, 0.95] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                            className="relative z-10 text-white bg-background-primary rounded-full p-6 shadow-[0_0_40px_rgba(59,130,246,0.2)]"
                        >
                            <BrainCircuit className="w-12 h-12 text-accent-primary animate-pulse" />
                        </motion.div>

                        <div className="absolute inset-0 bg-accent-primary/10 blur-[80px] rounded-full point-events-none" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2 tracking-[0.25em] uppercase font-display">
                        Quantum Synthesis
                    </h2>

                    <div className="h-8 mb-10 flex items-center justify-center text-center">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={analysisMessage}
                                initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -5, filter: 'blur(4px)' }}
                                className="text-sm text-accent-primary tracking-widest uppercase"
                            >
                                {analysisMessage}...
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full space-y-3">
                        <div className="flex justify-between text-text-muted/70 text-[10px] tracking-[0.2em] font-bold">
                            <span>SYS.CORE.PROCESS</span>
                            <span className="text-accent-primary">{analysisProgress}%</span>
                        </div>
                        <div className="relative w-full h-[3px] bg-background-elevated overflow-hidden rounded-full">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-secondary to-accent-primary shadow-[0_0_15px_#3b82f6]"
                                initial={{ width: 0 }}
                                animate={{ width: `${analysisProgress}%` }}
                                transition={{ ease: "easeInOut", duration: 0.5 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Live Terminal Log */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-background-elevated/20 border border-white/5 backdrop-blur-md rounded-xl p-5 overflow-hidden z-10 hidden sm:block">
                    <div className="flex flex-col justify-end gap-2 text-[10px] text-text-muted/60 tracking-wider h-[80px]">
                        <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>&gt; Initializing neural linkage to strategic backend...</motion.p>
                        <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}>&gt; Established secure data context for {formData.industry} vertical.</motion.p>
                        <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2 }}>&gt; Fetching real-time competitor density and market overlap...</motion.p>
                        {analysisProgress > 30 && <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-white/80">&gt; SUCCESS: Extracted localized market vectors.</motion.p>}
                        {analysisProgress > 50 && <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>&gt; Simulating 36-month financial trajectory based on $ {formData.burnRate} burn...</motion.p>}
                        {analysisProgress > 70 && <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-accent-primary">&gt; Applying proprietary risk isolation scoring algorithms...</motion.p>}
                        {analysisProgress > 95 && <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-accent-success font-bold">&gt; ALL SYSTEMS GREEN. Formatting final intelligence payload.</motion.p>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-primary text-text-primary flex flex-col relative overflow-hidden font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/5 rounded-full blur-[150px]" />
            </div>

            <div className="absolute top-0 left-0 right-0 h-1 bg-background-elevated z-50">
                <motion.div
                    className="h-full bg-accent-primary shadow-[0_0_10px_#3b82f6]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStage / (STAGES.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>

            <header className="relative z-10 w-full p-8 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Rocket className="text-accent-primary w-6 h-6" />
                    <span className="font-display font-bold tracking-widest text-sm uppercase text-text-secondary">Stage {currentStage + 1} / {STAGES.length}</span>
                </div>
                <div className="text-sm font-bold tracking-widest text-text-muted uppercase">
                    {STAGES[currentStage]}
                </div>
            </header>

            <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 sm:p-12 md:p-24 w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStage}
                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 1.02 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full flex flex-col items-center max-w-4xl"
                    >
                        {currentStage === 0 && <Stage1 data={formData} update={updateForm} />}
                        {currentStage === 1 && <Stage2 data={formData} update={updateForm} />}
                        {currentStage === 2 && <Stage3 data={formData} update={updateForm} />}
                        {currentStage === 3 && <Stage4 data={formData} update={updateForm} />}
                        {currentStage === 4 && <Stage5 data={formData} update={updateForm} />}
                        {currentStage === 5 && <Stage6 data={formData} setStage={setCurrentStage} handleLaunch={handleLaunch} />}
                    </motion.div>
                </AnimatePresence>
            </main>

            <footer className="relative z-10 p-8 flex justify-between items-center max-w-6xl mx-auto w-full">
                <button
                    onClick={handlePrev}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${currentStage === 0 ? 'opacity-0 pointer-events-none' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                >
                    <ChevronLeft className="w-5 h-5" /> Back
                </button>

                {currentStage < STAGES.length - 1 && (
                    <div className="flex items-center gap-4 animate-[fade-in-up_1s_ease-out_forwards]">
                        <span className="text-text-muted/50 text-sm hidden sm:inline-block tracking-wide">Press Enter ↵</span>
                        <button
                            onClick={handleNext}
                            className="bg-white text-black px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                        >
                            Continue <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </footer>
        </div>
    );
}

function Stage1({ data, update }: any) {
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        if (data.industry) {
            setIsThinking(true);
            const timer = setTimeout(() => setIsThinking(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [data.industry]);

    const availableStates = getStatesForCountry(data.country);
    const availableCities = data.geoState ? getCitiesForState(data.country, data.geoState) : [];

    return (
        <div className="w-full max-w-2xl flex flex-col gap-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
                Let's start with the <span className="text-accent-primary">Fundamentals</span>.
            </h1>

            <div className="space-y-10">
                <div className="group relative">
                    <input
                        type="text"
                        value={data.name}
                        onChange={e => update({ name: e.target.value })}
                        placeholder="Company Name"
                        className="w-full bg-transparent border-b-2 border-border-cyan/30 text-3xl md:text-4xl py-4 focus:outline-none focus:border-accent-primary transition-colors placeholder:text-text-muted/30"
                        autoFocus
                    />
                </div>

                <div className="group relative">
                    <input
                        type="text"
                        value={data.tagline}
                        onChange={e => update({ tagline: e.target.value })}
                        placeholder="One sentence pitch (e.g. AI for Legal Teams)"
                        className="w-full bg-transparent border-b-2 border-border-cyan/30 text-xl md:text-2xl py-4 focus:outline-none focus:border-accent-primary transition-colors placeholder:text-text-muted/30"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-3 relative">
                        <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Industry Sector</label>
                        <PillSelector
                            options={['AI/ML', 'FinTech', 'HealthTech', 'EdTech', 'E-Commerce', 'SaaS', 'AgriTech', 'CleanTech', 'Other']}
                            value={data.industry}
                            onChange={(val) => update({ industry: val })}
                        />
                        <AnimatePresence>
                            {isThinking && data.name.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                    className="absolute -right-4 -top-8 bg-accent-primary text-white text-xs px-4 py-2 rounded-full font-medium flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.5)] z-10"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Calibrating {data.industry} models...
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Market Focus</label>
                        <PillSelector
                            options={['B2B', 'B2C', 'B2B2C', 'D2C', 'B2G', 'Marketplace']}
                            value={data.targetMarket}
                            onChange={(val) => update({ targetMarket: val })}
                        />
                    </div>
                </div>

                {/* ── Geography: Country → State → City ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Country / HQ</label>
                        <div className="relative">
                            <select
                                value={data.country}
                                onChange={e => update({ country: e.target.value, geoState: '', geoCity: '' })}
                                className="w-full bg-background-elevated/40 border border-border-cyan/30 text-text-primary rounded-xl px-4 py-3 text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 transition-all hover:border-white/20 hover:bg-background-elevated/60"
                            >
                                {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-text-muted uppercase">State / Region</label>
                        <div className="relative">
                            <select
                                value={data.geoState}
                                onChange={e => update({ geoState: e.target.value, geoCity: '' })}
                                className="w-full bg-background-elevated/40 border border-border-cyan/30 text-text-primary rounded-xl px-4 py-3 text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 transition-all hover:border-white/20 hover:bg-background-elevated/60"
                            >
                                <option value="">Select State</option>
                                {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-text-muted uppercase">City</label>
                        <div className="relative">
                            <select
                                value={data.geoCity}
                                onChange={e => update({ geoCity: e.target.value })}
                                disabled={!data.geoState}
                                className={`w-full bg-background-elevated/40 border border-border-cyan/30 text-text-primary rounded-xl px-4 py-3 text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 transition-all hover:border-white/20 hover:bg-background-elevated/60 ${!data.geoState ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                <option value="">Select City</option>
                                {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Stage2({ data, update }: any) {
    return (
        <div className="w-full max-w-2xl flex flex-col gap-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                Define your <span className="text-accent-secondary">Market Position</span>.
            </h1>

            <div className="space-y-12">
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <label className="text-sm font-bold tracking-widest text-text-muted uppercase">Estimated Competitors</label>
                        <span className="text-4xl font-mono text-white">{data.competitorCount}</span>
                    </div>
                    <input type="range" min="0" max="250" value={data.competitorCount} onChange={e => update({ competitorCount: parseInt(e.target.value) })} className="w-full accent-accent-primary h-2 bg-background-elevated rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between text-xs text-text-muted/50 font-medium tracking-wide uppercase">
                        <span>Blue Ocean</span>
                        <span>Saturated</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <label className="text-sm font-bold tracking-widest text-text-muted uppercase">Market Overlap %</label>
                        <span className="text-4xl font-mono text-white">{data.marketOverlapPct}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={data.marketOverlapPct} onChange={e => update({ marketOverlapPct: parseInt(e.target.value) })} className="w-full accent-accent-secondary h-2 bg-background-elevated rounded-lg appearance-none cursor-pointer" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Primary Differentiation</label>
                        <PillSelector
                            options={['Technology Innovation', 'Price', 'UX/Design', 'Niche Focus', 'Brand/Community', 'Network Effects', 'Proprietary Data']}
                            value={data.differentiationType}
                            onChange={(val) => update({ differentiationType: val })}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Switching Cost</label>
                        <PillSelector
                            options={['Low', 'Medium', 'High']}
                            value={data.switchingCost}
                            onChange={(val) => update({ switchingCost: val })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Stage3({ data, update }: any) {
    return (
        <div className="w-full max-w-2xl flex flex-col gap-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                Tell us about your <span className="text-accent-primary">Execution</span> capabilities.
            </h1>

            <div className="space-y-12">
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <label className="text-sm font-bold tracking-widest text-text-muted uppercase">Team Size</label>
                        <span className="text-4xl font-mono text-white">{data.teamSize}</span>
                    </div>
                    <input type="range" min="1" max="200" value={data.teamSize} onChange={e => update({ teamSize: parseInt(e.target.value) })} className="w-full accent-accent-primary h-2 bg-background-elevated rounded-lg appearance-none cursor-pointer" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Founder Background</label>
                        <PillSelector
                            options={['First-time founder', '1 prior startup', 'Serial entrepreneur (2+)']}
                            value={data.founderBg}
                            onChange={(val) => update({ founderBg: val })}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Technical Capability</label>
                        <PillSelector
                            options={['Low', 'Medium', 'High', 'Expert']}
                            value={data.technicalCapability}
                            onChange={(val) => update({ technicalCapability: val })}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Product Stage</label>
                        <PillSelector
                            options={['Idea', 'MVP', 'Beta', 'Launched', 'Scaling']}
                            value={data.productDevelopmentStage}
                            onChange={(val) => update({ productDevelopmentStage: val })}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Infrastructure Complexity</label>
                        <PillSelector
                            options={['Low', 'Medium', 'High', 'Very High']}
                            value={data.infrastructureComplexity}
                            onChange={(val) => update({ infrastructureComplexity: val })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Stage4({ data, update }: any) {
    const sym = getCurrencySymbol(data.country);
    return (
        <div className="w-full max-w-2xl flex flex-col gap-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                Outline your <span className="text-accent-gold">Financial Structure</span>.
            </h1>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3 relative group">
                        <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Monthly Burn Rate</label>
                        <div className="absolute top-[42px] left-6 font-mono text-text-muted text-xl">{sym}</div>
                        <input type="number" className="w-full bg-transparent border-b-2 border-border-cyan/30 text-3xl font-mono py-4 pl-12 focus:outline-none focus:border-accent-primary transition-colors" value={data.burnRate} onChange={e => update({ burnRate: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-3 relative group">
                        <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Current Funding</label>
                        <div className="absolute top-[42px] left-6 font-mono text-text-muted text-xl">{sym}</div>
                        <input type="number" className="w-full bg-transparent border-b-2 border-border-cyan/30 text-3xl font-mono py-4 pl-12 focus:outline-none focus:border-accent-primary transition-colors" value={data.currentFunding} onChange={e => update({ currentFunding: parseFloat(e.target.value) || 0 })} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                    <div className="space-y-3">
                        <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Funding Stage</label>
                        <PillSelector
                            options={['Pre-Revenue', 'Revenue (Early)', 'Revenue (Growing)', 'Profitable']}
                            value={data.fundingStage}
                            onChange={(val) => update({ fundingStage: val })}
                        />
                    </div>
                    <div className="space-y-6">
                        <div className="flex justify-between items-end pb-3">
                            <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Est. Runway (Months)</label>
                            <span className="text-2xl font-mono text-white">{data.runwayMonths}</span>
                        </div>
                        <input type="range" min="0" max="36" value={data.runwayMonths} onChange={e => update({ runwayMonths: parseInt(e.target.value) })} className="w-full accent-accent-primary h-2 bg-background-elevated rounded-lg appearance-none cursor-pointer" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Stage5({ data, update }: any) {
    return (
        <div className="w-full max-w-2xl flex flex-col gap-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                Finally, let's assess your <span className="text-accent-secondary">Risk Profile</span>.
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Industry Regulation</label>
                    <PillSelector
                        options={['Highly Regulated', 'Moderately Regulated', 'Low Regulation', 'Unregulated']}
                        value={data.industryCategory}
                        onChange={(val) => update({ industryCategory: val })}
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Data Privacy Handling</label>
                    <PillSelector
                        options={['No user data', 'Basic data', 'Sensitive personal data', 'Financial data', 'Health data', 'Biometric data']}
                        value={data.dataPrivacy}
                        onChange={(val) => update({ dataPrivacy: val })}
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Geopolitical Risk</label>
                    <PillSelector
                        options={['Low', 'Medium', 'High', 'Very High']}
                        value={data.geopoliticalRisk}
                        onChange={(val) => update({ geopoliticalRisk: val })}
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-bold tracking-widest text-text-muted uppercase">Market Timing</label>
                    <PillSelector
                        options={['Too early', 'Good timing', 'Peak', 'Late/declining']}
                        value={data.marketTiming}
                        onChange={(val) => update({ marketTiming: val })}
                    />
                </div>
            </div>
        </div>
    );
}

function Stage6({ data, setStage, handleLaunch }: any) {
    return (
        <div className="w-full max-w-4xl flex flex-col gap-12 items-center text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                Ready to synthesize <span className="text-accent-primary">{data.name || 'your startup'}</span>?
            </h1>

            <p className="text-text-muted text-lg max-w-xl">
                We will now process your parameters against live market data, macroeconomic indicators, and competitor matrices utilizing Gemini.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full mt-4">
                {[
                    { title: 'Fundamentals', metric: data.industry, subtitle: `${data.country}${data.geoState ? ', ' + data.geoState : ''}`, action: () => setStage(0) },
                    { title: 'Market', metric: `${data.competitorCount} Competitors`, subtitle: data.differentiationType, action: () => setStage(1) },
                    { title: 'Team', metric: `${data.teamSize} Members`, subtitle: data.productDevelopmentStage, action: () => setStage(2) },
                    { title: 'Finance', metric: `${getCurrencySymbol(data.country)}${data.burnRate}/mo Burn`, subtitle: `${data.runwayMonths}mo Runway`, action: () => setStage(3) }
                ].map((item, idx) => (
                    <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="glass-card p-6 bg-background-elevated/10 hover:bg-background-elevated/30 hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(59,130,246,0.4)] hover:border-accent-primary/60 border border-transparent transition-all duration-400 cursor-pointer text-left relative overflow-hidden group"
                        onClick={item.action}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/0 via-accent-primary/0 to-accent-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{item.title}</span>
                            <motion.div
                                whileHover={{ rotate: 15, scale: 1.2 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <Edit3 className="w-4 h-4 text-accent-primary group-hover:text-white transition-colors" />
                            </motion.div>
                        </div>
                        <p className="text-xl font-medium text-white mb-1 relative z-10 transition-transform duration-300 group-hover:translate-x-1">{item.metric}</p>
                        <p className="text-sm text-text-muted relative z-10 transition-transform duration-300 group-hover:translate-x-1 delay-75">{item.subtitle}</p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 flex justify-center w-full">
                <div className="relative group inline-block">
                    <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-[bg-pan_4s_linear_infinite]" />
                    <button
                        onClick={handleLaunch}
                        className="relative px-12 py-6 bg-white text-black rounded-full font-bold text-xl overflow-hidden transition-all hover:scale-[1.02]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:transition-transform group-hover:duration-1000 group-hover:translate-x-full" />
                        <span className="relative flex items-center gap-3">
                            <Rocket className="w-6 h-6" /> Generate Venture Intelligence
                        </span>
                    </button>
                </div>
            </div>
            <p className="text-xs text-text-muted tracking-widest uppercase">Or press Enter to execute</p>
        </div>
    )
}

function PillSelector({ options, value, onChange }: { options: string[], value: string, onChange: (val: string) => void }) {
    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {options.map(i => (
                <button
                    key={i}
                    onClick={() => onChange(i)}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 focus:outline-none ${value === i ? 'bg-accent-primary/20 border-accent-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-accent-primary/50' : 'bg-background-elevated/30 border-white/5 text-text-muted hover:border-white/20 hover:bg-white/5 hover:text-white'}`}
                >
                    {i}
                </button>
            ))}
        </div>
    )
}
