import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { fetchAITrends, fetchAIInsight, fetchGovernmentSchemes } from '../utils/gemini';
import { Activity, Rocket, Clock, TrendingUp, AlertTriangle, FolderOpen, BrainCircuit, ExternalLink, Landmark } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// Custom Components
import { SpotlightCard } from '../components/ui/spotlight-card';
import { RadialChart } from '../components/ui/radial-chart';
import { SplineSceneBasic } from '../components/SplineSceneBasic';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

const DashboardHome = () => {
    const navigate = useNavigate();

    // Context & User State
    const [userName, setUserName] = useState<string>('Founder');
    const [userCountry, setUserCountry] = useState<string>('India');

    // Stats
    const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
    const [totalAnalyses, setTotalAnalyses] = useState(0);
    const [avgRisk, setAvgRisk] = useState(0);

    // Initial auth loader
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserName(user.displayName?.split(' ')[0] || 'Founder');
                loadFirestoreData(user.uid);
            } else {
                navigate('/auth');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const loadFirestoreData = async (uid: string) => {
        try {
            const q = query(collection(db, 'analyses'), where('uid', '==', uid));
            const querySnapshot = await getDocs(q);
            const analyses: any[] = [];
            let sumRisk = 0;
            let country = 'India';

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                analyses.push({ id: doc.id, ...data });
                sumRisk += data.overallRisk || 0;
                if (data.inputs?.country) country = data.inputs.country;
            });

            analyses.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
            
            setTotalAnalyses(analyses.length);
            setAvgRisk(analyses.length > 0 ? Math.round(sumRisk / analyses.length) : 0);
            setRecentAnalyses(analyses.slice(0, 3));
            setUserCountry(country);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load your past analyses.");
        }
    };

    // React Query: AI Trends
    const { data: pulseNews, isLoading: loadingNews } = useQuery({
        queryKey: ['aiTrends'],
        queryFn: async () => {
            const data = await fetchAITrends();
            return Array.isArray(data) ? data : [];
        },
        staleTime: 10 * 60 * 1000,
    });

    // React Query: Insight
    const { data: dailyInsight } = useQuery({
        queryKey: ['dailyInsight'],
        queryFn: async () => {
            const data = await fetchAIInsight();
            return data?.insight || "Founders who prioritize defining clear unit economics prior to Seed stage demonstrate a 40% higher probability of surviving beyond Month 24, regardless of sector headwinds.";
        },
        staleTime: 60 * 60 * 1000, // 1 hour
    });

    // React Query: Gov Schemes
    const { data: govSchemes, isLoading: loadingSchemes } = useQuery({
        queryKey: ['govSchemes', userCountry],
        queryFn: async () => {
            const data = await fetchGovernmentSchemes(userCountry);
            return Array.isArray(data) ? data : [];
        },
        enabled: !!userCountry,
        staleTime: 60 * 60 * 1000, // 1 hour
    });

    const getRiskColor = (level: string) => {
        if (!level) return 'text-text-muted bg-background-elevated border-border-cyan';
        const upper = level.toUpperCase();
        if (upper.includes('LOW')) return 'text-accent-success bg-accent-success/10 border-accent-success/30';
        if (upper.includes('MODERATE') || upper.includes('MEDIUM')) return 'text-accent-warning bg-accent-warning/10 border-accent-warning/30';
        if (upper.includes('HIGH')) return 'text-accent-danger bg-accent-danger/10 border-accent-danger/30';
        return 'text-text-muted bg-background-elevated border-border-cyan';
    };

    const categoryIcons: Record<string, string> = {
        grant: '💰',
        loan: '🏦',
        tax_benefit: '📋',
        incubation: '🏢',
        mentorship: '🎓',
    };

    return (
        <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* Advanced Welcome Banner */}
            <motion.div variants={itemVariants} className="w-full">
                <SplineSceneBasic userName={userName} onStartAnalysis={() => navigate('/intake')} />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-12">

                    {/* Quick Stats — Premium Visualization */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-8">
                        <SpotlightCard className="p-8 h-[200px] flex flex-col justify-between border-l-[3px] border-l-accent-primary cursor-default relative overflow-hidden group hover:-translate-y-2 transition-all duration-700 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.25)] bg-gradient-to-br from-background-elevated/40 to-transparent">
                            {/* Decorative Background Chart */}
                            <div className="absolute -bottom-16 -right-16 opacity-[0.15] group-hover:scale-110 group-hover:rotate-12 group-hover:opacity-30 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none filter blur-[1px]">
                                <RadialChart value={totalAnalyses} maxValue={50} size={240} strokeWidth={8} color="var(--accent-primary)" label="" />
                            </div>
                            
                            <div className="relative z-10 w-full flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center shadow-inner group-hover:bg-accent-primary/20 transition-colors duration-500">
                                    <Activity className="text-accent-primary w-5 h-5 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted/60 font-mono">Total Volume</span>
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <h3 className="font-display font-light text-5xl text-white tracking-tight">{totalAnalyses}</h3>
                                    <span className="text-text-muted text-sm font-semibold uppercase tracking-wider">Scans</span>
                                </div>
                                <p className="text-text-secondary text-xs leading-relaxed max-w-[200px]">Active venture intelligence profiles mapped.</p>
                            </div>
                        </SpotlightCard>
                        
                        <SpotlightCard className="p-8 h-[200px] flex flex-col justify-between border-l-[3px] border-l-accent-warning cursor-default relative overflow-hidden group hover:-translate-y-2 transition-all duration-700 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-15px_rgba(255,159,10,0.25)] bg-gradient-to-br from-background-elevated/40 to-transparent">
                            {/* Decorative Background Chart */}
                            <div className="absolute -bottom-16 -right-16 opacity-[0.15] group-hover:scale-110 group-hover:-rotate-12 group-hover:opacity-30 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none filter blur-[1px]">
                                <RadialChart value={avgRisk} maxValue={100} size={240} strokeWidth={8} color="var(--accent-warning)" label="" />
                            </div>
                            
                            <div className="relative z-10 w-full flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-full bg-accent-warning/10 border border-accent-warning/20 flex items-center justify-center shadow-inner group-hover:bg-accent-warning/20 transition-colors duration-500">
                                    <AlertTriangle className="text-accent-warning w-5 h-5 group-hover:scale-110 group-hover:animate-pulse transition-transform duration-500" />
                                </div>
                                <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted/60 font-mono">System Metric</span>
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-baseline gap-1 mb-1">
                                    <h3 className="font-display font-light text-5xl text-white tracking-tight">{avgRisk}</h3>
                                    <span className="text-text-muted text-sm font-mono pb-1">/100</span>
                                </div>
                                <p className="text-text-secondary text-xs leading-relaxed max-w-[200px]">Aggregate holistic risk score across portfolio.</p>
                            </div>
                        </SpotlightCard>
                    </motion.div>

                    {/* Recent Analyses Grid */}
                    <motion.div variants={itemVariants} className="pt-4">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-cyan/30">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-2xl font-display font-bold flex items-center gap-3 tracking-wide">
                                    <Clock className="w-6 h-6 text-accent-primary" /> Intelligence Reports
                                </h3>
                                <p className="text-sm text-text-muted pl-9">Your recently generated venture scans.</p>
                            </div>
                            {recentAnalyses.length > 0 && (
                                <button onClick={() => navigate('/reports')} className="text-accent-primary hover:text-white transition-colors text-sm font-bold tracking-widest uppercase flex items-center gap-2 px-4 py-2 rounded-full hover:bg-accent-primary/10">
                                    View Repository <ExternalLink className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {recentAnalyses.length === 0 ? (
                            <SpotlightCard className="p-16 flex flex-col items-center justify-center text-center border-dashed border-border-cyan/40 bg-background-elevated/5">
                                <div className="w-20 h-20 rounded-full bg-accent-primary/10 flex items-center justify-center mb-6 shadow-inner">
                                    <FolderOpen className="w-10 h-10 text-accent-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                </div>
                                <h4 className="text-white text-xl font-display font-semibold mb-2">No Intelligence Generated</h4>
                                <p className="text-text-muted text-sm max-w-[300px] leading-relaxed mb-8">Initiate your first quantum-powered risk assessment to populate this repository.</p>
                                <button onClick={() => navigate('/intake')} className="group relative px-8 py-3 bg-white text-black rounded-full font-bold text-sm overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:transition-transform group-hover:duration-700 group-hover:translate-x-full" />
                                    <span className="relative flex items-center gap-2">Initialize Scan <Rocket className="w-4 h-4 ml-1" /></span>
                                </button>
                            </SpotlightCard>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {recentAnalyses.map((analysis) => (
                                    <SpotlightCard key={analysis.id}
                                        onClick={() => navigate(`/results/${analysis.id}`)}
                                        className="p-8 group hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(59,130,246,0.2)] hover:border-accent-primary/50 transition-all duration-500 cursor-pointer overflow-hidden relative"
                                    >
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-accent-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                        
                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div className="flex flex-col gap-1">
                                                <h4 className="font-bold text-xl text-white leader-snug pr-2 group-hover:text-accent-primary transition-colors">{analysis.name}</h4>
                                                <span className="text-xs text-text-muted font-mono">{analysis.industry || 'Unknown Sector'}</span>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-md text-[10px] uppercase tracking-widest font-bold border ${getRiskColor(analysis.riskClassification)} shadow-sm`}>
                                                {analysis.riskClassification}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end border-t border-white/5 pt-5 relative z-10">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-text-muted/60 uppercase tracking-[0.2em] font-bold">Synthesized Risk</span>
                                                <div className="flex items-baseline gap-1">
                                                    <strong className="text-white text-3xl font-display font-light">{analysis.overallRisk}</strong>
                                                    <span className="text-text-muted text-sm font-mono">/100</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-text-muted font-mono bg-background-elevated/80 px-3 py-1.5 rounded border border-border-cyan/20 backdrop-blur-sm">
                                                <Clock className="w-3 h-3 opacity-50" />
                                                {analysis.createdAt?.toDate ? analysis.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                            </div>
                                        </div>
                                    </SpotlightCard>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Government Schemes Section */}
                    <motion.div variants={itemVariants} className="pt-8">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-cyan/30">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-2xl font-display font-bold flex items-center gap-3 tracking-wide">
                                    <Landmark className="w-6 h-6 text-accent-success" /> Regional Grants & Schemes
                                </h3>
                                <p className="text-sm text-text-muted pl-9">Opportunities matched to your local jurisdiction.</p>
                            </div>
                            <div className="flex items-center gap-2 bg-accent-success/10 px-4 py-2 rounded-full border border-accent-success/30 shadow-[0_0_15px_rgba(48,209,88,0.15)]">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-success opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-success"></span>
                                </span>
                                <span className="text-[10px] font-bold tracking-widest text-accent-success uppercase">{userCountry} ACTIVE</span>
                            </div>
                        </div>

                        {loadingSchemes ? (
                            <SpotlightCard className="h-64 flex items-center justify-center border-dashed border-border-cyan/30 bg-background-elevated/5">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute w-16 h-16 border border-accent-success/30 rounded-full animate-ping" />
                                        <div className="w-12 h-12 border-2 border-accent-success border-t-transparent border-b-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(48,209,88,0.4)]" />
                                        <Landmark className="w-5 h-5 text-accent-success absolute" />
                                    </div>
                                    <span className="text-sm text-text-muted font-mono tracking-widest uppercase">Querying {userCountry} Gov Databases...</span>
                                </div>
                            </SpotlightCard>
                        ) : !govSchemes || govSchemes.length === 0 ? (
                            <SpotlightCard className="p-12 text-center border-dashed border-border-cyan/30 bg-background-elevated/5 cursor-default">
                                <Landmark className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-30" />
                                <h4 className="text-white text-lg font-medium mb-1">No Schemes Detected</h4>
                                <p className="text-sm text-text-secondary">Our crawlers didn't isolate any relevant grants for your region currently.</p>
                            </SpotlightCard>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {govSchemes.map((scheme: any, idx: number) => (
                                    <a
                                        key={scheme.id || idx}
                                        href={scheme.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block h-full group outline-none"
                                    >
                                        <SpotlightCard className="p-8 h-full flex flex-col border-border-cyan/30 hover:border-accent-success/60 hover:-translate-y-2 hover:shadow-[0_15px_30px_-10px_rgba(48,209,88,0.25)] transition-all duration-500 overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-success/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-accent-success/20 transition-colors duration-700" />
                                            
                                            <div className="flex items-start justify-between mb-5 relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-accent-success/10 border border-accent-success/30 flex items-center justify-center text-2xl shadow-inner group-hover:bg-accent-success/20 group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
                                                        {categoryIcons[scheme.category] || '📄'}
                                                    </div>
                                                    <h4 className="font-bold text-white text-[15px] group-hover:text-accent-success transition-colors max-w-[200px] leading-snug">{scheme.name}</h4>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-background-elevated flex items-center justify-center border border-border-cyan opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                    <ExternalLink className="w-3 h-3 text-accent-success" />
                                                </div>
                                            </div>
                                            <p className="text-[13px] text-text-secondary leading-relaxed mb-6 flex-grow relative z-10 group-hover:text-text-muted transition-colors">{scheme.description}</p>
                                            
                                            <div className="flex flex-wrap items-center gap-3 mt-auto pt-4 border-t border-white/5 relative z-10">
                                                {scheme.funding_amount && (
                                                    <span className="px-3 py-1.5 rounded-md text-xs font-mono font-bold bg-accent-success/10 text-accent-success border border-accent-success/20 shadow-sm flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-accent-success animate-pulse" />
                                                        {scheme.funding_amount}
                                                    </span>
                                                )}
                                                {scheme.deadline && (
                                                    <span className="px-3 py-1.5 rounded-md text-xs font-mono font-medium bg-background-elevated border border-border-cyan/20 flex items-center gap-1.5 text-text-muted">
                                                        <Clock className="w-3 h-3" />
                                                        {scheme.deadline}
                                                    </span>
                                                )}
                                            </div>
                                        </SpotlightCard>
                                    </a>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-6">

                    {/* Market Pulse Feed */}
                    <motion.div variants={itemVariants} className="h-full flex flex-col relative">
                        <SpotlightCard className="flex-1 flex flex-col border-border-cyan/30 overflow-hidden relative shadow-lg">
                            {/* Decorative background light */}
                            <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-secondary/15 rounded-full blur-[80px] pointer-events-none z-0" />
                            
                            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-background-elevated/40 z-10 relative backdrop-blur-xl">
                                <h3 className="font-display font-bold flex items-center gap-3 text-xl tracking-wide">
                                    <TrendingUp className="w-6 h-6 text-accent-secondary drop-shadow-[0_0_10px_rgba(94,92,230,0.5)]" /> Market Pulse
                                </h3>
                                <div className="flex items-center gap-2 bg-accent-secondary/10 px-3 py-1.5 rounded-full border border-accent-secondary/20 shadow-inner">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-secondary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-secondary shadow-[0_0_8px_currentColor]"></span>
                                    </span>
                                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-accent-secondary">Live</span>
                                </div>
                            </div>

                            <div className="p-8 flex-1 relative min-h-[350px] z-10">
                                {loadingNews ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                        <div className="relative w-12 h-12">
                                            <div className="absolute inset-0 border border-accent-secondary/30 rounded-full animate-ping" />
                                            <div className="absolute inset-0 border-2 border-accent-secondary border-l-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(94,92,230,0.4)]" />
                                        </div>
                                        <span className="text-xs text-text-muted font-mono tracking-widest uppercase animate-pulse">Syncing Feed...</span>
                                    </div>
                                ) : !pulseNews || pulseNews.length === 0 ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                                        <TrendingUp className="w-12 h-12 text-text-muted opacity-30 mb-4" />
                                        <p className="text-sm text-text-secondary leading-relaxed">Global tracking matrices are currently initializing. Awaiting data stream.</p>
                                    </div>
                                ) : (
                                    <motion.div 
                                        className="space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar pr-4 relative"
                                        initial="hidden" animate="show" variants={containerVariants}
                                    >
                                        {pulseNews.map((news: any, idx: number) => (
                                            <motion.div variants={itemVariants} key={news.id || idx} className="pb-6 border-b border-white/5 last:border-0 last:pb-0 group relative cursor-pointer">
                                                {/* Hover highlight bar */}
                                                <div className="absolute -left-4 top-0 bottom-6 w-1 bg-accent-secondary/60 rounded-r-md opacity-0 scale-y-50 group-hover:opacity-100 group-hover:scale-y-100 transition-all duration-300 transform origin-center shadow-[0_0_12px_rgba(94,92,230,0.6)]" />
                                                
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-2 h-2 rounded-full shadow-[0_0_10px] ${news.impact === 'positive' ? 'bg-accent-success shadow-accent-success/60' : news.impact === 'negative' ? 'bg-accent-danger shadow-accent-danger/60' : 'bg-accent-warning shadow-accent-warning/60'}`} />
                                                        <span className="text-[10px] font-mono text-text-primary px-2.5 py-1 rounded bg-background-elevated/80 border border-border-cyan/20 uppercase font-bold tracking-widest backdrop-blur-sm shadow-sm">{news.sector || 'Global'}</span>
                                                    </div>
                                                </div>
                                                {news.url ? (
                                                    <a href={news.url} target="_blank" rel="noopener noreferrer"
                                                        className="font-bold text-white text-[15px] leading-snug group-hover:text-accent-secondary transition-colors flex items-start gap-2 max-w-[95%]"
                                                    >
                                                        <span className="group-hover:translate-x-1 transition-transform duration-300">{news.title || 'Market Update'}</span>
                                                        <ExternalLink className="w-3.5 h-3.5 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-accent-secondary" />
                                                    </a>
                                                ) : (
                                                    <h4 className="font-bold text-white text-[15px] leading-snug group-hover:text-accent-secondary transition-colors group-hover:translate-x-1 duration-300">{news.title || 'Market Update'}</h4>
                                                )}
                                                <p className="text-[13px] text-text-secondary mt-3 opacity-70 group-hover:opacity-100 transition-opacity leading-relaxed max-w-[95%]">
                                                    {news.summary || 'No further details available.'}
                                                </p>
                                                {news.source && <p className="text-[10px] text-text-muted/60 font-mono mt-4 uppercase tracking-[0.2em] font-bold">SRC {'>'} {news.source}</p>}
                                            </motion.div>
                                        ))}
                                        {/* Fade gradient at bottom to indicate scroll */}
                                        <div className="sticky bottom-0 h-12 bg-gradient-to-t from-background-card to-transparent pointer-events-none w-full left-0" />
                                    </motion.div>
                                )}
                            </div>
                        </SpotlightCard>
                    </motion.div>

                    {/* Daily AI Insight */}
                    <motion.div variants={itemVariants}>
                        <SpotlightCard className="p-8 border-accent-secondary/50 relative overflow-hidden group cursor-default hover:shadow-[0_15px_30px_-10px_rgba(94,92,230,0.2)] hover:-translate-y-1 transition-all duration-500 rounded-2xl">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-secondary/20 rounded-full filter blur-[50px] group-hover:scale-150 group-hover:bg-accent-secondary/30 transition-all duration-700 pointer-events-none" />
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-accent-secondary/10 flex items-center justify-center mb-5 border border-accent-secondary/30 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    <BrainCircuit className="w-6 h-6 text-accent-secondary group-hover:animate-pulse" />
                                </div>
                                <h4 className="text-text-muted font-bold text-[10px] mb-4 uppercase tracking-[0.2em]">Quantum Daily Insight</h4>
                                <p className="text-white text-[15px] leading-relaxed italic font-medium px-4">
                                    "{dailyInsight}"
                                </p>
                            </div>
                        </SpotlightCard>
                    </motion.div>

                </div>
            </div>
        </motion.div>
    );
};

export default DashboardHome;
