import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, pass: string) => boolean;
    logout: () => void;
    user: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Check localStorage for persisted session
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return localStorage.getItem('dgd_auth') === 'true';
    });
    const [user, setUser] = useState<string | null>(localStorage.getItem('dgd_user'));

    const login = (email: string, pass: string) => {
        // Mock validation - In a real app this would hit an API
        if (email === 'admin@dgd.com' && pass === 'admin123') {
            setIsAuthenticated(true);
            setUser('Administrador');
            localStorage.setItem('dgd_auth', 'true');
            localStorage.setItem('dgd_user', 'Administrador');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('dgd_auth');
        localStorage.removeItem('dgd_user');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};