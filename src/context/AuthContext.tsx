import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';

interface Profile {
    id: string;
    email: string;
    role: string;
    is_active: boolean;
    full_name?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, pass: string) => Promise<{ data: any; error: any }>;
    signUp: (email: string, pass: string, fullName?: string) => Promise<{ data: any; error: any }>;
    logout: () => Promise<void>;
    user: any | null;
    role: string | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setRole(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            } else if (data) {
                setRole(data.role);
                // If user is not active, force logout?
                if (data.is_active === false) {
                    await supabase.auth.signOut();
                    setRole(null);
                    setUser(null);
                    setSession(null);
                    alert('Tu cuenta está desactivada. Contacta al administrador.');
                }
            }
        } catch (error) {
            console.error('Error in fetchProfile:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, pass: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pass,
        });

        if (data.user && !error) {
            // Update last_login
            await supabase
                .from('profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', data.user.id);
        }

        return { data, error };
    };

    const signUp = async (email: string, pass: string, fullName: string = '') => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
        });

        if (!error && data.user) {
            // Create profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        email: email,
                        full_name: fullName,
                        role: 'user', // Default role
                        is_active: true
                    }
                ]);

            if (profileError) {
                console.error('Error creating profile:', profileError);
                // Optional: Consider if we should return this error or just log it
            }
        }

        return { data, error };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setRole(null);
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!session, login, signUp, logout, user, role, loading }}>
            {!loading && children}
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