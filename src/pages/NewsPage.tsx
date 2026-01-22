import React, { useState } from 'react';
import { useHotelContext } from '../context/HotelContext';
import { useNavigate } from 'react-router-dom';

const NewsPage: React.FC = () => {
    const { news, hotels } = useHotelContext();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Helper for colors (Copied from HomePage for consistency)
    const getColorClass = (colorName: string) => {
        const map: Record<string, string> = {
            'blue': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            'red': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            'green': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            'orange': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
            'purple': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        };
        return map[colorName] || map['blue'];
    };

    // Filter and Sort News
    const categories = ['all', ...Array.from(new Set(news.map(n => n.category)))];

    const filteredNews = news
        .filter(n => {
            const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  n.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

    return (
        <div className="flex-1 h-full overflow-y-auto bg-background-light dark:bg-background-dark">
            <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-[#111118] dark:text-white mb-2">Centro de Noticias</h1>
                        <p className="text-[#616189] max-w-2xl">
                            Mantente informado sobre las últimas actualizaciones, mantenimientos, eventos y novedades de nuestra red de hoteles.
                        </p>
                    </div>
                    
                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
                            <input 
                                type="text" 
                                placeholder="Buscar noticias..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a2e] text-sm w-full md:w-64 focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a2e] text-sm focus:ring-2 focus:ring-primary outline-none capitalize"
                        >
                            <option value="all">Todas las categorías</option>
                            {categories.filter(c => c !== 'all').map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* News Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNews.length > 0 ? filteredNews.map(n => (
                        <article key={n.id} className="bg-white dark:bg-[#1a1a2e] rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getColorClass(n.tagColor)}`}>
                                        {n.category}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-[#616189]">
                                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                                        {n.publishDate}
                                    </div>
                                </div>
                                
                                {n.relatedHotelId && (
                                    <div 
                                        onClick={() => navigate(`/hotel-profile/${n.relatedHotelId}`)}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary mb-3 cursor-pointer group w-fit"
                                    >
                                        <span className="material-symbols-outlined text-sm">domain</span>
                                        <span className="group-hover:underline">
                                            {hotels.find(h => h.id === n.relatedHotelId)?.name || 'Hotel Relacionado'}
                                        </span>
                                    </div>
                                )}

                                <h2 className="text-xl font-bold text-[#111118] dark:text-white mb-3 leading-tight">
                                    {n.title}
                                </h2>
                                
                                <p className="text-[#616189] text-sm leading-relaxed mb-6 flex-1 whitespace-pre-line">
                                    {n.content}
                                </p>

                                <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-400">
                                    <span>{n.destination ? `📍 ${n.destination}` : 'Noticia General'}</span>
                                    {n.expirationDate && (
                                        <span className={new Date(n.expirationDate) < new Date() ? 'text-red-400' : ''}>
                                            Expira: {n.expirationDate}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </article>
                    )) : (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center text-gray-400">
                            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">newspaper</span>
                            <p className="text-lg font-medium">No hay noticias disponibles</p>
                            <p className="text-sm">Intenta ajustar tu búsqueda o filtros.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsPage;
