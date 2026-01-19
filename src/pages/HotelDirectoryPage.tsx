import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotelContext } from '../context/HotelContext';

const HotelDirectoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { hotels } = useHotelContext(); // Read from context
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedLocation, setSelectedLocation] = useState<string>('all');

    // Extract unique locations dynamically for the filter
    const uniqueLocations = useMemo(() => {
        const locs = hotels.map(h => h.location).filter(Boolean);
        return Array.from(new Set(locs)).sort();
    }, [hotels]);

    const filteredHotels = hotels.filter(hotel => {
        const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || hotel.category === selectedCategory;
        const matchesLocation = selectedLocation === 'all' || hotel.location === selectedLocation;
        
        return matchesSearch && matchesCategory && matchesLocation;
    });

    return (
        <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-8">
            <div className="flex flex-col gap-6">
                <nav className="flex items-center text-sm text-[#616189]">
                    <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/')}>Inicio</span>
                    <span className="material-symbols-outlined text-base mx-2 text-gray-400">chevron_right</span>
                    <span className="font-medium text-[#111118] dark:text-white">Directorio de Hoteles</span>
                </nav>
                
                <div className="flex flex-col gap-2">
                    <h1 className="text-[#111118] dark:text-white text-3xl font-black tracking-tight">Encuentra el alojamiento perfecto</h1>
                    <p className="text-[#616189] max-w-2xl">Explora nuestra base de datos actualizada. ({hotels.length} propiedades listadas)</p>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-6 sticky top-0 z-10 backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95">
                    
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="relative w-full md:flex-[2]">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-2xl">search</span>
                            <input 
                                className="w-full h-12 pl-12 pr-4 rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 text-[#111118] dark:text-white placeholder-gray-400 focus:border-primary focus:ring-primary text-base transition-all focus:shadow-md" 
                                placeholder="Buscar por nombre..." 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Location Filter Dropdown */}
                        <div className="relative w-full md:flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary material-symbols-outlined text-xl">location_on</span>
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="w-full h-12 pl-10 pr-8 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 text-[#111118] dark:text-white focus:border-primary focus:ring-primary text-sm font-medium appearance-none cursor-pointer hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                            >
                                <option value="all">Todos los Destinos</option>
                                {uniqueLocations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined pointer-events-none text-xl">expand_more</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            <label className="text-xs font-bold text-[#616189] uppercase tracking-wider">Filtrar por Categoría</label>
                            <div className="flex flex-wrap gap-2">
                                {['all', 'Elite', 'Confort', 'Esencial'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`h-9 px-4 rounded-lg font-bold text-xs md:text-sm flex items-center gap-2 transition-all border ${
                                            selectedCategory === cat 
                                                ? 'bg-primary text-white border-primary shadow-md' 
                                                : 'bg-white dark:bg-[#1a1a2e] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {cat === 'all' && <span className="material-symbols-outlined text-base">apps</span>}
                                        {cat === 'Elite' && <span className="material-symbols-outlined text-base text-purple-400">diamond</span>}
                                        {cat === 'Confort' && <span className="material-symbols-outlined text-base text-blue-400">star</span>}
                                        {cat === 'Esencial' && <span className="material-symbols-outlined text-base text-green-400">eco</span>}
                                        {cat === 'all' ? 'Todos' : cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="text-sm text-[#616189]">
                            Mostrando <span className="font-bold text-[#111118] dark:text-white">{filteredHotels.length}</span> resultados
                        </div>
                    </div>
                </div>
                
                {/* Results Grid */}
                {filteredHotels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredHotels.map((hotel) => (
                            <article 
                                key={hotel.id}
                                className="group bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer" 
                                onClick={() => navigate(`/hotel-profile/${hotel.id}`)}
                            >
                                <div className="h-56 relative overflow-hidden bg-gray-200">
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{backgroundImage: `url("${hotel.mainImage}")`}}></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                    
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-sm border ${
                                            hotel.category === 'Elite' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/80 dark:text-purple-100 dark:border-purple-800' :
                                            hotel.category === 'Confort' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/80 dark:text-blue-100 dark:border-blue-800' :
                                            'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/80 dark:text-green-100 dark:border-green-800'
                                        }`}>
                                            {hotel.category}
                                        </span>
                                        {hotel.featured && (
                                            <span className="bg-yellow-400 text-yellow-900 border border-yellow-500 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[10px] fill">star</span> Top
                                            </span>
                                        )}
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                         <h3 className="text-xl font-bold leading-tight mb-1 text-white shadow-black drop-shadow-md">{hotel.name}</h3>
                                         <div className="flex items-center gap-1 text-xs font-medium text-gray-200">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            <span className="truncate">{hotel.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1 gap-4">
                                    <div className="flex justify-between items-center">
                                         <div className="flex items-center gap-1.5">
                                            <div className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-lg">{hotel.rating}</div>
                                            <span className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={`material-symbols-outlined text-sm ${i < Math.floor(hotel.rating) ? 'fill' : ''}`}>star</span>
                                                ))}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                        <button className="w-full text-primary text-sm font-bold bg-primary/5 hover:bg-primary/10 py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                                            Ver Detalles
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
                        <span className="material-symbols-outlined text-4xl text-gray-400 mb-4">search_off</span>
                        <h3 className="text-lg font-bold text-[#111118] dark:text-white mb-2">No se encontraron hoteles</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HotelDirectoryPage;