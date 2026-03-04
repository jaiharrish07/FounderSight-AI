import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import IntakeForm from './pages/IntakeForm';
import ResultsDashboard from './pages/ResultsDashboard';
import ExpertChat from './pages/ExpertChat';
import Settings from './pages/Settings';
import MyReports from './pages/MyReports';

const ProtectedRoute = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen bg-background-primary flex items-center justify-center font-medium text-text-muted animate-pulse">Authenticating workspace...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/auth" replace />;
    }
    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    );
};

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="/auth" element={<AuthPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="h-full">
                            <DashboardHome />
                        </motion.div>
                    } />
                    <Route path="/intake" element={
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="h-full">
                            <IntakeForm />
                        </motion.div>
                    } />
                    <Route path="/reports" element={
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="h-full">
                            <MyReports />
                        </motion.div>
                    } />
                    <Route path="/results/:id" element={
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="h-full">
                            <ResultsDashboard />
                        </motion.div>
                    } />
                    <Route path="/chat" element={
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="h-full">
                            <ExpertChat />
                        </motion.div>
                    } />
                    <Route path="/chat/:id" element={
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="h-full">
                            <ExpertChat />
                        </motion.div>
                    } />
                    <Route path="/settings" element={
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="h-full">
                            <Settings />
                        </motion.div>
                    } />
                </Route>

                <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
        </AnimatePresence>
    );
};

function App() {
    return (
        <AuthProvider>
            <AppProvider>
                <BrowserRouter>
                    <AnimatedRoutes />
                </BrowserRouter>
            </AppProvider>
        </AuthProvider>
    );
}

export default App;
