import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppContext } from '../../store/AppContext';
import {
    Home,
    PlusCircle,
    FolderOpen,
    MessageSquare,
    Settings,
    Bell,
    LogOut,
    BrainCircuit,
    Menu,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const { state, logout, toggleSidebar } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

    // For mobile overlay tracking (if window < 1024px)
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        handleResize(); // Init
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const navItems = [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/intake', label: 'New Analysis', icon: PlusCircle },
        { path: '/reports', label: 'My Reports', icon: FolderOpen },
        { path: '/chat', label: 'Expert Chat', icon: MessageSquare },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    const isCollapsed = !isMobile && state.uiState.sidebarCollapsed;

    return (
        <div className="h-screen flex text-text-primary overflow-hidden">
            {/* Sidebar Navigation */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 border-r border-border-cyan transition-all duration-300 flex flex-col
                    ${isMobile ? (state.uiState.sidebarCollapsed ? '-translate-x-full' : 'translate-x-0') : 'static translate-x-0'}
                    ${isCollapsed ? 'w-20' : 'w-64'}
                `}
                style={{
                    background: state.uiState.currentTheme === 'light'
                        ? 'linear-gradient(180deg, rgba(248,250,252,0.97) 0%, rgba(241,245,249,0.98) 50%, rgba(248,250,252,0.97) 100%)'
                        : 'linear-gradient(180deg, rgba(10,16,30,0.95) 0%, rgba(6,10,19,0.97) 50%, rgba(8,14,24,0.95) 100%)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                <div className={`flex items-center p-6 border-b border-border-cyan/30 ${isCollapsed ? 'justify-center px-4' : 'gap-3'}`}>
                    <BrainCircuit className="text-accent-primary w-8 h-8 flex-shrink-0" />
                    {!isCollapsed && <h1 className="text-xl font-display font-bold whitespace-nowrap overflow-hidden text-ellipsis">FOUNDERSIGHT</h1>}
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path) && (item.path !== '/dashboard' || location.pathname === '/dashboard');
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.label}
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) toggleSidebar();
                                }}
                                title={isCollapsed ? item.label : undefined}
                                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shadow-[0_0_15px_rgba(0,212,255,0.1)]'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-background-elevated'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-accent-primary' : 'opacity-70'}`} />
                                {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-auto p-4 border-t border-border-cyan/30 space-y-2">
                    {!isMobile && (
                        <button
                            onClick={toggleSidebar}
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4 text-left'} py-3 rounded-lg text-text-muted hover:text-white hover:bg-background-elevated transition-colors duration-200`}
                            title="Toggle Sidebar"
                        >
                            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-5 h-5" /> <span className="font-medium">Collapse</span></>}
                        </button>
                    )}

                    <button
                        onClick={handleLogout}
                        title={isCollapsed ? "Logout" : undefined}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4 text-left'} py-3 rounded-lg text-text-muted hover:text-accent-danger hover:bg-accent-danger/10 transition-colors duration-200`}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium whitespace-nowrap">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300">
                {/* Top Header */}
                <header className="h-20 flex-shrink-0 px-6 flex items-center justify-between sticky top-0 z-40 relative" style={{
                    background: state.uiState.currentTheme === 'light'
                        ? 'rgba(248,250,252,0.8)'
                        : 'rgba(6,10,19,0.7)',
                    backdropFilter: 'blur(16px)',
                }}>
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 text-text-secondary hover:text-accent-primary transition-colors"
                            onClick={toggleSidebar}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-display font-semibold hidden sm:block">
                            {navItems.find(item => location.pathname.startsWith(item.path))?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative text-text-secondary hover:text-accent-primary transition-all duration-300 hover:scale-110">
                            <Bell className="w-6 h-6" />
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background-primary" style={{ background: 'linear-gradient(135deg, #EF4444, #F59E0B)' }}></span>
                        </button>

                        <div className="flex items-center gap-3 pl-6 border-l border-border-cyan/30">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-text-primary leading-none">{state.user?.name || 'Founder'}</p>
                                <p className="text-xs text-text-muted mt-1">{state.user?.role} • {state.user?.country}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold shadow-glow border-2 border-background-primary flex-shrink-0 transition-transform duration-300 hover:scale-105">
                                {state.user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                    {/* Gradient accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-secondary), transparent)', opacity: 0.3 }} />
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                    {children || <Outlet />}
                </main>
            </div>

            {/* Mobile overlay */}
            {isMobile && !state.uiState.sidebarCollapsed && (
                <div
                    className="fixed inset-0 bg-background-primary/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
