import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotelContext } from '../context/HotelContext';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { slides, news, hotels } = useHotelContext();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance carousel
    useEffect(() => {
        if (slides.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [slides]);

    const nextSlide = () => {
        if (slides.length > 0) setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        if (slides.length > 0) setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    // Helper for colors
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

    // Sort news by newest first
    const sortedNews = [...news].sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

    return (
        <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#111118] dark:text-white">Bienvenido de nuevo</h1>
                    <p className="text-[#616189] text-sm mt-1">Aquí encontrarás el resumen de actualizaciones y noticias de los hoteles para el día de hoy.</p>
                </div>
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-[#616189] group-focus-within:text-primary">search</span>
                    </div>
                    <input className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-white dark:bg-[#1a1a2e] text-sm text-[#111118] dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 focus:ring-2 focus:ring-primary placeholder:text-gray-400" placeholder="Buscar hotel por nombre..." type="text" />
                </div>
            </div>

            {/* Carousel Section */}
            {slides.length > 0 ? (
                <div className="relative w-full h-[360px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg group bg-gray-900">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                            {/* Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ease-linear"
                                style={{
                                    backgroundImage: `url("${slide.imageUrl}")`,
                                    transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)'
                                }}
                            ></div>

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#101022]/95 via-[#101022]/50 to-transparent"></div>

                            {/* Content */}
                            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center items-start max-w-2xl animate-in slide-in-from-bottom-6 fade-in duration-700">
                                {slide.promoTag && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm ${getColorClass(slide.tagColor)} bg-opacity-80`}>
                                        {slide.promoTag}
                                    </span>
                                )}
                                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 drop-shadow-md">
                                    {slide.title}
                                </h2>
                                <p className="text-gray-200 text-lg mb-8 max-w-lg drop-shadow-sm leading-relaxed">
                                    {slide.subtitle}
                                </p>
                                <button
                                    onClick={() => navigate(slide.ctaLink)}
                                    className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-6 rounded-lg shadow-lg transition-all hover:scale-105 flex items-center gap-2 group/btn"
                                >
                                    <span>{slide.ctaText}</span>
                                    <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="w-full h-[200px] flex items-center justify-center bg-gray-100 rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-400">No hay slides activos. Configúralos en el CMS.</p>
                </div>
            )}

            <section id="news">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#111118] dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">notifications_active</span>
                        Últimas Actualizaciones
                    </h3>
                    <a className="text-primary text-sm font-medium hover:underline" href="#">Ver todas</a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sortedNews.length > 0 ? sortedNews.slice(0, 3).map(n => (
                        <div key={n.id} className="bg-white dark:bg-[#1a1a2e] p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getColorClass(n.tagColor)}`}>{n.category}</span>
                                <span className="text-xs text-[#616189]">{n.publishDate}</span>
                            </div>
                            {n.relatedHotelId && (
                                <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wide">
                                    {hotels.find(h => h.id === n.relatedHotelId)?.name}
                                </p>
                            )}
                            <h4 className="font-bold text-[#111118] dark:text-white text-sm mb-2">{n.title}</h4>
                            <p className="text-xs text-[#616189] leading-relaxed line-clamp-3">{n.content}</p>
                        </div>
                    )) : (
                        <div className="col-span-3 text-center py-10 text-gray-400">No hay noticias recientes.</div>
                    )}
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#111118] dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">verified</span>
                        Hoteles Destacados
                    </h3>
                    <div className="flex gap-2">
                        <button className="size-8 rounded-full bg-white dark:bg-[#1a1a2e] shadow-sm flex items-center justify-center text-[#616189] hover:text-primary border border-gray-100 dark:border-gray-800">
                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                        </button>
                        <button className="size-8 rounded-full bg-white dark:bg-[#1a1a2e] shadow-sm flex items-center justify-center text-[#616189] hover:text-primary border border-gray-100 dark:border-gray-800">
                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotels.filter(h => h.featured).slice(0, 3).map(hotel => (
                        <div key={hotel.id} className="bg-white dark:bg-[#1a1a2e] rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 group hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/hotel-profile/${hotel.id}`)}>
                            <div className="relative h-48 overflow-hidden">
                                <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
                                    Categoría {hotel.category}
                                </div>
                                <div className="absolute top-3 right-3 z-10">
                                    <button className="bg-white/90 p-1.5 rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                                        <span className="material-symbols-outlined text-lg">favorite</span>
                                    </button>
                                </div>
                                <div className="w-full h-full bg-gray-200 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url("${hotel.mainImage}")` }}></div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-1 mb-1">
                                    <span className="material-symbols-outlined text-yellow-400 text-sm fill">star</span>
                                    <span className="text-xs font-bold text-[#111118] dark:text-white ml-1">{hotel.rating}</span>
                                </div>
                                <h4 className="text-base font-bold text-[#111118] dark:text-white mb-1 truncate">{hotel.name}</h4>
                                <div className="flex items-center gap-1 mb-4">
                                    <span className="material-symbols-outlined text-[#616189] text-sm">location_on</span>
                                    <p className="text-xs text-[#616189] truncate">{hotel.location}</p>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <button className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white px-3 py-2 rounded-lg transition-colors w-full">
                                        Ver Detalles
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="mt-8 text-center text-[#616189] text-sm py-4 border-t border-gray-200 dark:border-gray-800">
                <p>© 2024 DGD Hoteles. Información confidencial para uso exclusivo de agentes.</p>
            </footer>
        </div>
    );
};

export default HomePage;