import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Settings2, User, Globe, Bell, Palette, Database, Trash2, CheckCircle2, ShieldAlert, Sun, Moon, Monitor, Mail, AlertTriangle as AlertIcon, Info, BarChart3, Sparkles, Check, Shield } from 'lucide-react';
import { auth, db } from '../utils/firebase';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

type TabId = 'profile' | 'localization' | 'appearance' | 'notifications' | 'data';

const ACCENT_COLORS = [
    { color: '#00D4FF', label: 'Cyan', gradient: 'from-cyan-400 to-blue-500' },
    { color: '#7C3AED', label: 'Purple', gradient: 'from-purple-500 to-indigo-600' },
    { color: '#10B981', label: 'Emerald', gradient: 'from-emerald-400 to-teal-600' },
    { color: '#F59E0B', label: 'Gold', gradient: 'from-amber-400 to-orange-500' },
    { color: '#EF4444', label: 'Rose', gradient: 'from-rose-400 to-red-600' },
];

const THEMES = [
    { id: 'dark' as const, label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
    { id: 'light' as const, label: 'Light', icon: Sun, desc: 'Clean & bright' },
    { id: 'system' as const, label: 'System', icon: Monitor, desc: 'Match your OS' },
];

export default function Settings() {
    const { state, login, setTheme, setAccentColor, setNotificationPrefs } = useAppContext();
    const [activeTab, setActiveTab] = useState<TabId>('profile');
    const [analysisCount, setAnalysisCount] = useState(0);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [formData, setFormData] = useState({
        name: state.user?.name || '',
        email: state.user?.email || '',
        country: state.user?.country || 'USA',
        role: state.user?.role || 'Founder',
    });

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        login(formData);
        showToast('Profile updated successfully.');
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    React.useEffect(() => {
        const fetchCount = async () => {
            if (auth.currentUser) {
                try {
                    const q = query(collection(db, 'analyses'), where('uid', '==', auth.currentUser.uid));
                    const snap = await getDocs(q);
                    setAnalysisCount(snap.size);
                } catch (e) {
                    console.error("Failed to fetch analysis count", e);
                }
            }
        };
        fetchCount();
    }, []);

    const handleClearData = async () => {
        if (!auth.currentUser) return;
        try {
            const q = query(collection(db, 'analyses'), where('uid', '==', auth.currentUser.uid));
            const snap = await getDocs(q);
            const deletePromises = snap.docs.map(docSnap => deleteDoc(docSnap.ref));
            await Promise.all(deletePromises);
            setAnalysisCount(0);
            setShowClearConfirm(false);
            showToast('All saved analyses have been cleared from Firestore.');
        } catch (e) {
            console.error(e);
            showToast('Error wiping data.');
        }
    };

    const tabs = [
        { id: 'profile' as TabId, label: 'Profile', icon: User, color: 'from-blue-500 to-cyan-400' },
        { id: 'localization' as TabId, label: 'Locale', icon: Globe, color: 'from-cyan-400 to-teal-400' },
        { id: 'appearance' as TabId, label: 'Appearance', icon: Palette, color: 'from-purple-500 to-pink-400' },
        { id: 'notifications' as TabId, label: 'Notifications', icon: Bell, color: 'from-amber-400 to-orange-500' },
        { id: 'data' as TabId, label: 'Data & Privacy', icon: Database, color: 'from-red-500 to-rose-400', danger: true },
    ];

    // Premium Toggle Switch
    const PremiumToggle = ({ checked, onChange, label, description, icon: Icon }: {
        checked: boolean; onChange: (v: boolean) => void; label: string; description: string; icon: React.ElementType;
    }) => (
        <div
            className="group relative flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 shimmer-hover cursor-pointer"
            style={{
                background: checked
                    ? 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(124,58,237,0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(26,34,53,0.6) 0%, rgba(13,21,37,0.4) 100%)',
                borderColor: checked ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.06)',
            }}
            onClick={() => onChange(!checked)}
        >
            <div className="flex items-center gap-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                    style={{
                        background: checked
                            ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                            : 'rgba(26,34,53,0.8)',
                        boxShadow: checked ? '0 0 15px rgba(0,212,255,0.2)' : 'none',
                    }}
                >
                    <Icon className={`w-5 h-5 transition-colors duration-300 ${checked ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div>
                    <h4 className="font-semibold text-text-primary text-[15px]">{label}</h4>
                    <p className="text-sm text-text-muted mt-0.5">{description}</p>
                </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
                className={`toggle-premium ${checked ? 'active' : 'inactive'}`}
            >
                <span className="toggle-knob" />
            </button>
        </div>
    );

    // Section header component
    const SectionHeader = ({ icon: Icon, title, gradient }: { icon: React.ElementType; title: string; gradient: string }) => (
        <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-text-primary font-display">{title}</h2>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="relative">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg"
                        style={{ boxShadow: '0 0 25px rgba(0,212,255,0.2)' }}>
                        <Settings2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white">Platform Settings</h1>
                        <p className="text-sm text-text-muted mt-0.5">Customize your FounderSight experience</p>
                    </div>
                </div>
                <div className="gradient-divider mt-6" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left Nav Tabs */}
                <div className="lg:col-span-1 space-y-1.5">
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                                    ? 'text-white font-medium'
                                    : `text-text-muted hover:text-text-secondary ${tab.danger ? 'hover:text-accent-danger' : ''}`
                                    }`}
                                style={isActive ? {
                                    background: 'linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(124,58,237,0.08) 100%)',
                                    border: '1px solid rgba(0,212,255,0.2)',
                                    boxShadow: '0 0 20px rgba(0,212,255,0.08)',
                                } : {
                                    background: 'transparent',
                                    border: '1px solid transparent',
                                }}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full bg-gradient-to-b"
                                        style={{ backgroundImage: `linear-gradient(to bottom, var(--accent-primary), var(--accent-secondary))` }} />
                                )}
                                <tab.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-accent-primary' : 'opacity-50 group-hover:opacity-80'}`} />
                                <span className="text-sm">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Panels */}
                <div className="lg:col-span-3">

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="premium-card p-8" style={{ animation: 'slide-in-right 0.3s ease-out' }}>
                            <SectionHeader icon={User} title="Profile Details" gradient="from-blue-500 to-cyan-400" />
                            <form onSubmit={handleSaveProfile} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-secondary">Full Name</label>
                                        <input type="text" className="input-field" placeholder="Enter your name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-secondary">Email</label>
                                        <input type="email" className="input-field" placeholder="you@company.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-secondary">Primary Role</label>
                                        <select className="input-field" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                            <option value="Founder">Founder</option>
                                            <option value="Investor">Investor</option>
                                            <option value="Advisor">Advisor</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-secondary">HQ Country</label>
                                        <select className="input-field" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })}>
                                            <option value="USA">United States</option>
                                            <option value="India">India</option>
                                            <option value="UK">United Kingdom</option>
                                            <option value="Germany">Germany</option>
                                            <option value="Singapore">Singapore</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="gradient-divider my-6" />
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-text-muted">Changes save immediately to your account</p>
                                    <button type="submit" className="btn-primary py-2.5 px-8 text-sm font-semibold shadow-glow">
                                        Save Profile
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* LOCALIZATION TAB */}
                    {activeTab === 'localization' && (
                        <div className="premium-card p-8" style={{ animation: 'slide-in-right 0.3s ease-out' }}>
                            <SectionHeader icon={Globe} title="Localization & Locale" gradient="from-cyan-400 to-teal-500" />
                            <div className="space-y-4">
                                {[
                                    {
                                        title: 'Currency Override', desc: 'Force a specific currency rendering on all dashboards.',
                                        options: (
                                            <select className="input-field max-w-[160px] text-sm">
                                                <option value="auto">Auto ({formData.country})</option>
                                                <option value="USD">USD ($)</option>
                                                <option value="INR">INR (₹)</option>
                                                <option value="EUR">EUR (€)</option>
                                                <option value="GBP">GBP (£)</option>
                                                <option value="SGD">SGD (S$)</option>
                                            </select>
                                        )
                                    },
                                    {
                                        title: 'Date Format', desc: 'Choose how dates appear across the platform.',
                                        options: (
                                            <select className="input-field max-w-[160px] text-sm">
                                                <option value="mdy">MM/DD/YYYY</option>
                                                <option value="dmy">DD/MM/YYYY</option>
                                                <option value="ymd">YYYY-MM-DD</option>
                                            </select>
                                        )
                                    },
                                    {
                                        title: 'Number Format', desc: 'Select thousands separator style.',
                                        options: (
                                            <select className="input-field max-w-[160px] text-sm">
                                                <option value="intl">1,000,000</option>
                                                <option value="indian">10,00,000</option>
                                                <option value="eu">1.000.000</option>
                                            </select>
                                        )
                                    }
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 shimmer-hover"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(26,34,53,0.6) 0%, rgba(13,21,37,0.4) 100%)',
                                            borderColor: 'rgba(255,255,255,0.06)',
                                        }}
                                    >
                                        <div>
                                            <h4 className="font-semibold text-text-primary text-[15px]">{item.title}</h4>
                                            <p className="text-sm text-text-muted mt-0.5">{item.desc}</p>
                                        </div>
                                        {item.options}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* APPEARANCE TAB */}
                    {activeTab === 'appearance' && (
                        <div className="premium-card p-8" style={{ animation: 'slide-in-right 0.3s ease-out' }}>
                            <SectionHeader icon={Palette} title="Appearance" gradient="from-purple-500 to-pink-500" />

                            {/* Theme Selector */}
                            <div className="mb-8">
                                <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Theme</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    {THEMES.map(theme => {
                                        const isActive = state.uiState.currentTheme === theme.id;
                                        return (
                                            <button
                                                key={theme.id}
                                                onClick={() => setTheme(theme.id)}
                                                className="relative p-5 rounded-2xl text-center transition-all duration-300 group"
                                                style={{
                                                    background: isActive
                                                        ? 'linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(124,58,237,0.08) 100%)'
                                                        : 'linear-gradient(135deg, rgba(26,34,53,0.5) 0%, rgba(13,21,37,0.3) 100%)',
                                                    border: isActive
                                                        ? '2px solid rgba(0,212,255,0.4)'
                                                        : '1px solid rgba(255,255,255,0.06)',
                                                    boxShadow: isActive ? '0 0 25px rgba(0,212,255,0.12)' : 'none',
                                                }}
                                            >
                                                {isActive && (
                                                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                                <div
                                                    className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all duration-300"
                                                    style={{
                                                        background: isActive
                                                            ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                                                            : 'rgba(26,34,53,0.8)',
                                                    }}
                                                >
                                                    <theme.icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}`} />
                                                </div>
                                                <span className={`text-sm font-semibold block ${isActive ? 'text-white' : 'text-text-muted group-hover:text-text-secondary'}`}>{theme.label}</span>
                                                <span className="text-xs text-text-muted mt-1 block">{theme.desc}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                            </div>

                            <div className="gradient-divider my-6" />

                            {/* Accent Color */}
                            <div>
                                <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Accent Color</h4>
                                <div className="flex gap-4">
                                    {ACCENT_COLORS.map(accent => {
                                        const isActive = state.uiState.accentColor === accent.color;
                                        return (
                                            <button
                                                key={accent.color}
                                                onClick={() => setAccentColor(accent.color)}
                                                className="group relative flex flex-col items-center gap-2 transition-all duration-300"
                                            >
                                                <div
                                                    className="w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center"
                                                    style={{
                                                        backgroundColor: accent.color,
                                                        boxShadow: isActive ? `0 0 20px ${accent.color}60, 0 0 40px ${accent.color}20` : `0 0 0px ${accent.color}00`,
                                                        border: isActive ? '3px solid white' : '3px solid transparent',
                                                        transform: isActive ? 'scale(1.15)' : 'scale(1)',
                                                    }}
                                                >
                                                    {isActive && <Check className="w-5 h-5 text-white drop-shadow-lg" />}
                                                </div>
                                                <span className={`text-xs font-medium transition-all duration-300 ${isActive ? 'text-white' : 'text-text-muted group-hover:text-text-secondary'}`}>
                                                    {accent.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <div className="premium-card p-8" style={{ animation: 'slide-in-right 0.3s ease-out' }}>
                            <SectionHeader icon={Bell} title="Notification Preferences" gradient="from-amber-400 to-orange-500" />

                            <div className="space-y-3">
                                <PremiumToggle
                                    checked={state.notificationPrefs.emailReports}
                                    onChange={(v) => setNotificationPrefs({ ...state.notificationPrefs, emailReports: v })}
                                    label="Email Report Summaries"
                                    description="Receive a mail with your full analysis report after each run."
                                    icon={Mail}
                                />
                                <PremiumToggle
                                    checked={state.notificationPrefs.riskAlerts}
                                    onChange={(v) => setNotificationPrefs({ ...state.notificationPrefs, riskAlerts: v })}
                                    label="High-Risk Alerts"
                                    description="Get notified when any analysis returns a HIGH RISK classification."
                                    icon={AlertIcon}
                                />
                                <PremiumToggle
                                    checked={state.notificationPrefs.weeklyDigest}
                                    onChange={(v) => setNotificationPrefs({ ...state.notificationPrefs, weeklyDigest: v })}
                                    label="Weekly Market Digest"
                                    description="Receive a weekly email summarizing AI market trends and insights."
                                    icon={BarChart3}
                                />
                                <PremiumToggle
                                    checked={state.notificationPrefs.productUpdates}
                                    onChange={(v) => setNotificationPrefs({ ...state.notificationPrefs, productUpdates: v })}
                                    label="Product Updates"
                                    description="Stay informed about new features and platform improvements."
                                    icon={Sparkles}
                                />
                            </div>

                            <div className="gradient-divider my-6" />

                            <div className="flex items-center justify-between">
                                <p className="text-xs text-text-muted flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5" /> Preferences auto-save to your browser
                                </p>
                                <button
                                    onClick={() => showToast('Notification preferences saved!')}
                                    className="btn-primary py-2.5 px-8 text-sm font-semibold"
                                >
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    )}

                    {/* DATA & PRIVACY TAB */}
                    {activeTab === 'data' && (
                        <div className="premium-card p-8" style={{ animation: 'slide-in-right 0.3s ease-out' }}>
                            <SectionHeader icon={Database} title="Danger Zone" gradient="from-red-500 to-rose-500" />

                            <div
                                className="flex items-center justify-between p-5 rounded-2xl border transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)',
                                    borderColor: 'rgba(239,68,68,0.15)',
                                }}
                            >
                                <div>
                                    <h4 className="font-semibold text-text-primary text-[15px]">Clear Saved Analyses</h4>
                                    <p className="text-sm text-accent-danger/80 mt-0.5">Permanently delete all {analysisCount} saved intelligence reports.</p>
                                </div>
                                {!showClearConfirm ? (
                                    <button
                                        onClick={() => setShowClearConfirm(true)}
                                        disabled={analysisCount === 0}
                                        className="px-5 py-2.5 text-sm rounded-xl font-semibold transition-all duration-300 disabled:opacity-30"
                                        style={{
                                            background: 'rgba(239,68,68,0.1)',
                                            border: '1px solid rgba(239,68,68,0.3)',
                                            color: '#EF4444',
                                        }}
                                    >
                                        Wipe Data
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowClearConfirm(false)}
                                            className="px-4 py-2.5 text-sm rounded-xl text-text-secondary hover:text-white transition-colors"
                                            style={{ background: 'rgba(26,34,53,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleClearData}
                                            className="px-4 py-2.5 text-sm rounded-xl font-bold text-white transition-all duration-300"
                                            style={{
                                                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                                boxShadow: '0 0 20px rgba(239,68,68,0.4)',
                                            }}
                                        >
                                            CONFIRM WIPEOUT
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs text-text-muted font-mono"
                                style={{ background: 'rgba(26,34,53,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                                API Usage: {analysisCount} analyses stored in Database.
                            </div>

                            <div className="gradient-divider my-6" />

                            <div
                                className="p-5 rounded-2xl border shimmer-hover"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(26,34,53,0.6) 0%, rgba(13,21,37,0.4) 100%)',
                                    borderColor: 'rgba(255,255,255,0.06)',
                                }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <Shield className="w-5 h-5 text-accent-primary" />
                                    <h4 className="font-semibold text-text-primary">Data Handling</h4>
                                </div>
                                <p className="text-sm text-text-muted leading-relaxed">Your data is stored securely in Firebase Firestore. Analysis inputs and results are tied to your authenticated account and are never shared with third parties. AI processing is done via Gemini API with no data retention.</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Toast Notification */}
            {toastMessage && (
                <div
                    className="fixed bottom-8 right-8 p-4 rounded-2xl flex items-center gap-3 z-50"
                    style={{
                        background: 'linear-gradient(135deg, rgba(17,24,39,0.95), rgba(13,21,37,0.95))',
                        border: '1px solid rgba(16,185,129,0.3)',
                        boxShadow: '0 0 30px rgba(16,185,129,0.15), 0 8px 32px rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(20px)',
                        animation: 'fade-in-scale 0.3s ease-out',
                    }}
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-sm text-text-primary">{toastMessage}</span>
                </div>
            )}

        </div>
    );
}
