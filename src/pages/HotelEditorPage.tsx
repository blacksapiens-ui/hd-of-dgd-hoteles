import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHotelContext } from '../context/HotelContext';
import { Hotel, RoomType, Restaurant } from '../types';

const HotelEditorPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const { getHotel, addHotel, updateHotel } = useHotelContext();
    const [activeTab, setActiveTab] = useState('general');

    const defaultHotel: Hotel = {
        id: Date.now().toString(),
        name: '', location: '', rating: 4.5, reviews: 0, category: 'Confort', featured: false, status: 'Activo',
        description: '', latitude: '', longitude: '', highlights: [],
        mainImage: '', gallery: [],
        amenities: { wifi: true, pool: false, spa: false, gym: false, ac: true, roomService: false, beach: false, kidsClub: false },
        extendedAmenities: { 
            petFriendly: false, accessibility: false, eventsHall: false, parking: false, hotWater: true,
            miniFridge: false, safe: false, nightShow: false, extraActivities: false, kidsPark: false, kidsPool: false, privateBeach: false 
        },
        roomTypes: [],
        restaurants: [],
        bars: 0,
        schedules: { checkIn: '15:00', checkOut: '12:00', breakfastTime: '', lunchTime: '', dinnerTime: '' },
        mealPlan: 'Todo Incluido',
        childPolicy: '',
        nearbyPlaces: []
    };

    const [formData, setFormData] = useState<Hotel>(defaultHotel);

    useEffect(() => {
        if (isEditMode && id) {
            const existingHotel = getHotel(id);
            if (existingHotel) {
                // Ensure all complex structures exist even if loaded from old data
                setFormData({
                    ...defaultHotel,
                    ...existingHotel,
                    extendedAmenities: { ...defaultHotel.extendedAmenities, ...(existingHotel.extendedAmenities || {}) },
                    schedules: { ...defaultHotel.schedules, ...(existingHotel.schedules || {}) }
                });
            }
        }
    }, [isEditMode, id, getHotel]);

    // --- Handlers ---

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleScheduleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, schedules: { ...prev.schedules, [name]: value } }));
    };

    const handleAmenityChange = (key: string, type: 'amenities' | 'extendedAmenities') => {
        setFormData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [key]: !prev[type][key as keyof typeof prev[typeof type]]
            }
        }));
    };

    // --- Dynamic Lists Handlers (Rooms & Restaurants) ---

    const addRoomType = () => {
        const newRoom: RoomType = { id: Date.now().toString(), name: '', description: '', capacity: 2, quantity: 1 };
        setFormData(prev => ({ ...prev, roomTypes: [...prev.roomTypes, newRoom] }));
    };

    const updateRoomType = (index: number, field: keyof RoomType, value: any) => {
        const updatedRooms = [...formData.roomTypes];
        updatedRooms[index] = { ...updatedRooms[index], [field]: value };
        setFormData(prev => ({ ...prev, roomTypes: updatedRooms }));
    };

    const removeRoomType = (index: number) => {
        setFormData(prev => ({ ...prev, roomTypes: prev.roomTypes.filter((_, i) => i !== index) }));
    };

    const addRestaurant = () => {
        const newRest: Restaurant = { id: Date.now().toString(), name: '', cuisineType: '', requiresReservation: false, schedule: '' };
        setFormData(prev => ({ ...prev, restaurants: [...prev.restaurants, newRest] }));
    };

    const updateRestaurant = (index: number, field: keyof Restaurant, value: any) => {
        const updatedRests = [...formData.restaurants];
        updatedRests[index] = { ...updatedRests[index], [field]: value };
        setFormData(prev => ({ ...prev, restaurants: updatedRests }));
    };

    const removeRestaurant = (index: number) => {
        setFormData(prev => ({ ...prev, restaurants: prev.restaurants.filter((_, i) => i !== index) }));
    };

    // --- Gallery Handler ---
    const handleGalleryAdd = () => {
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ''] }));
    };

    const handleGalleryUpdate = (index: number, value: string) => {
        const newGallery = [...formData.gallery];
        newGallery[index] = value;
        setFormData(prev => ({ ...prev, gallery: newGallery }));
    };
    
    const handleGalleryRemove = (index: number) => {
         setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
    };

    const handleSave = () => {
        if (isEditMode && id) {
            updateHotel(id, formData);
            alert('Hotel actualizado correctamente.');
        } else {
            addHotel({ ...formData, id: Date.now().toString() });
            alert('Hotel creado correctamente.');
        }
        navigate('/cms');
    };

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden">
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-8 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 flex-shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/cms')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            {isEditMode ? `Editar: ${formData.name}` : 'Nuevo Perfil de Hotel'}
                        </h1>
                    </div>
                    <button onClick={handleSave} className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95">
                        <span className="material-symbols-outlined">save</span> Guardar Cambios
                    </button>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Tabs */}
                    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-2">
                        {[
                            { id: 'general', icon: 'apartment', label: 'Información General' },
                            { id: 'rooms', icon: 'bedroom_parent', label: 'Habitaciones' },
                            { id: 'amenities', icon: 'pool', label: 'Servicios y Amenidades' },
                            { id: 'dining', icon: 'restaurant', label: 'Gastronomía y Bares' },
                            { id: 'schedules', icon: 'schedule', label: 'Horarios y Políticas' },
                            { id: 'photos', icon: 'photo_library', label: 'Galería de Fotos' },
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                            >
                                <span className="material-symbols-outlined">{tab.icon}</span> 
                                {tab.label}
                            </button>
                        ))}
                    </aside>

                    {/* Form Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-20">
                        <div className="max-w-4xl mx-auto space-y-8">
                            
                            {/* --- TAB: GENERAL --- */}
                            {activeTab === 'general' && (
                                <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                                        <h3 className="text-lg font-bold border-b pb-2 mb-4 dark:border-gray-700">Datos Principales</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Nombre del Hotel</label>
                                                <input name="name" value={formData.name} onChange={handleInput} className="w-full border p-2.5 rounded-lg dark:bg-slate-900 dark:border-gray-700" placeholder="Ej: Hotel Cartagena Plaza" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Destino / Ubicación</label>
                                                <input 
                                                    name="location" 
                                                    value={formData.location} 
                                                    onChange={handleInput} 
                                                    list="locations-list"
                                                    className="w-full border p-2.5 rounded-lg dark:bg-slate-900 dark:border-gray-700" 
                                                    placeholder="Ej: Cartagena, Santa Marta, San Andrés..." 
                                                />
                                                <datalist id="locations-list">
                                                    <option value="Cartagena" />
                                                    <option value="Santa Marta" />
                                                    <option value="San Andrés" />
                                                    <option value="Punta Cana" />
                                                    <option value="Cancún" />
                                                    <option value="Medellín" />
                                                    <option value="Bogotá" />
                                                </datalist>
                                                <p className="text-[10px] text-gray-400">Selecciona de la lista o escribe una nueva ubicación.</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Categoría</label>
                                                <select name="category" value={formData.category} onChange={handleInput} className="w-full border p-2.5 rounded-lg dark:bg-slate-900 dark:border-gray-700">
                                                    <option value="Elite">Elite</option>
                                                    <option value="Confort">Confort</option>
                                                    <option value="Esencial">Esencial</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Reseña / Descripción General</label>
                                            <textarea name="description" rows={5} value={formData.description} onChange={handleInput} className="w-full border p-2.5 rounded-lg dark:bg-slate-900 dark:border-gray-700 resize-none" placeholder="Escribe una reseña detallada del hotel..." />
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                                        <h3 className="text-lg font-bold border-b pb-2 mb-4 dark:border-gray-700">Ubicación en Mapa</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Latitud</label>
                                                <input name="latitude" value={formData.latitude} onChange={handleInput} className="w-full border p-2.5 rounded-lg dark:bg-slate-900 dark:border-gray-700" placeholder="Ej: 10.3996" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Longitud</label>
                                                <input name="longitude" value={formData.longitude} onChange={handleInput} className="w-full border p-2.5 rounded-lg dark:bg-slate-900 dark:border-gray-700" placeholder="Ej: -75.5564" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400">Estos datos se usan para mostrar el mapa exacto de Google Maps.</p>
                                    </div>
                                </section>
                            )}

                            {/* --- TAB: HABITACIONES --- */}
                            {activeTab === 'rooms' && (
                                <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                     <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold dark:text-white">Tipos de Habitación</h3>
                                        <button onClick={addRoomType} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><span className="material-symbols-outlined">add</span> Agregar Habitación</button>
                                    </div>
                                    {formData.roomTypes.map((room, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                                            <button onClick={() => removeRoomType(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-2"><span className="material-symbols-outlined">delete</span></button>
                                            <div className="grid md:grid-cols-2 gap-4 mb-4 pr-10">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Nombre Habitación</label>
                                                    <input value={room.name} onChange={(e) => updateRoomType(idx, 'name', e.target.value)} className="w-full border p-2 rounded dark:bg-slate-900 dark:border-gray-700" placeholder="Ej: Suite Vista Mar" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-gray-500 uppercase">Cantidad Total</label>
                                                        <input type="number" value={room.quantity} onChange={(e) => updateRoomType(idx, 'quantity', parseInt(e.target.value))} className="w-full border p-2 rounded dark:bg-slate-900 dark:border-gray-700" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-gray-500 uppercase">Capacidad Max</label>
                                                        <input type="number" value={room.capacity} onChange={(e) => updateRoomType(idx, 'capacity', parseInt(e.target.value))} className="w-full border p-2 rounded dark:bg-slate-900 dark:border-gray-700" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Descripción / Comodidades de la habitación</label>
                                                <input value={room.description} onChange={(e) => updateRoomType(idx, 'description', e.target.value)} className="w-full border p-2 rounded dark:bg-slate-900 dark:border-gray-700" placeholder="Ej: Cama King, balcón privado, jacuzzi..." />
                                            </div>
                                        </div>
                                    ))}
                                    {formData.roomTypes.length === 0 && <p className="text-center text-gray-400 italic">No hay habitaciones registradas.</p>}
                                </section>
                            )}

                            {/* --- TAB: AMENIDADES --- */}
                            {activeTab === 'amenities' && (
                                <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <h3 className="text-lg font-bold border-b pb-2 mb-4 dark:border-gray-700">Comodidades y Servicios Generales</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {[
                                                { k: 'wifi', l: 'Wifi Gratis' }, { k: 'pool', l: 'Piscina General' }, 
                                                { k: 'spa', l: 'Spa' }, { k: 'gym', l: 'Gimnasio' }, 
                                                { k: 'ac', l: 'Aire Acondicionado' }, { k: 'roomService', l: 'Servicio a la Habitación' }, 
                                                { k: 'beach', l: 'Acceso a Playa' }, { k: 'kidsClub', l: 'Club de Niños' }
                                            ].map(({k, l}) => (
                                                <label key={k} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors dark:border-gray-700">
                                                    <input type="checkbox" checked={formData.amenities[k as keyof typeof formData.amenities]} onChange={() => handleAmenityChange(k, 'amenities')} className="w-5 h-5 text-primary rounded focus:ring-primary" />
                                                    <span className="text-sm font-medium">{l}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <h3 className="text-lg font-bold border-b pb-2 mb-4 dark:border-gray-700">Detalles Específicos</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {[
                                                { k: 'petFriendly', l: 'Pet Friendly' }, { k: 'accessibility', l: 'Movilidad Reducida' },
                                                { k: 'eventsHall', l: 'Salones Eventos' }, { k: 'parking', l: 'Parqueadero' },
                                                { k: 'hotWater', l: 'Ducha Caliente' }, { k: 'miniFridge', l: 'Mini Nevera' },
                                                { k: 'safe', l: 'Cajilla Seguridad' }, { k: 'nightShow', l: 'Show Nocturno' },
                                                { k: 'extraActivities', l: 'Actividades Extras' }, { k: 'kidsPark', l: 'Parque Niños' },
                                                { k: 'kidsPool', l: 'Piscina Niños' }, { k: 'privateBeach', l: 'Playa Privada' }
                                            ].map(({k, l}) => (
                                                <label key={k} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors dark:border-gray-700">
                                                    <input type="checkbox" checked={formData.extendedAmenities[k as keyof typeof formData.extendedAmenities]} onChange={() => handleAmenityChange(k, 'extendedAmenities')} className="w-5 h-5 text-primary rounded focus:ring-primary" />
                                                    <span className="text-sm font-medium">{l}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* --- TAB: GASTRONOMIA --- */}
                            {activeTab === 'dining' && (
                                <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                     <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <div className="space-y-1 max-w-xs">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Número de Bares</label>
                                            <input type="number" name="bars" value={formData.bars} onChange={handleInput} className="w-full border p-2 rounded dark:bg-slate-900 dark:border-gray-700" />
                                        </div>
                                     </div>

                                     <div className="flex justify-between items-center mt-6">
                                        <h3 className="text-xl font-bold dark:text-white">Restaurantes</h3>
                                        <button onClick={addRestaurant} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><span className="material-symbols-outlined">add</span> Agregar Restaurante</button>
                                    </div>

                                    {formData.restaurants.map((rest, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative">
                                            <button onClick={() => removeRestaurant(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-2"><span className="material-symbols-outlined">delete</span></button>
                                            <div className="grid md:grid-cols-2 gap-4 mb-4 pr-10">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Nombre del Restaurante</label>
                                                    <input value={rest.name} onChange={(e) => updateRestaurant(idx, 'name', e.target.value)} className="w-full border p-2 rounded dark:bg-slate-900 dark:border-gray-700" placeholder="Ej: Restaurante El Mirador" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Comida</label>
                                                    <input value={rest.cuisineType} onChange={(e) => updateRestaurant(idx, 'cuisineType', e.target.value)} className="w-full border p-2 rounded dark:bg-slate-900 dark:border-gray-700" placeholder="Ej: Italiana, Buffet, Mariscos" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Horario de Atención</label>
                                                    <input value={rest.schedule} onChange={(e) => updateRestaurant(idx, 'schedule', e.target.value)} className="w-full border p-2 rounded dark:bg-slate-900 dark:border-gray-700" placeholder="Ej: 12:00 PM - 10:00 PM" />
                                                </div>
                                                <div className="flex items-end pb-2">
                                                     <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" checked={rest.requiresReservation} onChange={(e) => updateRestaurant(idx, 'requiresReservation', e.target.checked)} className="w-5 h-5 text-primary rounded" />
                                                        <span className="text-sm font-bold">Requiere Reservación</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </section>
                            )}

                            {/* --- TAB: HORARIOS --- */}
                            {activeTab === 'schedules' && (
                                <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                                        <h3 className="text-lg font-bold border-b pb-2 mb-4 dark:border-gray-700">Horarios Generales</h3>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Hora Check-In</label>
                                                <input name="checkIn" value={formData.schedules.checkIn} onChange={handleScheduleInput} className="w-full border p-2.5 rounded-lg dark:bg-slate-900 dark:border-gray-700" placeholder="Ej: 15:00" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Hora Check-Out</label>
                                                <input name="checkOut" value={formData.schedules.checkOut} onChange={handleScheduleInput} className="w-full border p-2.5 rounded-lg dark:bg-slate-900 dark:border-gray-700" placeholder="Ej: 12:00" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Horario Desayuno</label>
                                                <input name="breakfastTime" value={formData.schedules.breakfastTime} onChange={handleScheduleInput} className="w-full border p-2.5 rounded-lg dark:bg-slate-900 dark:border-gray-700" placeholder="Ej: 07:00 - 10:00" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Horario Almuerzo</label>
                                                <input name="lunchTime" value={formData.schedules.lunchTime} onChange={handleScheduleInput} className="w-full border p-2.5 rounded-lg dark:bg-slate-900 dark:border-gray-700" placeholder="Ej: 12:30 - 14:30" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Horario Cena</label>
                                                <input name="dinnerTime" value={formData.schedules.dinnerTime} onChange={handleScheduleInput} className="w-full border p-2.5 rounded-lg dark:bg-slate-900 dark:border-gray-700" placeholder="Ej: 19:00 - 22:00" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                                        <h3 className="text-lg font-bold border-b pb-2 mb-4 dark:border-gray-700">Políticas</h3>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Alimentación (Meal Plan)</label>
                                            <input name="mealPlan" value={formData.mealPlan} onChange={handleInput} className="w-full border p-2.5 rounded-lg dark:bg-slate-900 dark:border-gray-700" placeholder="Ej: Desayuno y Cena, Todo Incluido..." />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Política de Niños</label>
                                            <input name="childPolicy" value={formData.childPolicy} onChange={handleInput} className="w-full border p-2.5 rounded-lg dark:bg-slate-900 dark:border-gray-700" placeholder="Ej: Niños de 0-4 años gratis, 5-11 pagan 50%..." />
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* --- TAB: FOTOS --- */}
                            {activeTab === 'photos' && (
                                <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                     <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                                        <h3 className="text-lg font-bold dark:text-white">Imagen Principal (Portada)</h3>
                                        <div className="space-y-1">
                                            <input name="mainImage" value={formData.mainImage} onChange={handleInput} className="w-full border p-2.5 rounded-lg dark:bg-slate-900 dark:border-gray-700" placeholder="URL de la imagen..." />
                                        </div>
                                        {formData.mainImage && (
                                            <div className="h-48 w-full bg-cover bg-center rounded-lg" style={{backgroundImage: `url("${formData.mainImage}")`}}></div>
                                        )}
                                     </div>

                                     <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold dark:text-white">Galería de Fotos ({formData.gallery.length}/20)</h3>
                                            <button disabled={formData.gallery.length >= 20} onClick={handleGalleryAdd} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">Agregar Foto</button>
                                        </div>
                                        <div className="grid gap-3">
                                            {formData.gallery.map((url, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input value={url} onChange={(e) => handleGalleryUpdate(idx, e.target.value)} className="flex-1 border p-2 rounded dark:bg-slate-900 dark:border-gray-700" placeholder={`URL Foto ${idx + 1}`} />
                                                    <button onClick={() => handleGalleryRemove(idx)} className="bg-red-50 text-red-500 p-2 rounded hover:bg-red-100"><span className="material-symbols-outlined">delete</span></button>
                                                </div>
                                            ))}
                                            {formData.gallery.length === 0 && <p className="text-gray-400 italic">No hay fotos en la galería.</p>}
                                        </div>
                                     </div>
                                </section>
                            )}

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HotelEditorPage;