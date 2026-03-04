import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../utils/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { FileText, FolderOpen, ArrowRight, Trash2, ShieldAlert } from 'lucide-react';

const MyReports = () => {
    const navigate = useNavigate();
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            const user = auth.currentUser;
            if (user) {
                const q = query(
                    collection(db, 'analyses'),
                    where('uid', '==', user.uid)
                );
                try {
                    const querySnapshot = await getDocs(q);
                    const fetched: any[] = [];
                    querySnapshot.forEach((docSnap) => {
                        fetched.push({ id: docSnap.id, ...docSnap.data() });
                    });
                    fetched.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
                    setAnalyses(fetched);
                } catch (error) {
                    console.error("Error fetching reports:", error);
                }
            }
            setLoading(false);
        };
        fetchReports();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this report?")) {
            try {
                await deleteDoc(doc(db, 'analyses', id));
                setAnalyses(prev => prev.filter(a => a.id !== id));
            } catch (error) {
                console.error("Error deleting report:", error);
            }
        }
    };

    const getRiskColor = (level: string) => {
        if (!level) return 'text-text-muted bg-background-elevated border-border-cyan';
        const upper = level.toUpperCase();
        if (upper.includes('LOW')) return 'text-accent-success bg-accent-success/10 border-accent-success/30';
        if (upper.includes('MODERATE') || upper.includes('MEDIUM')) return 'text-accent-warning bg-accent-warning/10 border-accent-warning/30';
        if (upper.includes('HIGH')) return 'text-accent-danger bg-accent-danger/10 border-accent-danger/30';
        return 'text-text-muted bg-background-elevated border-border-cyan';
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-accent-primary">Loading Intelligence Library...</div>;
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">

            <div className="flex items-center justify-between border-b border-border-cyan/30 pb-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                        <FileText className="text-accent-primary w-8 h-8" /> My Intelligence Library
                    </h1>
                    <p className="text-text-secondary mt-1">Access and manage your generated venture reports.</p>
                </div>
                <button onClick={() => navigate('/intake')} className="btn-primary">New Analysis</button>
            </div>

            {analyses.length === 0 ? (
                <div className="glass-card p-20 flex flex-col items-center justify-center text-center border-dashed border-border-cyan/50 mt-10">
                    <FolderOpen className="w-16 h-16 text-text-muted mb-6 opacity-50" />
                    <h2 className="text-2xl font-bold text-white mb-2">No Reports Generated</h2>
                    <p className="text-text-secondary max-w-md mx-auto mb-8">
                        You haven't run any AI-powered startup intelligence reports yet. Ready to analyze your venture?
                    </p>
                    <button onClick={() => navigate('/intake')} className="btn-primary">Start New Analysis</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {analyses.map(analysis => (
                        <div
                            key={analysis.id}
                            onClick={() => navigate(`/results/${analysis.id}`)}
                            className="glass-card p-6 cursor-pointer hover:border-accent-primary/60 transition-all group flex flex-col h-full relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-primary/5 rounded-full filter blur-2xl group-hover:bg-accent-primary/10 transition-all" />

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <h3 className="font-bold text-xl text-white group-hover:text-accent-primary transition-colors pr-8">
                                    {analysis.name}
                                </h3>
                                <button
                                    onClick={(e) => handleDelete(analysis.id, e)}
                                    className="text-text-muted hover:text-accent-danger transition-colors p-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="mb-6 space-y-2 relative z-10">
                                <p className="text-sm text-text-secondary flex items-center justify-between">
                                    <span>Industry:</span> <span className="text-text-primary capitalize">{analysis.industry}</span>
                                </p>
                                <p className="text-sm text-text-secondary flex items-center justify-between">
                                    <span>Date:</span> <span className="text-text-primary">{analysis.createdAt?.toDate ? analysis.createdAt.toDate().toLocaleDateString() : 'Just now'}</span>
                                </p>
                            </div>

                            <div className="mt-auto border-t border-border-cyan/20 pt-4 flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg border ${getRiskColor(analysis.riskClassification)}`}>
                                        <div className="text-lg font-mono leading-none">{analysis.overallRisk}</div>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase ${getRiskColor(analysis.riskClassification).split(' ')[0]}`}>
                                        {analysis.riskClassification}
                                    </span>
                                </div>

                                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-accent-primary transform group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyReports;
