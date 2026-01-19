import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

interface UserProfile {
    id: string;
    email: string;
    role: string;
    is_active: boolean;
    full_name?: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { role } = useAuth();
    const navigate = React.useCallback(require('react-router-dom').useNavigate(), []);

    useEffect(() => {
        if (!loading && role !== 'admin') {
            // Redirect unauthorized users
            navigate('/cms');
        } else {
            fetchUsers();
        }
    }, [role, loading, navigate]);

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('email');
        if (error) {
            console.error('Error fetching users:', error);
        } else if (data) {
            setUsers(data);
        }
        setLoading(false);
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            fetchUsers();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error al actualizar estado');
        }
    };

    const changeRole = async (id: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', id);

            if (error) throw error;
            fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Error al actualizar rol');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando usuarios...</div>;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#111118] dark:text-white">Gestión de Usuarios</h1>
                        <p className="text-[#616189] text-sm mt-1">Administra accesos y permisos del sistema</p>
                    </div>
                </div>
                <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                    {users.length} Usuarios Registrados
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a1a2e] rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-[#616189] uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                                                {user.email.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-[#111118] dark:text-gray-200">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                            }`}>
                                            {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`size-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            <span className={`text-sm font-medium ${user.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {user.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => changeRole(user.id, user.role)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                                                title="Cambiar Rol"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">badge</span>
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(user.id, user.is_active)}
                                                className={`p-1.5 rounded-lg transition-colors ${user.is_active
                                                    ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                    : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                    }`}
                                                title={user.is_active ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                                            >
                                                <span className="material-symbols-outlined text-[20px]">
                                                    {user.is_active ? 'block' : 'check_circle'}
                                                </span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
