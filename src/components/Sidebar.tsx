import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout, role } = useAuth();
    const activePage = location.pathname;

    const isActive = (path: string) => {
        if (path === '/' && activePage === '/') return true;
        if (path !== '/' && activePage.startsWith(path)) return true;
        return false;
    };

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 h-full bg-white dark:bg-[#1a1a2e] flex flex-col border-r border-gray-200 dark:border-gray-800 flex-shrink-0 z-20 hidden md:flex">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-gray-100" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDw-TaZDxRxnVY9DCzSgZ4SoMKlnwKR01_jnUMqSCc3t2T7ajt4B-kcQN5xwpjeSdkSTCXckjLkt1jLU2eXGI8Y7Eni5fsuoFQ-Jr-8gal-zf-LHMIH66kLZP9ZEoo6QY56sSiQ2FnvOzA2zV3omqZYxT5THqOfrs4HOoU23XlJW__KsHsCuu5sPbJ32Mcy0YFbXTLDSZ-oYauKy9V2Eym4TZvKo3lG7wlPLbYBcgx4y3I_n9-mQWszAaYLvForH0lm4OjrjbWx4sb4")' }}></div>
                <div className="flex flex-col">
                    <h1 className="text-[#111118] dark:text-white text-base font-bold leading-normal">DGD Hoteles</h1>
                    <p className="text-[#616189] text-xs font-normal leading-normal">Panel de Consulta</p>
                </div>
            </div>
            <div className="flex flex-col gap-2 px-4 flex-1 overflow-y-auto custom-scrollbar pb-4">
                <Link to="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive('/') ? 'bg-primary/10 text-primary' : 'text-[#616189] hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                    <span className={`material-symbols-outlined ${isActive('/') ? 'fill text-primary' : 'text-[#616189] group-hover:text-primary'}`}>dashboard</span>
                    <p className={`text-sm font-medium leading-normal ${isActive('/') ? '' : 'group-hover:text-primary'}`}>Inicio</p>
                </Link>
                <Link to="/hotels" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive('/hotels') || isActive('/hotel-profile') ? 'bg-primary/10 text-primary' : 'text-[#616189] hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                    <span className={`material-symbols-outlined ${isActive('/hotels') || isActive('/hotel-profile') ? 'fill text-primary' : 'text-[#616189] group-hover:text-primary'}`}>domain</span>
                    <p className={`text-sm font-medium leading-normal ${isActive('/hotels') || isActive('/hotel-profile') ? '' : 'group-hover:text-primary'}`}>Hoteles</p>
                </Link>
                <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#616189] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <span className="material-symbols-outlined text-[#616189] group-hover:text-primary">newspaper</span>
                    <p className="text-sm font-medium leading-normal group-hover:text-primary">Noticias</p>
                </Link>

                <div className="mt-auto"></div>

                {isAuthenticated ? (
                    <>
                        {/* Admin Only Link for User Management */}
                        {role === 'admin' && (
                            <Link to="/admin/users" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive('/admin/users') ? 'bg-primary/10 text-primary' : 'text-[#616189] hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                                <span className={`material-symbols-outlined ${isActive('/admin/users') ? 'fill text-primary' : 'text-[#616189] group-hover:text-primary'}`}>group</span>
                                <p className={`text-sm font-medium leading-normal ${isActive('/admin/users') ? '' : 'group-hover:text-primary'}`}>Usuarios</p>
                            </Link>
                        )}

                        <Link to="/cms" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive('/cms') ? 'bg-primary/10 text-primary' : 'text-[#616189] hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                            <span className="material-symbols-outlined text-primary fill">admin_panel_settings</span>
                            <p className="text-sm font-bold leading-normal text-primary">Panel CMS</p>
                        </Link>
                        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group mb-2 w-full text-left">
                            <span className="material-symbols-outlined">logout</span>
                            <p className="text-sm font-medium leading-normal">Cerrar Sesión</p>
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#616189] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group mb-2">
                        <span className="material-symbols-outlined text-[#616189] group-hover:text-primary">lock</span>
                        <p className="text-sm font-medium leading-normal group-hover:text-primary">Acceso</p>
                    </Link>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;