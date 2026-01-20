import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hotel, HeroSlide, NewsItem, HotelAmenities, ExtendedAmenities, RoomType, Restaurant } from '../types';
import { useHotelContext } from '../context/HotelContext';
import { useAuth } from '../context/AuthContext';

const CMSPage: React.FC = () => {
    const navigate = useNavigate();
    const { hotels, deleteHotel, updateHotel, importHotels, news, addNews, updateNews, deleteNews, slides, addSlide, updateSlide, deleteSlide } = useHotelContext();
    const { role: authRole } = useAuth();

    const fileInputRef = useRef<HTMLInputElement>(null);

    // UI State
    const [activeSection, setActiveSection] = useState<'hotels' | 'web' | 'news' | 'users'>('hotels');
    const [searchTerm, setSearchTerm] = useState('');
    const [sheetUrl, setSheetUrl] = useState('');

    // Import Feedback State
    const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [importMessage, setImportMessage] = useState('');

    // News State
    const [isEditingNews, setIsEditingNews] = useState(false);
    const [currentNewsItem, setCurrentNewsItem] = useState<NewsItem | null>(null);

    // Slide Modal State
    const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

    const colors = [
        { name: 'Azul', value: 'blue', class: 'bg-blue-100 text-blue-700' },
        { name: 'Rojo', value: 'red', class: 'bg-red-100 text-red-700' },
        { name: 'Verde', value: 'green', class: 'bg-green-100 text-green-700' },
        { name: 'Naranja', value: 'orange', class: 'bg-orange-100 text-orange-700' },
        { name: 'Morado', value: 'purple', class: 'bg-purple-100 text-purple-700' },
    ];

    // Filter Logic
    const filteredHotels = hotels.filter(hotel =>
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- CSV Helper Functions ---
    const downloadCSVTemplate = () => {
        const headers = [
            'ID', 'Nombre', 'Ubicacion', 'Rating', 'Reviews', 'Categoria', 'Destacado', 'Estado',
            'Descripcion', 'Latitud', 'Longitud', 'Highlights',
            'ImagenPrincipal', 'Galeria',
            'PlanAlimenticio', 'PoliticaNinos', 'Bares',
            'CheckIn', 'CheckOut', 'Desayuno', 'Almuerzo', 'Cena',
            'Wifi', 'Piscina', 'Spa', 'Gimnasio', 'AireAcondicionado', 'RoomService', 'Playa', 'ClubNinos',
            'PetFriendly', 'Movilidad', 'Eventos', 'Parqueadero', 'AguaCaliente', 'MiniNevera', 'Cajilla', 'Show', 'Actividades', 'ParqueNinos', 'PiscinaNinos', 'PlayaPrivada',
            'TiposHabitacion_Formato_Nombre:Capacidad:Cantidad', 'Restaurantes_Formato_Nombre:Cocina:Reserva(SI/NO)'
        ];

        const sampleRow = [
            'AUTO', 'Hotel Demo Excel', 'Cartagena', '4.5', '120', 'Confort', 'SI', 'Activo',
            'Descripcion del hotel aqui', '10.39', '-75.55', 'Playa|Centro',
            'https://img.com/main.jpg', 'https://img.com/1.jpg|https://img.com/2.jpg',
            'Todo Incluido', 'Niños gratis', '2',
            '15:00', '12:00', '7-10', '12-2', '7-9',
            'SI', 'SI', 'NO', 'SI', 'SI', 'SI', 'SI', 'SI',
            'NO', 'SI', 'SI', 'NO', 'SI', 'SI', 'SI', 'SI', 'SI', 'SI', 'SI', 'NO',
            'Estandar:2:50|Suite:4:10', 'Restaurante A:Italiana:SI|Buffet B:Internacional:NO'
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + sampleRow.join(",");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "plantilla_hoteles_dgd.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const parseCSV = (text: string): Hotel[] => {
        const lines = text.split('\n');
        const hotels: Hotel[] = [];

        // Helper to parse boolean
        const parseBool = (val: string) => {
            if (!val) return false;
            const v = val.trim().toUpperCase();
            return v === 'TRUE' || v === 'SI' || v === 'YES' || v === '1' || v === 'S';
        };

        // Helper to parse pipe lists
        const parseList = (val: string) => val ? val.split('|').map(s => s.trim()) : [];

        // Helper to parse Rooms (Name:Cap:Qty)
        const parseRooms = (val: string): RoomType[] => {
            if (!val) return [];
            return val.split('|').map((item, idx) => {
                const parts = item.split(':');
                return {
                    id: `room-${Date.now()}-${idx}`,
                    name: parts[0] || 'Habitación',
                    capacity: parseInt(parts[1]) || 2,
                    quantity: parseInt(parts[2]) || 1,
                    description: 'Importada desde hoja de cálculo'
                };
            });
        };

        // Helper to parse Restaurants (Name:Cuisine:Reserve)
        const parseRestaurants = (val: string): Restaurant[] => {
            if (!val) return [];
            return val.split('|').map((item, idx) => {
                const parts = item.split(':');
                return {
                    id: `rest-${Date.now()}-${idx}`,
                    name: parts[0] || 'Restaurante',
                    cuisineType: parts[1] || 'General',
                    requiresReservation: parseBool(parts[2]),
                    schedule: 'Consultar horario'
                };
            });
        };

        // Start from index 1 to skip headers
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Handle standard CSV splitting (respecting quotes would be better, but simple split for now)
            // Using a regex to split by comma but ignore commas inside quotes is better, but simple split matches typical Sheets export
            const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            // Clean quotes if present
            const clean = (s: string) => s ? s.replace(/^"|"$/g, '').trim() : '';

            if (cols.length < 5) continue;

            // Mapping based on the Headers defined in downloadCSVTemplate
            const amenities: HotelAmenities = {
                wifi: parseBool(cols[22]),
                pool: parseBool(cols[23]),
                spa: parseBool(cols[24]),
                gym: parseBool(cols[25]),
                ac: parseBool(cols[26]),
                roomService: parseBool(cols[27]),
                beach: parseBool(cols[28]),
                kidsClub: parseBool(cols[29]),
            };

            const extendedAmenities: ExtendedAmenities = {
                petFriendly: parseBool(cols[30]),
                accessibility: parseBool(cols[31]),
                eventsHall: parseBool(cols[32]),
                parking: parseBool(cols[33]),
                hotWater: parseBool(cols[34]),
                miniFridge: parseBool(cols[35]),
                safe: parseBool(cols[36]),
                nightShow: parseBool(cols[37]),
                extraActivities: parseBool(cols[38]),
                kidsPark: parseBool(cols[39]),
                kidsPool: parseBool(cols[40]),
                privateBeach: parseBool(cols[41]),
            };

            const newHotel: Hotel = {
                id: (clean(cols[0]) && clean(cols[0]) !== 'AUTO') ? clean(cols[0]) : crypto.randomUUID(),
                name: clean(cols[1]) || 'Nuevo Hotel Importado',
                location: clean(cols[2]) || 'Sin Ubicación',
                rating: parseFloat(clean(cols[3])) || 0,
                reviews: parseInt(clean(cols[4])) || 0,
                category: (clean(cols[5]) as any) || 'Confort',
                featured: parseBool(cols[6]),
                status: (clean(cols[7]) as any) || 'Activo',

                description: clean(cols[8]),
                latitude: clean(cols[9]),
                longitude: clean(cols[10]),
                highlights: parseList(clean(cols[11])),

                mainImage: clean(cols[12]),
                gallery: parseList(clean(cols[13])),

                mealPlan: clean(cols[14]),
                childPolicy: clean(cols[15]),
                bars: parseInt(clean(cols[16])) || 0,

                schedules: {
                    checkIn: clean(cols[17]) || '15:00',
                    checkOut: clean(cols[18]) || '12:00',
                    breakfastTime: clean(cols[19]),
                    lunchTime: clean(cols[20]),
                    dinnerTime: clean(cols[21])
                },

                amenities: amenities,
                extendedAmenities: extendedAmenities,
                roomTypes: parseRooms(clean(cols[42])),
                restaurants: parseRestaurants(clean(cols[43])),
                nearbyPlaces: []
            };
            hotels.push(newHotel);
        }
        return hotels;
    };

    const processCSVData = (content: string) => {
        setImportStatus('loading');
        setImportMessage('Analizando estructura del archivo...');

        try {
            // Small delay to allow UI to render 'loading'
            // Small delay to allow UI to render 'loading'
            setTimeout(async () => {
                const parsedHotels = parseCSV(content);
                if (parsedHotels.length > 0) {
                    try {
                        await importHotels(parsedHotels);
                        setImportStatus('success');
                        setImportMessage(`¡Proceso exitoso! Se han importado ${parsedHotels.length} hoteles correctamente.`);
                        // Auto-hide success message after 5 seconds
                        setTimeout(() => {
                            setImportStatus('idle');
                            setImportMessage('');
                        }, 5000);
                    } catch (e) {
                        console.error(e);
                        setImportStatus('error');
                        const errorMsg = e instanceof Error ? e.message : "Error desconocido";
                        setImportMessage(`Error al guardar: ${errorMsg}`);
                    }
                } else {
                    setImportStatus('error');
                    setImportMessage("No se encontraron registros válidos. Verifique que el archivo no esté vacío y siga la plantilla.");
                }
            }, 500);
        } catch (error) {
            console.error(error);
            setImportStatus('error');
            setImportMessage("Error crítico al procesar los datos. Verifique el formato CSV.");
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileReader = new FileReader();
        if (event.target.files && event.target.files[0]) {
            setImportStatus('loading');
            setImportMessage('Leyendo archivo...');

            const file = event.target.files[0];
            fileReader.readAsText(file, "UTF-8");

            fileReader.onload = (e) => {
                const content = e.target?.result as string;
                if (content) processCSVData(content);
            };

            fileReader.onerror = () => {
                setImportStatus('error');
                setImportMessage("Error de lectura del archivo.");
            };

            event.target.value = '';
        }
    };

    const handleImportFromUrl = async () => {
        if (!sheetUrl) return;

        setImportStatus('loading');
        setImportMessage('Conectando con Google Sheets...');

        let fetchUrl = sheetUrl;

        // Attempt to convert a standard Google Sheet edit link to a CSV export link
        if (sheetUrl.includes('docs.google.com/spreadsheets')) {
            // Extract ID
            const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (match && match[1]) {
                fetchUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
            }
        }

        try {
            console.log("Fetching CSV from:", fetchUrl);
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error(`Error ${response.status}: No se pudo descargar la hoja. Verifique permisos.`);
            const text = await response.text();

            // Basic validation
            if (!text || !text.includes(',')) {
                throw new Error("El archivo descargado no parece un CSV válido.");
            }

            processCSVData(text);
            setSheetUrl('');
        } catch (error: any) {
            console.error(error);
            setImportStatus('error');
            setImportMessage(error.message || "Error de conexión. Asegúrate de que el enlace sea público ('Cualquiera con el enlace').");
        }
    };

    const handleDeleteHotel = (id: string) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este hotel?')) deleteHotel(id);
    };

    const handleToggleFeatured = (id: string) => {
        const hotel = hotels.find(h => h.id === id);
        if (hotel) updateHotel(id, { ...hotel, featured: !hotel.featured });
    };

    const handleToggleStatus = (id: string) => {
        const hotel = hotels.find(h => h.id === id);
        if (hotel) updateHotel(id, { ...hotel, status: hotel.status === 'Activo' ? 'Inactivo' : 'Activo' });
    };

    // --- Slide Handlers ---
    const openSlideModal = (slide?: HeroSlide) => {
        if (slide) {
            setEditingSlide(slide);
        } else {
            setEditingSlide({
                id: crypto.randomUUID(),
                title: '',
                subtitle: '',
                promoTag: 'Novedad',
                tagColor: 'blue',
                imageUrl: '',
                ctaText: 'Ver Detalles',
                ctaLink: ''
            });
        }
        setIsSlideModalOpen(true);
    };

    const handleSaveSlide = () => {
        if (!editingSlide) return;
        const exists = slides.find(s => s.id === editingSlide.id);
        if (exists) {
            updateSlide(editingSlide);
        } else {
            addSlide(editingSlide);
        }
        setIsSlideModalOpen(false);
        setEditingSlide(null);
    };

    const handleDeleteSlide = (id: string) => {
        if (window.confirm('¿Eliminar slide?')) deleteSlide(id);
    };

    // --- News Handlers ---
    const handleCreateNews = () => {
        setIsEditingNews(true);
        setCurrentNewsItem({
            id: crypto.randomUUID(),
            category: 'General',
            tagColor: 'blue',
            title: '',
            content: '',
            relatedHotelId: '',
            destination: '',
            publishDate: new Date().toISOString().split('T')[0],
            expirationDate: '',
            isActive: true
        });
    };

    const handleEditNews = (item: NewsItem) => {
        setCurrentNewsItem(item);
        setIsEditingNews(true);
    };

    const handleSaveNews = () => {
        if (currentNewsItem) {
            const exists = news.find(n => n.id === currentNewsItem.id);
            if (exists) updateNews(currentNewsItem);
            else addNews(currentNewsItem);
            setIsEditingNews(false);
            setCurrentNewsItem(null);
        }
    };

    const handleDeleteNewsItem = (id: string) => {
        if (window.confirm("¿Eliminar noticia?")) deleteNews(id);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
            <aside className="w-64 flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 shrink-0 shadow-sm relative" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBfmNN85vOvZF0JuhNoYMDHOjan0wAZEkjuhEqdUf4_bNVshKHbyKvjLzkRabRSpFxXtXencmRNcl7OMS9WhQf9-7WXNJMdX2o_uFZfmiYF-HRQE52L-qx_ibtots1GIMennKIOwrPFngeC8_oQgkT03ccqtl7vcPTSdFHHB5K6405tl0_MIVOqYOwTMHQp-1IxRFS66bYAcBn4lIuNQvrwFm-TkMvbyA7MSSQ7xVhgkov2k52ZexyDC6G76uurFCHOnNqMxcFMd1KU")' }}></div>
                    <h1 className="text-slate-900 dark:text-white text-lg font-bold">DGD Admin</h1>
                </div>
                <nav className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2">
                    <button onClick={() => setActiveSection('hotels')} className={`flex items-center gap-3 px-3 py-3 rounded-lg w-full text-left transition-colors ${activeSection === 'hotels' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <span className="material-symbols-outlined">apartment</span>
                        <span className="text-sm font-semibold">Gestión de Hoteles</span>
                    </button>
                    <button onClick={() => setActiveSection('web')} className={`flex items-center gap-3 px-3 py-3 rounded-lg w-full text-left transition-colors ${activeSection === 'web' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <span className="material-symbols-outlined">web</span>
                        <span className="text-sm font-medium">Contenido Web</span>
                    </button>
                    <button onClick={() => setActiveSection('news')} className={`flex items-center gap-3 px-3 py-3 rounded-lg w-full text-left transition-colors ${activeSection === 'news' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <span className="material-symbols-outlined">newspaper</span>
                        <span className="text-sm font-medium">Noticias</span>
                    </button>
                    {authRole === 'admin' && (
                        <button onClick={() => navigate('/admin/users')} className={`flex items-center gap-3 px-3 py-3 rounded-lg w-full text-left transition-colors ${activeSection === 'users' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                            <span className="material-symbols-outlined">group</span>
                            <span className="text-sm font-medium">Usuarios</span>
                        </button>
                    )}
                    <Link to="/" className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mt-auto">
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span className="text-sm font-medium">Volver</span>
                    </Link>
                </nav>
            </aside>
            <main className="flex-1 flex flex-col h-full relative overflow-y-auto overflow-x-hidden">
                <header className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm px-8 py-4 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2 items-center">
                        <Link to="/" className="text-slate-500 hover:text-primary text-sm font-medium transition-colors">Inicio</Link>
                        <span className="text-slate-400 text-sm">/</span>
                        <span className="text-slate-900 dark:text-white text-sm font-medium">
                            {activeSection === 'hotels' ? 'Inventario' : activeSection === 'web' ? 'Home Editor' : 'Noticias'}
                        </span>
                    </div>
                </header>

                <div className="flex-1 px-8 py-4 flex flex-col gap-8 max-w-[1200px] mx-auto w-full pb-20">

                    {/* --- HOTELS VIEW --- */}
                    {activeSection === 'hotels' && (
                        <section className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Inventario de Hoteles</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">Administra la disponibilidad y carga masivamente desde Excel o Google Sheets.</p>
                                </div>
                                <div className="flex flex-wrap gap-3 items-center">
                                    <button onClick={() => navigate('/cms/add-hotel')} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95">
                                        <span className="material-symbols-outlined text-[20px]">add</span>
                                        <span className="text-sm font-bold hidden md:inline">Nuevo Hotel</span>
                                    </button>
                                </div>
                            </div>

                            {/* Import Tools Panel */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600">table_view</span>
                                    Carga Masiva (Google Sheets)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* CSV File Upload */}
                                    <div className="flex flex-col gap-3">
                                        <label className="text-xs text-gray-500 font-medium">Opción 1: Subir archivo CSV descargado</label>
                                        <div className="flex gap-2">
                                            <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={importStatus === 'loading'}
                                                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-lg transition-all border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-wait"
                                            >
                                                <span className="material-symbols-outlined">upload_file</span>
                                                <span className="text-sm font-bold">Subir CSV</span>
                                            </button>
                                            <button onClick={downloadCSVTemplate} className="flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2.5 rounded-lg transition-colors border border-green-200" title="Descargar Plantilla">
                                                <span className="material-symbols-outlined">download</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Google Sheet URL Import */}
                                    <div className="flex flex-col gap-3">
                                        <label className="text-xs text-gray-500 font-medium">Opción 2: Importar desde Enlace (Google Sheets)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={sheetUrl}
                                                onChange={(e) => setSheetUrl(e.target.value)}
                                                placeholder="Pega el enlace de Google Sheets aquí..."
                                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary outline-none"
                                            />
                                            <button
                                                onClick={handleImportFromUrl}
                                                disabled={importStatus === 'loading' || !sheetUrl}
                                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
                                            >
                                                {importStatus === 'loading' ? <span className="animate-spin material-symbols-outlined text-sm">refresh</span> : <span className="material-symbols-outlined text-sm">sync</span>}
                                                Sincronizar
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-400">Funciona con enlaces públicos o 'Publicar en la web'.</p>
                                    </div>
                                </div>

                                {/* Import Status Feedback Banner */}
                                {importStatus !== 'idle' && (
                                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-1 ${importStatus === 'loading' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                        importStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            'bg-red-50 text-red-700 border border-red-100'
                                        }`}>
                                        {importStatus === 'loading' && <span className="animate-spin material-symbols-outlined text-xl">progress_activity</span>}
                                        {importStatus === 'success' && <span className="material-symbols-outlined text-xl">check_circle</span>}
                                        {importStatus === 'error' && <span className="material-symbols-outlined text-xl">error</span>}
                                        <p className="font-medium">{importMessage}</p>
                                    </div>
                                )}
                            </div>

                            {/* Search Bar */}
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre de hotel, ID o ubicación..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all"
                                />
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">ID</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hotel</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-24">Destacado</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32">Estado</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-40">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                            {filteredHotels.length > 0 ? filteredHotels.map(hotel => (
                                                <tr key={hotel.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">#{hotel.id.substring(0, 6)}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-10 rounded-lg bg-slate-200 bg-cover bg-center shrink-0" style={{ backgroundImage: `url("${hotel.mainImage}")` }}></div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{hotel.name}</p>
                                                                <p className="text-xs text-slate-500">{hotel.location}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button onClick={() => handleToggleFeatured(hotel.id)} className="p-1 rounded-full hover:bg-yellow-50 transition-colors group/star">
                                                            <span className={`material-symbols-outlined text-[24px] ${hotel.featured ? 'text-yellow-400 fill' : 'text-slate-300'}`}>star</span>
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button onClick={() => handleToggleStatus(hotel.id)} className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${hotel.status === 'Activo' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                            {hotel.status}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => navigate(`/cms/edit-hotel/${hotel.id}`)} className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                                                            <button onClick={() => handleDeleteHotel(hotel.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                                                        No se encontraron hoteles con tu búsqueda.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* --- WEB CONTENT VIEW (SLIDER EDITOR) --- */}
                    {activeSection === 'web' && (
                        <section className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div><h2 className="text-slate-900 dark:text-white text-3xl font-black">Editor de Carrusel</h2></div>
                                <button onClick={() => openSlideModal()} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg"><span className="material-symbols-outlined">add</span> Nuevo Slide</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {slides.map(s => (
                                    <div key={s.id} className="relative group border rounded-xl overflow-hidden shadow-sm h-64">
                                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${s.imageUrl})` }}></div>
                                        <div className="absolute inset-0 bg-black/50 p-6 flex flex-col justify-end text-white">
                                            <span className={`text-xs font-bold px-2 py-1 rounded w-fit mb-2 ${colors.find(c => c.value === s.tagColor)?.class || 'bg-blue-100 text-blue-700'}`}>{s.promoTag}</span>
                                            <h3 className="font-bold text-xl">{s.title}</h3>
                                            <p className="text-sm opacity-90">{s.subtitle}</p>
                                        </div>
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openSlideModal(s)} className="bg-white text-gray-800 p-2 rounded-full shadow"><span className="material-symbols-outlined">edit</span></button>
                                            <button onClick={() => handleDeleteSlide(s.id)} className="bg-white text-red-500 p-2 rounded-full shadow"><span className="material-symbols-outlined">delete</span></button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Slide Modal */}
                            {isSlideModalOpen && editingSlide && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 flex flex-col gap-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Editar Slide del Carrusel</h3>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Título Principal</label>
                                            <input
                                                value={editingSlide.title}
                                                onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })}
                                                className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-slate-900 dark:text-white"
                                                placeholder="Ej: Descubre el Encanto de Cartagena"
                                            />
                                            <p className="text-xs text-slate-500">Texto grande que aparece como encabezado del banner.</p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subtítulo</label>
                                            <input
                                                value={editingSlide.subtitle}
                                                onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                                                className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-slate-900 dark:text-white"
                                                placeholder="Ej: Tarifas exclusivas para grupos..."
                                            />
                                            <p className="text-xs text-slate-500">Descripción breve debajo del título.</p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Etiqueta Promocional</label>
                                            <div className="flex gap-2">
                                                <input
                                                    value={editingSlide.promoTag}
                                                    onChange={e => setEditingSlide({ ...editingSlide, promoTag: e.target.value })}
                                                    className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg flex-1 text-slate-900 dark:text-white"
                                                    placeholder="Ej: Hotel Destacado"
                                                />
                                                <select
                                                    value={editingSlide.tagColor}
                                                    onChange={e => setEditingSlide({ ...editingSlide, tagColor: e.target.value })}
                                                    className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg w-32 text-slate-900 dark:text-white"
                                                >
                                                    {colors.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <p className="text-xs text-slate-500">Pequeña insignia que aparece sobre el título (Ej: 'Novedad').</p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Imagen de Fondo</label>
                                            <input
                                                value={editingSlide.imageUrl}
                                                onChange={e => setEditingSlide({ ...editingSlide, imageUrl: e.target.value })}
                                                className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-slate-900 dark:text-white"
                                                placeholder="https://..."
                                            />
                                            <p className="text-xs text-slate-500">URL de la imagen de alta calidad para el fondo del slide.</p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Botón de Acción (CTA)</label>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <input
                                                        value={editingSlide.ctaText}
                                                        onChange={e => setEditingSlide({ ...editingSlide, ctaText: e.target.value })}
                                                        className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-slate-900 dark:text-white"
                                                        placeholder="Texto (Ej: Ver Oferta)"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        value={editingSlide.ctaLink}
                                                        onChange={e => setEditingSlide({ ...editingSlide, ctaLink: e.target.value })}
                                                        className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 rounded-lg text-slate-900 dark:text-white"
                                                        placeholder="Ruta (Ej: /hotel/123)"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500">Texto del botón y la ruta interna o enlace a donde dirige.</p>
                                        </div>

                                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                            <button onClick={() => setIsSlideModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancelar</button>
                                            <button onClick={handleSaveSlide} className="px-4 py-2 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary/90">Guardar Slide</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* --- NEWS VIEW --- */}
                    {activeSection === 'news' && !isEditingNews && (
                        <section className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Noticias y Actualizaciones</h2>
                                </div>
                                <button onClick={handleCreateNews} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg">
                                    <span className="material-symbols-outlined">add_circle</span> <span className="font-bold">Nueva Noticia</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {news.map(n => (
                                    <div key={n.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colors.find(c => c.value === n.tagColor)?.class}`}>{n.category}</span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditNews(n)} className="p-1 hover:text-primary"><span className="material-symbols-outlined text-sm">edit</span></button>
                                                <button onClick={() => handleDeleteNewsItem(n.id)} className="p-1 hover:text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">{n.title}</h3>
                                        <p className="text-sm text-gray-500 mb-4 line-clamp-3">{n.content}</p>
                                        <div className="text-xs text-gray-400 border-t pt-2">
                                            <p>Expira: {n.expirationDate}</p>
                                            {n.relatedHotelId && <p className="text-primary mt-1">Vinculado a: {hotels.find(h => h.id === n.relatedHotelId)?.name}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                    {activeSection === 'news' && isEditingNews && currentNewsItem && (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border shadow-sm max-w-3xl mx-auto flex flex-col gap-6">
                            <h2 className="text-2xl font-bold border-b pb-4">Editar Noticia</h2>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-600">Título</label>
                                <input value={currentNewsItem.title} onChange={e => setCurrentNewsItem({ ...currentNewsItem, title: e.target.value })} className="w-full border p-3 rounded-lg" placeholder="Ej: Cierre de Piscina" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-600">Contenido</label>
                                <textarea rows={4} value={currentNewsItem.content} onChange={e => setCurrentNewsItem({ ...currentNewsItem, content: e.target.value })} className="w-full border p-3 rounded-lg" placeholder="Detalles de la noticia..." />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-600">Etiqueta</label>
                                    <div className="flex gap-2">
                                        <input value={currentNewsItem.category} onChange={e => setCurrentNewsItem({ ...currentNewsItem, category: e.target.value })} className="border p-3 rounded-lg flex-1" placeholder="Ej: Mantenimiento" />
                                        <select value={currentNewsItem.tagColor} onChange={e => setCurrentNewsItem({ ...currentNewsItem, tagColor: e.target.value })} className="border p-3 rounded-lg w-32">
                                            {colors.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-600">Vincular a Hotel (Opcional)</label>
                                    <select value={currentNewsItem.relatedHotelId} onChange={e => setCurrentNewsItem({ ...currentNewsItem, relatedHotelId: e.target.value, destination: hotels.find(h => h.id === e.target.value)?.location || '' })} className="border p-3 rounded-lg">
                                        <option value="">-- General / Ninguno --</option>
                                        {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-600">Fecha Publicación</label>
                                    <input type="date" value={currentNewsItem.publishDate} onChange={e => setCurrentNewsItem({ ...currentNewsItem, publishDate: e.target.value })} className="border p-3 rounded-lg" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-600">Fecha Vencimiento</label>
                                    <input type="date" value={currentNewsItem.expirationDate} onChange={e => setCurrentNewsItem({ ...currentNewsItem, expirationDate: e.target.value })} className="border p-3 rounded-lg" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                                <button onClick={() => setIsEditingNews(false)} className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button onClick={handleSaveNews} className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg shadow hover:bg-primary/90">Guardar Noticia</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CMSPage;