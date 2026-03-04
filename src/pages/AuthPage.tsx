import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from '../utils/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { SplineScene } from '../components/ui/splite';
import { Spotlight } from '../components/ui/spotlight';
import { BrainCircuit, Globe, Lock, Mail, User as UserIcon } from 'lucide-react';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    // Counters state
    const [startupsAnalyzed, setStartupsAnalyzed] = useState(0);
    const [accuracy, setAccuracy] = useState(0);

    useEffect(() => {
        const animateValue = (setFn: any, start: number, end: number, duration: number) => {
            let startTimestamp: number | null = null;
            const step = (timestamp: number) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 4);
                setFn(Math.floor(ease * (end - start) + start));
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        };
        animateValue(setStartupsAnalyzed, 0, 10000, 2000);
        animateValue(setAccuracy, 0, 94, 2000);
    }, []);

    const createUserDocument = async (user: any, additionalData: any = {}) => {
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
            try {
                await setDoc(userRef, {
                    name: user.displayName || additionalData.name || 'Founder',
                    email: user.email,
                    photoURL: user.photoURL || '',
                    country: additionalData.country || 'India',
                    role: additionalData.role || 'Founder',
                    createdAt: serverTimestamp()
                });
            } catch (error) {
                console.error("Error creating user document", error);
            }
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                navigate('/dashboard');
            } else {
                const name = (document.getElementById('fullname') as HTMLInputElement).value;
                const country = (document.getElementById('country') as HTMLSelectElement).value;

                const { user } = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(user, { displayName: name });
                await createUserDocument(user, { name, country, role: 'Founder' });
                navigate('/dashboard');
            }
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const { user } = await signInWithPopup(auth, googleProvider);
            await createUserDocument(user, { country: 'India', role: 'Founder' });
            navigate('/dashboard');
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background-primary text-text-primary overflow-hidden">
            <div className="hidden lg:flex w-[60%] relative flex-col justify-center items-center px-16 group overflow-hidden bg-background-card">
                <Spotlight className="-top-40 left-0 md:left-40 md:-top-20" fill="var(--accent-primary)" />
                <div className="absolute inset-0 w-full h-full z-0 opacity-80 mix-blend-screen pointer-events-auto cursor-grab active:cursor-grabbing">
                    <SplineScene 
                        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                        className="w-full h-full scale-125 md:scale-150 transform-gpu"
                    />
                </div>
                <div className="absolute inset-0 bg-background-primary/40 z-10 pointer-events-none" />
                <div className="relative z-20 w-full max-w-xl translate-y-8 animate-[fade-in-up_1s_ease-out_forwards] opacity-0 mr-auto" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <BrainCircuit className="text-accent-primary w-12 h-12" />
                        <h1 className="text-5xl font-display font-bold tracking-tight text-white">FOUNDERSIGHT AI</h1>
                    </div>
                    <p className="text-2xl text-text-secondary mb-12 font-light">
                        Venture Intelligence for the Next Generation Founder
                    </p>
                    <div className="grid grid-cols-3 gap-6 mb-16">
                        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                            <span className="text-4xl font-mono gradient-text font-bold mb-2">{startupsAnalyzed.toLocaleString()}+</span>
                            <span className="text-sm text-text-muted uppercase tracking-wider">Startups Analyzed</span>
                        </div>
                        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                            <span className="text-4xl font-mono text-accent-success font-bold mb-2">{accuracy}%</span>
                            <span className="text-sm text-text-muted uppercase tracking-wider">Prediction Accuracy</span>
                        </div>
                        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                            <span className="text-4xl font-mono text-accent-gold font-bold mb-2">$0</span>
                            <span className="text-sm text-text-muted uppercase tracking-wider">Consulting Fees</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        {['FinTech', 'HealthTech', 'EdTech', 'AI/ML', 'SaaS', 'E-Commerce'].map(industry => (
                            <span key={industry} className="px-4 py-2 rounded-full border border-border-cyan/30 bg-background-elevated/50 text-sm font-medium text-accent-primary shadow-[0_0_10px_rgba(0,212,255,0.1)] backdrop-blur-sm">
                                {industry}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-[40%] flex items-center justify-center p-8 lg:bg-background-secondary/50 relative z-20">
                <div className="w-full max-w-md glass-card p-8 shadow-2xl relative overflow-hidden animate-[fade-in-up_1s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                    <div className="flex mb-8 border-b border-border-cyan/30">
                        <button className={`flex-1 pb-4 font-medium transition-colors relative ${isLogin ? 'text-accent-primary' : 'text-text-muted hover:text-text-primary'}`} onClick={() => { setIsLogin(true); setErrorMsg(''); }}>
                            Login
                            {isLogin && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-primary shadow-[0_0_10px_#00D4FF]" />}
                        </button>
                        <button className={`flex-1 pb-4 font-medium transition-colors relative ${!isLogin ? 'text-accent-primary' : 'text-text-muted hover:text-text-primary'}`} onClick={() => { setIsLogin(false); setErrorMsg(''); }}>
                            Sign Up
                            {!isLogin && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-primary shadow-[0_0_10px_#00D4FF]" />}
                        </button>
                    </div>

                    {errorMsg && <div className="mb-4 p-3 rounded bg-accent-danger/20 border border-accent-danger text-accent-danger text-sm">{errorMsg}</div>}

                    <form onSubmit={handleEmailAuth} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-1 relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><UserIcon className="w-5 h-5 text-text-muted" /></div>
                                <input id="fullname" type="text" placeholder="Full Name" className="input-field pl-12" required />
                            </div>
                        )}

                        <div className="space-y-1 relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Mail className="w-5 h-5 text-text-muted" /></div>
                            <input id="email" type="email" placeholder="Email Address" className="input-field pl-12" required />
                        </div>

                        <div className="space-y-1 relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Lock className="w-5 h-5 text-text-muted" /></div>
                            <input id="password" type="password" placeholder="Password" className="input-field pl-12" required minLength={6} />
                        </div>

                        {!isLogin && (
                            <div className="space-y-1 relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Globe className="w-5 h-5 text-text-muted" /></div>
                                <select id="country" className="input-field pl-12 appearance-none bg-background-elevated text-text-primary" required defaultValue="India">
                                    <option value="USA">United States (USD)</option>
                                    <option value="India">India (INR)</option>
                                    <option value="UK">United Kingdom (GBP)</option>
                                    <option value="Germany">Germany (EUR)</option>
                                    <option value="Singapore">Singapore (SGD)</option>
                                </select>
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full mt-6 text-lg font-bold disabled:opacity-50">
                            {loading ? 'Processing...' : (isLogin ? 'Log In to Dashboard' : 'Create Free Account')}
                        </button>

                        <div className="relative flex items-center py-5">
                            <div className="flex-grow border-t border-border-cyan/30"></div>
                            <span className="flex-shrink-0 mx-4 text-text-muted text-sm">Or continue with</span>
                            <div className="flex-grow border-t border-border-cyan/30"></div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button type="button" onClick={handleGoogleAuth} disabled={loading} className="flex items-center justify-center gap-2 border border-border-cyan/30 bg-background-elevated hover:bg-background-elevated/80 rounded-lg py-3 transition-colors text-sm font-medium disabled:opacity-50">
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                Continue with Google
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default AuthPage;
