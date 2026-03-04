import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
    name: string;
    email: string;
    country: string;
    role: string;
}

export interface NotificationPrefs {
    emailReports: boolean;
    riskAlerts: boolean;
    weeklyDigest: boolean;
    productUpdates: boolean;
}

interface AppState {
    user: User | null;
    currentAnalysis: any;
    uiState: {
        sidebarCollapsed: boolean;
        currentTheme: 'dark' | 'light' | 'system';
        accentColor: string;
    };
    notificationPrefs: NotificationPrefs;
}

interface AppContextType {
    state: AppState;
    login: (user: User) => void;
    logout: () => void;
    setCurrentAnalysis: (analysis: any) => void;
    toggleSidebar: () => void;
    setTheme: (theme: 'dark' | 'light' | 'system') => void;
    setAccentColor: (color: string) => void;
    setNotificationPrefs: (prefs: NotificationPrefs) => void;
}

const defaultNotificationPrefs: NotificationPrefs = {
    emailReports: true,
    riskAlerts: false,
    weeklyDigest: false,
    productUpdates: true,
};

const defaultState: AppState = {
    user: null,
    currentAnalysis: null,
    uiState: { sidebarCollapsed: false, currentTheme: 'dark', accentColor: '#00D4FF' },
    notificationPrefs: defaultNotificationPrefs,
};

const ACCENT_COLOR_MAP: Record<string, { primary: string; glow: string; border: string }> = {
    '#00D4FF': { primary: '#00D4FF', glow: '0 0 20px rgba(0, 212, 255, 0.3)', border: 'rgba(0, 212, 255, 0.15)' },
    '#7C3AED': { primary: '#7C3AED', glow: '0 0 20px rgba(124, 58, 237, 0.3)', border: 'rgba(124, 58, 237, 0.15)' },
    '#10B981': { primary: '#10B981', glow: '0 0 20px rgba(16, 185, 129, 0.3)', border: 'rgba(16, 185, 129, 0.15)' },
    '#F59E0B': { primary: '#F59E0B', glow: '0 0 20px rgba(245, 158, 11, 0.3)', border: 'rgba(245, 158, 11, 0.15)' },
    '#EF4444': { primary: '#EF4444', glow: '0 0 20px rgba(239, 68, 68, 0.3)', border: 'rgba(239, 68, 68, 0.15)' },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppState>(() => {
        const storedUser = localStorage.getItem('foundersight_user');
        const storedUi = localStorage.getItem('foundersight_ui');
        const storedNotifs = localStorage.getItem('foundersight_notifs');
        return {
            ...defaultState,
            user: storedUser ? JSON.parse(storedUser) : null,
            uiState: storedUi ? { ...defaultState.uiState, ...JSON.parse(storedUi) } : defaultState.uiState,
            notificationPrefs: storedNotifs ? JSON.parse(storedNotifs) : defaultNotificationPrefs,
        };
    });

    // Persist user
    useEffect(() => {
        if (state.user) {
            localStorage.setItem('foundersight_user', JSON.stringify(state.user));
        } else {
            localStorage.removeItem('foundersight_user');
        }
    }, [state.user]);

    // Persist UI state
    useEffect(() => {
        localStorage.setItem('foundersight_ui', JSON.stringify(state.uiState));
    }, [state.uiState]);

    // Persist notification prefs
    useEffect(() => {
        localStorage.setItem('foundersight_notifs', JSON.stringify(state.notificationPrefs));
    }, [state.notificationPrefs]);

    // Apply accent color CSS variables to document root
    useEffect(() => {
        const colorConfig = ACCENT_COLOR_MAP[state.uiState.accentColor];
        if (colorConfig) {
            document.documentElement.style.setProperty('--accent-primary', colorConfig.primary);
            document.documentElement.style.setProperty('--glow', colorConfig.glow);
            document.documentElement.style.setProperty('--border', colorConfig.border);
        }
    }, [state.uiState.accentColor]);

    // Apply theme to document root
    useEffect(() => {
        const applyTheme = (theme: 'dark' | 'light') => {
            document.documentElement.setAttribute('data-theme', theme);
        };

        if (state.uiState.currentTheme === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            applyTheme(mq.matches ? 'dark' : 'light');
            const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light');
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        } else {
            applyTheme(state.uiState.currentTheme);
        }
    }, [state.uiState.currentTheme]);

    const login = (user: User) => setState((prev) => ({ ...prev, user }));
    const logout = () => setState((prev) => ({ ...prev, user: null, currentAnalysis: null }));
    const setCurrentAnalysis = (currentAnalysis: any) => setState((prev) => ({ ...prev, currentAnalysis }));

    const toggleSidebar = () => setState((prev) => ({
        ...prev,
        uiState: { ...prev.uiState, sidebarCollapsed: !prev.uiState.sidebarCollapsed }
    }));

    const setTheme = (theme: 'dark' | 'light' | 'system') => setState((prev) => ({
        ...prev,
        uiState: { ...prev.uiState, currentTheme: theme }
    }));

    const setAccentColor = (color: string) => setState((prev) => ({
        ...prev,
        uiState: { ...prev.uiState, accentColor: color }
    }));

    const setNotificationPrefs = (notificationPrefs: NotificationPrefs) => setState((prev) => ({
        ...prev,
        notificationPrefs,
    }));

    return (
        <AppContext.Provider value={{
            state, login, logout, setCurrentAnalysis, toggleSidebar, setTheme, setAccentColor, setNotificationPrefs
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within AppProvider');
    return context;
};
