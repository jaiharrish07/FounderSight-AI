import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { createChatSession, fetchChatSuggestions } from '../utils/gemini';
import { auth, db } from '../utils/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { ShieldAlert, Send, Copy, ThumbsUp, ThumbsDown, Trash2, ArrowLeft, RefreshCw, MessageSquare, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExpertChat() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state } = useAppContext();

    // Instead of state.analyses, query Firestore
    const [analysis, setAnalysis] = useState<any>(null);

    useEffect(() => {
        const fetchCurrentContext = async (userUid: string) => {
            if (id) {
                try {
                    const docSnap = await getDoc(doc(db, 'analyses', id));
                    if (docSnap.exists()) {
                        setAnalysis({ id: docSnap.id, ...docSnap.data() });
                    }
                } catch (err) {
                    console.error("Error fetching analysis for chat:", err);
                }
            } else {
                try {
                    const { collection, query, where, getDocs } = await import('firebase/firestore');
                    const q = query(collection(db, 'analyses'), where('uid', '==', userUid));
                    const snapshot = await getDocs(q);
                    if (!snapshot.empty) {
                        const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                        fetched.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
                        const firstDoc = fetched[0];
                        setAnalysis(firstDoc);
                        navigate(`/chat/${firstDoc.id}`, { replace: true });
                    }
                } catch (err) {
                    console.error("Error fetching fallback analysis:", err);
                }
            }
        };

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchCurrentContext(user.uid);
            } else {
                navigate('/auth');
            }
        });

        return () => unsubscribe();
    }, [id, navigate]);

    const actualId = analysis?.id;

    const scrollRef = useRef<HTMLDivElement>(null);
    const chatSessionRef = useRef<any>(null);

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loadingChat, setLoadingChat] = useState(true);

    const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string, timestamp: Date }[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    // Initialize Chat
    useEffect(() => {
        const initChat = async () => {
            if (!analysis) return;
            setLoadingChat(true);

            // Safely grab nested inputs if they exist (V2 formatting)
            const inputs = analysis.inputs || analysis;

            // 1. Build System Instruction Context
            const ctxString = `Startup Name: ${analysis.name || inputs.name}. Industry: ${inputs.industry}. Country: ${inputs.country}. Stage: ${inputs.stage || inputs.fundingStage}. Runway: ${inputs.runwayMonths} months. Risk Score: ${analysis.overallRisk}/100. Classification: ${analysis.riskClassification}. Exec Summary Context: ${analysis.aiAnalysis?.executiveSummary} You are FounderSight Expert, an elite 1st-tier VC partner giving brutally honest, highly strategic, specific advice. No fluff. Directly address their metrics. Keep answers concise, highly specific, and actionable. Frame responses around their specific runway and risks. Use markdown for readability.`;

            // 2. Fetch or Create Firestore Chat Document
            const chatId = `chat_${actualId}`;
            const chatRef = doc(db, 'chats', chatId);
            const chatDoc = await getDoc(chatRef);

            let history: any[] = [];
            let loadedMessages: any[] = [];

            if (chatDoc.exists()) {
                const data = chatDoc.data();
                if (data.history && data.history.length > 0) {
                    loadedMessages = data.history.map((h: any) => ({
                        role: h.role,
                        content: h.content,
                        timestamp: h.timestamp?.toDate ? h.timestamp.toDate() : new Date()
                    }));
                }
            } else {
                // Initialize default first message in UI
                const firstMsg = {
                    role: 'model' as const,
                    content: `Hello ${state.user?.name?.split(' ')[0] || 'Founder'}! I've analyzed ${analysis.name || inputs.name}. Based on your execution risk and ${inputs.runwayMonths} month runway, how can I help you strategize today?`,
                    timestamp: new Date()
                };
                loadedMessages = [firstMsg];
                await setDoc(chatRef, {
                    uid: auth.currentUser?.uid,
                    analysisId: actualId,
                    history: [firstMsg]
                });
            }

            // Gemini API strict requirement: History must start with a 'user' message and alternate.
            // Since our UI loadedMessages ALWAYS starts with the 'model' greeting, we prepend a hidden user prompt to the API array to satisfy the validation checking.
            history = [{ role: 'user', parts: [{ text: `Hello Expert! I am the founder of ${analysis.name || inputs.name}. Please review my dashboard metrics and help me strategize.` }] }];

            loadedMessages.forEach(msg => {
                history.push({ role: msg.role, parts: [{ text: msg.content }] });
            });

            setMessages(loadedMessages);
            try {
                chatSessionRef.current = createChatSession(ctxString, history);
            } catch (err) {
                console.error("Failed to inject chat context session", err);
            }

            // 3. Fetch Dynamic Suggestions asynchronously
            if (suggestions.length === 0) {
                fetchChatSuggestions(ctxString.substring(0, 300)).then(suggs => {
                    if (Array.isArray(suggs) && suggs.length > 0) {
                        setSuggestions(suggs.slice(0, 6)); // ensure exactly 6
                    } else {
                        setSuggestions(["How do I reduce my execution risk?", "What's a realistic funding ask given my metrics?", "Help me write a 30-second elevator pitch", "What's my biggest threat from global incumbents?", "What regulatory steps should I take in the next 90 days?"]);
                    }
                }).catch(e => {
                    setSuggestions(["How do I reduce my execution risk?", "What's a realistic funding ask given my metrics?", "Help me write a 30-second elevator pitch"]);
                });
            }

            setLoadingChat(false);
        };

        initChat();
    }, [actualId, analysis, state.user?.name]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    if (!analysis) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <h2 className="text-2xl font-bold text-accent-danger mb-4">No Analysis Data Available</h2>
                <p className="text-text-muted mb-6">Run an analysis first to unlock FounderSight Expert Chat.</p>
                <button className="btn-primary" onClick={() => navigate('/intake')}>Run Analysis</button>
            </div>
        );
    }

    const riskScores = analysis.riskScores || {};
    const radarData = [
        { subject: 'Market', val: riskScores.marketRisk || 50 },
        { subject: 'Execution', val: riskScores.executionRisk || 50 },
        { subject: 'Financial', val: riskScores.financialRisk || 50 },
        { subject: 'Competition', val: riskScores.competitionRisk || 50 },
        { subject: 'Regulatory', val: riskScores.regulatoryRisk || 50 },
    ];

    const saveHistoryToFirestore = async (updatedMessages: any[]) => {
        const chatId = `chat_${actualId}`;
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, { history: updatedMessages });
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || isTyping || !chatSessionRef.current) return;

        const userMsg = { role: 'user' as const, content: text.trim(), timestamp: new Date() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        try {
            // Append an empty model message placeholder
            setMessages(prev => [...prev, { role: 'model', content: '', timestamp: new Date() }]);

            const result = await chatSessionRef.current.sendMessageStream(text);
            let fullText = '';

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullText += chunkText;
                setMessages(prev => {
                    const arr = [...prev];
                    arr[arr.length - 1].content = fullText;
                    return arr;
                });
            }

            // Save to Firestore after streaming is complete
            setMessages(prev => {
                const finalArr = [...prev];
                saveHistoryToFirestore(finalArr);
                return finalArr;
            });

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => {
                const arr = [...prev];
                arr[arr.length - 1].content = "⚠️ Connection to expert intelligence failed. Please try again.";
                return arr;
            });
        } finally {
            setIsTyping(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const quickActions = [
        { label: "Critique my Pitch", prompt: "Act like a harsh VC and critique my current startup positioning based on the exec summary." },
        { label: "Give me Next Steps", prompt: "What are the exact 3 things I must do this week to lower my execution risk?" },
        { label: "Draft Cold Email", prompt: "Draft a 4-sentence cold email to a top-tier VC trying to get a meeting based on my strengths." }
    ];

    return (
        <div className="flex h-[calc(100vh-5rem)] bg-background-primary overflow-hidden -m-4 sm:-m-8">

            {/* LEFT SIDEBAR: CONTEXT */}
            <aside className="w-72 hidden xl:flex flex-col border-r border-border-cyan/30 bg-background-card/50 p-6 overflow-y-auto custom-scrollbar">
                <button onClick={() => navigate(`/results/${analysis.id}`)} className="flex items-center gap-2 text-text-muted hover:text-white transition-colors text-sm mb-6 w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <h2 className="text-lg font-display font-bold text-white mb-1 leading-tight">{analysis.name}</h2>
                <p className="text-text-muted text-xs mb-6 font-mono border-b border-border-cyan/30 pb-4">Analyzed: {analysis.createdAt?.toDate ? analysis.createdAt.toDate().toLocaleDateString() : 'Just now'}</p>

                <div className="h-40 w-full mb-6 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="rgba(0,212,255,0.15)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                            <Radar name="Risk" dataKey="val" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-center text-sm p-3 glass-card rounded-lg">
                        <span className="text-text-muted">Overall Risk</span>
                        <span className={`font-bold ${analysis.overallRisk > 60 ? 'text-accent-danger' : analysis.overallRisk > 30 ? 'text-accent-warning' : 'text-accent-success'}`}>{analysis.overallRisk || 0}/100</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-3 glass-card rounded-lg border-l-2 border-l-accent-warning">
                        <span className="text-text-muted">Runway</span>
                        <span className="font-bold text-accent-warning">{analysis.runwayMonths} mo</span>
                    </div>
                </div>
            </aside>

            {/* CENTER: CHAT AREA */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-border-cyan/30 bg-background-elevated/40 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white shadow-glow">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                            <h1 className="font-bold text-text-primary leading-tight flex items-center gap-2">FounderSight Expert {loadingChat && <span className="w-2 h-2 rounded-full bg-accent-warning animate-pulse" />}</h1>
                            <p className="text-[10px] text-accent-primary flex items-center gap-1 font-mono uppercase tracking-wider"><ShieldAlert className="w-3 h-3" />AI Chat Assisstant </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={async () => {
                                const inputs = analysis.inputs || analysis;
                                const firstMsg = {
                                    role: 'model' as const,
                                    content: `Hello ${state.user?.name?.split(' ')[0] || 'Founder'}! I've analyzed ${analysis.name || inputs.name}. Based on your execution risk and ${inputs.runwayMonths} month runway, how can I help you strategize today?`,
                                    timestamp: new Date()
                                };
                                setMessages([firstMsg]);

                                const newHistory = [
                                    { role: 'user', parts: [{ text: `Hello Expert! I am the founder of ${analysis.name || inputs.name}. Please review my dashboard metrics and help me strategize.` }] },
                                    { role: 'model', parts: [{ text: firstMsg.content }] }
                                ];

                                chatSessionRef.current = createChatSession(
                                    `Startup Name: ${analysis.name || inputs.name}. Industry: ${inputs.industry}. Country: ${inputs.country} You are FounderSight Expert, giving brutal VC advice.`,
                                    newHistory
                                );
                                await saveHistoryToFirestore([firstMsg]);
                            }}
                            className="text-text-muted hover:text-accent-danger transition-colors text-sm flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent-danger/10"
                        >
                            <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Clear Chat</span>
                        </button>
                    </div>
                </header>

                {/* Scrollable Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth relative z-10">
                    <AnimatePresence>
                        {messages.length === 1 && !loadingChat && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="flex flex-col items-center justify-center mt-12 mb-16"
                            >
                                <div className="w-16 h-16 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                    <Activity className="w-8 h-8 text-accent-primary" />
                                </div>
                                <h3 className="text-2xl font-display font-bold text-white mb-2">Initialize Strategy Session</h3>
                                <p className="text-text-muted text-center max-w-md mb-8">
                                    Select a strategic vector below or input a custom prompt to begin the venture intelligence simulation.
                                </p>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {quickActions.map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(action.prompt)}
                                            className="px-5 py-2.5 rounded-full bg-background-elevated/50 border border-border-cyan/30 hover:border-accent-primary text-xs font-mono text-text-primary hover:bg-accent-primary/10 hover:text-white transition-all flex items-center gap-2 group shadow-sm"
                                        >
                                            <Zap className="w-3.5 h-3.5 text-accent-warning group-hover:text-white" /> {action.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        <div className="space-y-8 pb-10">
                            {messages.map((msg, idx) => (
                                <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'model' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shrink-0 mr-3 mt-1 shadow-glow ring-2 ring-background-primary">
                                            <MessageSquare className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-5 shadow-xl group relative ${msg.role === 'user' ? 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white rounded-tr-sm' : 'glass-card border-border-cyan/30 text-text-primary rounded-tl-sm bg-background-elevated/40'}`}>
                                        
                                        {msg.role === 'model' && (
                                            <button onClick={() => copyToClipboard(msg.content)} className="absolute top-4 right-4 text-text-muted hover:text-accent-primary opacity-0 group-hover:opacity-100 transition-all rounded p-1 hover:bg-background-elevated">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        )}

                                        <div className="whitespace-pre-wrap text-[15px] leading-relaxed font-sans markdown-content">
                                            {msg.content}
                                            {msg.role === 'model' && isTyping && idx === messages.length - 1 && (
                                                <motion.span 
                                                    animate={{ opacity: [0, 1, 0] }}
                                                    transition={{ repeat: Infinity, duration: 1 }}
                                                    className="inline-block w-2.5 h-4 ml-1 bg-accent-primary align-middle" 
                                                />
                                            )}
                                        </div>

                                        <div className={`flex items-center gap-4 mt-3 pt-3 text-[11px] font-mono tracking-wider ${msg.role === 'user' ? 'border-t border-white/20 text-white/70' : 'border-t border-border-cyan/10 text-text-muted'}`}>
                                            <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {msg.role === 'model' && msg.content && !isTyping && idx > 0 && (
                                                <div className="flex items-center gap-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="hover:text-accent-success transition-colors"><ThumbsUp className="w-3.5 h-3.5" /></button>
                                                    <button className="hover:text-accent-danger transition-colors"><ThumbsDown className="w-3.5 h-3.5" /></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-background-elevated border border-border-cyan/30 flex items-center justify-center shrink-0 ml-3 mt-1">
                                            <span className="text-xs font-bold text-text-muted">{state.user?.name?.charAt(0) || 'U'}</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-gradient-to-t from-background-primary via-background-primary to-transparent shrink-0 relative z-20">
                    <div className="max-w-4xl mx-auto relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative bg-background-elevated/80 backdrop-blur-xl rounded-2xl border border-border-cyan/30 flex flex-col focus-within:border-accent-primary/50 transition-colors shadow-2xl">
                            <textarea
                                className="w-full bg-transparent text-white px-5 py-4 resize-none h-[60px] max-h-[150px] overflow-y-auto custom-scrollbar focus:outline-none text-[15px] placeholder:text-text-muted/50"
                                placeholder={loadingChat ? "Initializing secure AI connection..." : "Ask anything about your venture strategy..."}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loadingChat}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage(input);
                                    }
                                }}
                            />
                            <div className="flex items-center justify-between px-3 pb-3 pt-1">
                                <span className="text-[10px] text-text-muted font-mono tracking-widest uppercase ml-2 flex items-center gap-2">
                                    <ShieldAlert className="w-3 h-3 text-accent-success" /> Secure Sandbox Let's Go
                                </span>
                                <button
                                    onClick={() => sendMessage(input)}
                                    disabled={isTyping || !input.trim() || loadingChat}
                                    className="px-4 py-1.5 rounded-lg bg-accent-primary text-background-primary font-bold text-sm hover:bg-accent-secondary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                >
                                    Send
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* RIGHT SIDEBAR: SUGGESTIONS */}
            <aside className="w-72 hidden 2xl:flex flex-col border-l border-border-cyan/30 bg-background-primary p-6 overflow-y-auto custom-scrollbar">
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 text-accent-primary ${suggestions.length === 0 ? 'animate-spin' : ''}`} /> AI Topics
                </h3>
                <div className="space-y-3">
                    {suggestions.length === 0 && (
                        <div className="space-y-3 opacity-50">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-background-elevated rounded-lg animate-pulse" />)}
                        </div>
                    )}
                    {suggestions.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => sendMessage(q)}
                            disabled={isTyping || loadingChat}
                            className="w-full text-left p-3 rounded-lg border border-border-cyan/20 bg-background-elevated/30 hover:bg-background-elevated hover:border-accent-primary/50 text-text-primary text-sm leading-snug transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="line-clamp-3 group-hover:text-accent-primary transition-colors">{q}</span>
                        </button>
                    ))}
                </div>
            </aside>

        </div>
    );
}
