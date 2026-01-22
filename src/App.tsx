import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import CMSPage from './pages/CMSPage';
import HotelProfilePage from './pages/HotelProfilePage';
import HotelDirectoryPage from './pages/HotelDirectoryPage';
import HotelEditorPage from './pages/HotelEditorPage';
import LoginPage from './pages/LoginPage';
import ChatBot from './components/ChatBot';
import { HotelProvider } from './context/HotelContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import UserManagement from './pages/UserManagement';

// Protected Route Component
// Fix: Use React.ReactElement instead of JSX.Element to avoid namespace issues
const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

const AppContent: React.FC = () => {
    const location = useLocation();
    // Hide sidebar on Login page
    const isLoginPage = location.pathname === '/login';

    return (
        <div className="flex h-screen w-full text-[#111118] dark:text-white bg-background-light dark:bg-background-dark">
            {!isLoginPage && <Sidebar />}

            <main className={`flex-1 h-full overflow-hidden ${!isLoginPage ? 'bg-background-light dark:bg-background-dark' : ''}`}>
                <div className="h-full overflow-y-auto scroll-smooth">
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/" element={<HomePage />} />
                        <Route path="/hotels" element={<HotelDirectoryPage />} />
                        <Route path="/news" element={<NewsPage />} />
                        <Route path="/hotel-profile/:id" element={<HotelProfilePage />} />

                        {/* Protected CMS Routes */}
                        <Route path="/cms" element={
                            <RequireAuth>
                                <CMSPage />
                            </RequireAuth>
                        } />
                        <Route path="/cms/add-hotel" element={
                            <RequireAuth>
                                <HotelEditorPage />
                            </RequireAuth>
                        } />
                        <Route path="/cms/edit-hotel/:id" element={
                            <RequireAuth>
                                <HotelEditorPage />
                            </RequireAuth>
                        } />
                        {/* Admin Route */}
                        <Route path="/admin/users" element={
                            <RequireAuth>
                                <UserManagement />
                            </RequireAuth>
                        } />
                    </Routes>
                </div>
            </main>

            {!isLoginPage && <ChatBot />}
        </div>
    );
}

const App: React.FC = () => {
    return (
        <AuthProvider>
            <HotelProvider>
                <AppContent />
            </HotelProvider>
        </AuthProvider>
    );
};

export default App;