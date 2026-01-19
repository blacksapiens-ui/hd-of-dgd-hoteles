import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHotelContext } from '../context/HotelContext';

const HotelProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { getHotel, news } = useHotelContext();
    const hotel = getHotel(id || '');

    // Lightbox State
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Get active news for this hotel
    const hotelNews = news.filter(n => n.relatedHotelId === id && n.isActive);

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

    // Combine images for slideshow
    const allImages = hotel ? [hotel.mainImage, ...(hotel.gallery || [])] : [];

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setIsLightboxOpen(true);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        document.body.style.overflow = 'auto'; // Restore scrolling
    };

    const nextImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, [allImages.length]);

    const prevImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }, [allImages.length]);

    // Keyboard navigation
    useEffect(() => {
        if (!isLightboxOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, nextImage, prevImage]);

    if (!hotel) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center p-8">
                <h2 className="text-2xl font-bold mb-4">Hotel no encontrado</h2>
                <button onClick={() => navigate('/hotels')} className="bg-primary text-white px-4 py-2 rounded-lg">Volver al Directorio</button>
            </div>
        );
    }
    
    // Combine standard and extended amenities for display logic if needed, or map explicitly
    const amenityMap: Record<string, { icon: string; label: string }> = {
        // Standard
        wifi: { icon: 'wifi', label: 'Wifi Gratis' },
        pool: { icon: 'pool', label: 'Piscina' },
        spa: { icon: 'spa', label: 'Spa' },
        gym: { icon: 'fitness_center', label: 'Gimnasio' },
        ac: { icon: 'ac_unit', label: 'Aire Acondicionado' },
        roomService: { icon: 'room_service', label: 'Room Service' },
        beach: { icon: 'beach_access', label: 'Acceso a Playa' },
        kidsClub: { icon: 'child_care', label: 'Club de Niños' },
        // Extended
        petFriendly: { icon: 'pets', label: 'Pet Friendly' },
        accessibility: { icon: 'accessible', label: 'Movilidad Reducida' },
        eventsHall: { icon: 'meeting_room', label: 'Salones Eventos' },
        parking: { icon: 'local_parking', label: 'Parqueadero' },
        hotWater: { icon: 'water_heater', label: 'Ducha Caliente' },
        miniFridge: { icon: 'kitchen', label: 'Mini Nevera' },
        safe: { icon: 'lock', label: 'Cajilla Seguridad' },
        nightShow: { icon: 'theater_comedy', label: 'Show Nocturno' },
        extraActivities: { icon: 'sports_handball', label: 'Actividades Extras' },
        kidsPark: { icon: 'park', label: 'Parque Niños' },
        kidsPool: { icon: 'pool', label: 'Piscina Niños' },
        privateBeach: { icon: 'umbrella', label: 'Playa Privada' }
    };

    return (
        <div className="max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-6 pb-20">
            {/* Header Navigation */}
            <nav className="flex items-center text-sm text-[#616189] overflow-hidden whitespace-nowrap">
                <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/')}>Inicio</span>
                <span className="material-symbols-outlined text-base mx-2 text-gray-400">chevron_right</span>
                <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/hotels')}>Hoteles</span>
                <span className="material-symbols-outlined text-base mx-2 text-gray-400">chevron_right</span>
                <span className="font-medium text-[#111118] dark:text-white truncate">{hotel.name}</span>
            </nav>

            {/* Header Title & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-[#111118] dark:text-white text-3xl md:text-5xl font-black leading-tight tracking-tight mb-2">{hotel.name}</h1>
                    <div className="flex items-center gap-3 text-sm text-[#616189]">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-lg fill text-primary">location_on</span>
                            {hotel.location}
                        </span>
                        <span className="hidden md:inline text-gray-300">|</span>
                        <div className="flex items-center gap-1">
                             <span className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={`material-symbols-outlined text-lg ${i < Math.floor(hotel.rating) ? 'fill' : ''}`}>star</span>
                                ))}
                            </span>
                            <span className="font-bold text-[#111118] dark:text-white">{hotel.rating}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Section */}
            <div className="w-full h-[400px] md:h-[500px] grid grid-cols-4 grid-rows-2 gap-3 rounded-2xl overflow-hidden shadow-sm">
                {/* Main Image (Index 0) */}
                <div 
                    className="col-span-4 md:col-span-2 row-span-2 relative group cursor-pointer overflow-hidden"
                    onClick={() => openLightbox(0)}
                >
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: `url("${hotel.mainImage}")`}}></div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
                
                {/* Mapped Gallery Images (Index i + 1) */}
                {hotel.gallery && hotel.gallery.slice(0, 3).map((img, i) => (
                    <div 
                        key={i} 
                        className="col-span-2 md:col-span-1 row-span-1 relative group cursor-pointer overflow-hidden"
                        onClick={() => openLightbox(i + 1)}
                    >
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: `url("${img}")`}}></div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                ))}
                
                {/* Overflow Counter (Opens Lightbox at Index 4) */}
                {hotel.gallery.length > 3 && (
                     <div 
                        className="col-span-2 md:col-span-1 row-span-1 relative group cursor-pointer overflow-hidden flex items-center justify-center bg-gray-900 text-white font-bold text-xl hover:bg-gray-800 transition-colors"
                        onClick={() => openLightbox(4)}
                     >
                        +{hotel.gallery.length - 3} Fotos
                     </div>
                )}
            </div>
            
            {/* Main Layout Grid */}
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                
                {/* Left Column: Details (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    
                    {/* Hotel News Section */}
                    {hotelNews.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined">campaign</span> Novedades del Hotel
                            </h3>
                            <div className="flex flex-col gap-4">
                                {hotelNews.map(n => (
                                    <div key={n.id} className="bg-white dark:bg-[#101022] p-4 rounded-lg shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getColorClass(n.tagColor)}`}>{n.category}</span>
                                            <span className="text-xs text-gray-500">Vigente hasta: {n.expirationDate}</span>
                                        </div>
                                        <h4 className="font-bold text-sm mb-1">{n.title}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{n.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <h2 className="text-xl font-bold text-[#111118] dark:text-white mb-4">Sobre el alojamiento</h2>
                        <p className="text-[#616189] leading-relaxed text-justify whitespace-pre-wrap text-base">{hotel.description}</p>
                    </div>

                    {/* Amenities Grid */}
                    <div className="bg-white dark:bg-[#1a1a2e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-[#111118] dark:text-white mb-6">Lo que ofrece este lugar</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                            {/* Standard Amenities */}
                            {hotel.amenities && Object.entries(hotel.amenities).filter(([_, val]) => val).map(([key]) => (
                                <div key={key} className="flex items-center gap-3 text-[#616189]">
                                    <span className="material-symbols-outlined text-2xl text-gray-400">{amenityMap[key]?.icon || 'check_circle'}</span>
                                    <span className="text-sm font-medium">{amenityMap[key]?.label || key}</span>
                                </div>
                            ))}
                            {/* Extended Amenities */}
                            {hotel.extendedAmenities && Object.entries(hotel.extendedAmenities).filter(([_, val]) => val).map(([key]) => (
                                <div key={key} className="flex items-center gap-3 text-[#616189]">
                                    <span className="material-symbols-outlined text-2xl text-gray-400">{amenityMap[key]?.icon || 'check_circle'}</span>
                                    <span className="text-sm font-medium">{amenityMap[key]?.label || key}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rooms Section */}
                    <div>
                        <h2 className="text-xl font-bold text-[#111118] dark:text-white mb-6">Tipos de Habitaciones</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {hotel.roomTypes && hotel.roomTypes.length > 0 ? hotel.roomTypes.map(room => (
                                <div key={room.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-[#1a1a2e]">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg">{room.name}</h3>
                                        <span className="bg-gray-100 dark:bg-gray-800 text-xs font-bold px-2 py-1 rounded">x{room.quantity}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">{room.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <span className="material-symbols-outlined text-sm">person</span>
                                        Max. {room.capacity} Personas
                                    </div>
                                </div>
                            )) : <p className="text-gray-400 italic">No hay información detallada de habitaciones.</p>}
                        </div>
                    </div>

                    {/* Restaurants Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-xl font-bold text-[#111118] dark:text-white">Gastronomía</h2>
                            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">{hotel.restaurants?.length || 0} Restaurantes</span>
                            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">{hotel.bars || 0} Bares</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            {hotel.restaurants && hotel.restaurants.length > 0 ? hotel.restaurants.map(rest => (
                                <div key={rest.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-[#1a1a2e] flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-base">{rest.name}</h3>
                                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500">{rest.cuisineType}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">schedule</span> {rest.schedule}
                                    </div>
                                    {rest.requiresReservation && (
                                        <div className="text-xs text-orange-600 font-bold flex items-center gap-1 mt-1">
                                            <span className="material-symbols-outlined text-sm">edit_calendar</span> Requiere Reserva
                                        </div>
                                    )}
                                </div>
                            )) : <p className="text-gray-400 italic">No hay información detallada de restaurantes.</p>}
                        </div>
                    </div>

                    {/* Location Map */}
                    <div>
                        <h2 className="text-xl font-bold text-[#111118] dark:text-white mb-4">Ubicación</h2>
                        <div className="w-full h-80 bg-gray-200 rounded-2xl overflow-hidden shadow-sm relative">
                            {hotel.latitude && hotel.longitude ? (
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    frameBorder="0" 
                                    scrolling="no" 
                                    marginHeight={0} 
                                    marginWidth={0} 
                                    src={`https://maps.google.com/maps?q=${hotel.latitude},${hotel.longitude}&z=15&output=embed`}
                                    className="grayscale hover:grayscale-0 transition-all duration-500"
                                ></iframe>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    Coordenadas no disponibles
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-sm text-gray-500 flex items-center gap-1"><span className="material-symbols-outlined text-sm">pin_drop</span> {hotel.location}</p>
                    </div>

                </div>

                {/* Right Column: AI Suggestions & Schedules (4 cols) */}
                <div className="lg:col-span-4 relative">
                    <div className="sticky top-6 flex flex-col gap-6">
                        
                        {/* AI Suggestions Card (Replaces Booking/Price Card) */}
                        <div className="bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-xl border border-blue-100 dark:border-blue-900/30 p-6 flex flex-col gap-4 relative overflow-hidden">
                             {/* AI Badge */}
                             <div className="absolute top-0 right-0 bg-gradient-to-bl from-blue-500 to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                                Sugerido por IA
                             </div>

                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-primary text-3xl animate-pulse">auto_awesome</span>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Explora la zona</h3>
                                    <p className="text-xs text-gray-500">Cerca de {hotel.name}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                {hotel.nearbyPlaces && hotel.nearbyPlaces.length > 0 ? hotel.nearbyPlaces.map((place) => (
                                    <div key={place.id} className="flex gap-3 items-start">
                                        <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${
                                            place.type === 'attraction' ? 'bg-purple-100 text-purple-600' :
                                            place.type === 'activity' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                        }`}>
                                            <span className="material-symbols-outlined text-sm">
                                                {place.type === 'attraction' ? 'photo_camera' : place.type === 'activity' ? 'hiking' : 'restaurant'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 dark:text-white">{place.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[10px]">distance</span> {place.distance}
                                            </p>
                                            {place.note && <p className="text-[10px] text-primary italic mt-0.5">{place.note}</p>}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-400 italic">No hay sugerencias disponibles por el momento.</p>
                                )}
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 flex gap-3 items-start mt-2">
                                <span className="material-symbols-outlined text-gray-400 text-sm mt-0.5">info</span>
                                <p className="text-xs text-gray-500">
                                    Para reservar tours y actividades específicas, por favor consultar directamente en recepción.
                                </p>
                            </div>
                        </div>

                        {/* Schedules Card */}
                        <div className="bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
                            <h3 className="font-bold text-lg border-b border-gray-100 dark:border-gray-800 pb-2">Horarios y Políticas</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-400 uppercase font-bold">Check-in</span>
                                    <p className="font-semibold">{hotel.schedules?.checkIn || '--'}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 uppercase font-bold">Check-out</span>
                                    <p className="font-semibold">{hotel.schedules?.checkOut || '--'}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Desayuno</span>
                                    <span className="font-medium">{hotel.schedules?.breakfastTime || '--'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Almuerzo</span>
                                    <span className="font-medium">{hotel.schedules?.lunchTime || '--'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Cena</span>
                                    <span className="font-medium">{hotel.schedules?.dinnerTime || '--'}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                                <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Plan Alimenticio</span>
                                <p className="text-sm font-medium flex items-center gap-1"><span className="material-symbols-outlined text-sm">restaurant</span> {hotel.mealPlan}</p>
                            </div>
                            
                            <div>
                                <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Política de Niños</span>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{hotel.childPolicy}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Lightbox Overlay */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200" onClick={closeLightbox}>
                    
                    {/* Close Button */}
                    <button 
                        onClick={closeLightbox} 
                        className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all z-20"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>

                    {/* Navigation Buttons */}
                    <button 
                        onClick={prevImage} 
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-all z-20 hidden md:flex"
                    >
                        <span className="material-symbols-outlined text-3xl">chevron_left</span>
                    </button>
                    <button 
                        onClick={nextImage} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-all z-20 hidden md:flex"
                    >
                        <span className="material-symbols-outlined text-3xl">chevron_right</span>
                    </button>

                    {/* Main Image */}
                    <div className="w-full h-full p-4 md:p-12 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={allImages[currentImageIndex]} 
                            alt={`Gallery ${currentImageIndex + 1}`} 
                            className="max-h-full max-w-full object-contain rounded shadow-2xl animate-in zoom-in-95 duration-300"
                        />
                    </div>

                    {/* Image Counter */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full text-white text-sm font-medium backdrop-blur-md">
                        {currentImageIndex + 1} / {allImages.length}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelProfilePage;