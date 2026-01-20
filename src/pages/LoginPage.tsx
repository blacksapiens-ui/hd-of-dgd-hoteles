import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, signUp } = useAuth();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Get the page the user was trying to access, or default to CMS
    const from = (location.state as any)?.from?.pathname || '/cms';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const { error: authError } = await login(email, password);
                if (authError) throw authError;
            } else {
                const { error: authError } = await signUp(email, password, fullName);
                if (authError) throw authError;
            }
            // Navigate on success
            navigate(from, { replace: true });
        } catch (err: any) {
            setError('Error: ' + (err.message || 'Ocurrió un error inesperado'));
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFullName('');
        setPassword('');
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#101022]">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#101022]/90 via-[#1313ec]/40 to-[#101022]/90 z-10"></div>
                <div className="w-full h-full bg-cover bg-center animate-in fade-in zoom-in duration-[20s]" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAhBe1oST7IgUjUW-KMmmvqKa2zNQulkdTX6meW_cVdwyMpuuhy3TTqnDc47mBcaoTUNY7zkUsWP65yzgPjBao6thtNIrp4YUtsBJ6uyhdacOdE0A3PGuO6yJVQzlBLjoEKpcJh7DGbnlLjw7F05TcrAB1llmCNUwOimQjJkkJGbIkBdGxgQuojdMtfbBi9BlfXkMu8MJsqs_DSEKXYT7QRcukwiEOkNPaIBvd5K3vRbEid2mCYDI5sX1SyXYlYdBAZbn-5MEU89IRG")' }}></div>
            </div>

            {/* Login Card */}
            <div className="relative z-20 w-full max-w-md p-4 animate-in slide-in-from-bottom-8 fade-in duration-700">
                <div className="bg-white/10 dark:bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-8 md:p-10 flex flex-col gap-6">

                        <div className="text-center flex flex-col items-center">
                            <div className="size-16 rounded-full bg-white p-1 mb-4 shadow-lg shadow-primary/20">
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDw-TaZDxRxnVY9DCzSgZ4SoMKlnwKR01_jnUMqSCc3t2T7ajt4B-kcQN5xwpjeSdkSTCXckjLkt1jLU2eXGI8Y7Eni5fsuoFQ-Jr-8gal-zf-LHMIH66kLZP9ZEoo6QY56sSiQ2FnvOzA2zV3omqZYxT5THqOfrs4HOoU23XlJW__KsHsCuu5sPbJ32Mcy0YFbXTLDSZ-oYauKy9V2Eym4TZvKo3lG7wlPLbYBcgx4y3I_n9-mQWszAaYLvForH0lm4OjrjbWx4sb4"
                                    alt="DGD Logo"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">
                                {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
                            </h2>
                            <p className="text-gray-300 text-sm mt-1">
                                {isLogin ? 'Acceso al Portal de Administración' : 'Únete a DGD Hoteles'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {!isLogin && (
                                <div className="space-y-1 animate-in slide-in-from-top-4 fade-in">
                                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1">Nombre Completo</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-lg">person</span>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                            placeholder="Tu nombre"
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1">Email Corporativo</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-lg">mail</span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        placeholder="admin@dgd.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1">Contraseña</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-lg">lock</span>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-2 w-full bg-primary hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        {isLogin ? 'Ingresar al Sistema' : 'Registrarse'} <span className="material-symbols-outlined">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="text-center flex flex-col gap-2">
                            {isLogin && <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">¿Olvidaste tu contraseña?</a>}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="text-sm text-primary hover:text-blue-400 font-semibold transition-colors mt-2"
                            >
                                {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia Sesión'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-black/20 p-4 text-center border-t border-white/5">
                        <p className="text-[10px] text-gray-500">© 2024 DGD Hoteles. Acceso restringido.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;