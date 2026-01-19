import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Hotel, NewsItem, HeroSlide } from '../types';
import { hotelService } from '../services/hotelService';
import { newsService } from '../services/newsService';

// Datos iniciales eliminados. Se cargan desde Supabase.

const INITIAL_SLIDES: HeroSlide[] = [
    {
        id: '1',
        title: 'Descubre el Encanto de Cartagena',
        subtitle: 'Tarifas exclusivas para grupos en temporada baja en el Hotel Cartagena Plaza.',
        promoTag: 'Hotel Destacado',
        tagColor: 'blue',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhBe1oST7IgUjUW-KMmmvqKa2zNQulkdTX6meW_cVdwyMpuuhy3TTqnDc47mBcaoTUNY7zkUsWP65yzgPjBao6thtNIrp4YUtsBJ6uyhdacOdE0A3PGuO6yJVQzlBLjoEKpcJh7DGbnlLjw7F05TcrAB1llmCNUwOimQjJkkJGbIkBdGxgQuojdMtfbBi9BlfXkMu8MJsqs_DSEKXYT7QRcukwiEOkNPaIBvd5K3vRbEid2mCYDI5sX1SyXYlYdBAZbn-5MEU89IRG',
        ctaText: 'Ver Promoción',
        ctaLink: '/hotel-profile/CTG-001'
    }
];

interface HotelContextType {
    hotels: Hotel[];
    news: NewsItem[];
    slides: HeroSlide[];
    getHotel: (id: string) => Hotel | undefined;
    addHotel: (hotel: Hotel) => void;
    updateHotel: (id: string, hotel: Hotel) => void;
    deleteHotel: (id: string) => void;
    importHotels: (newHotels: Hotel[]) => void;
    addNews: (item: NewsItem) => void;
    updateNews: (item: NewsItem) => void;
    deleteNews: (id: string) => void;
    addSlide: (slide: HeroSlide) => void;
    updateSlide: (slide: HeroSlide) => void;
    deleteSlide: (id: string) => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [slides, setSlides] = useState<HeroSlide[]>(INITIAL_SLIDES);

    useEffect(() => {
        const loadData = async () => {
            // Carga inicial desde Supabase
            try {
                const [fetchedHotels, fetchedNews] = await Promise.all([
                    hotelService.fetchHotels(),
                    newsService.fetchNews()
                ]);
                setHotels(fetchedHotels);
                setNews(fetchedNews);
            } catch (error) {
                console.error("Error cargando datos iniciales:", error);
            }
        };
        loadData();
    }, []);

    const getHotel = (id: string) => hotels.find(h => h.id === id);

    const addHotel = async (hotel: Hotel) => {
        try {
            const saved = await hotelService.upsertHotel(hotel);
            setHotels(prev => [...prev, saved]);
        } catch (e) {
            console.error("Error adding hotel", e);
        }
    };

    const updateHotel = async (id: string, updatedHotel: Hotel) => {
        try {
            const saved = await hotelService.upsertHotel(updatedHotel);
            setHotels(prev => prev.map(h => h.id === id ? saved : h));
        } catch (e) {
            console.error("Error updating hotel", e);
        }
    };

    const deleteHotel = (id: string) => {
        // TODO: Implementar delete en backend
        setHotels(prev => prev.filter(h => h.id !== id));
    };

    const importHotels = async (newHotels: Hotel[]) => {
        // Importación simple: guardar cada uno
        for (const h of newHotels) {
            await addHotel(h);
        }
    };

    const addNews = async (item: NewsItem) => {
        try {
            const saved = await newsService.upsertNews(item);
            setNews(prev => [saved, ...prev]);
        } catch (e) { console.error(e); }
    };
    const updateNews = async (item: NewsItem) => {
        try {
            const saved = await newsService.upsertNews(item);
            setNews(prev => prev.map(n => n.id === item.id ? saved : n));
        } catch (e) { console.error(e); }
    };
    const deleteNews = (id: string) => setNews(prev => prev.filter(n => n.id !== id));

    const addSlide = (slide: HeroSlide) => setSlides(prev => [...prev, slide]);
    const updateSlide = (slide: HeroSlide) => setSlides(prev => prev.map(s => s.id === slide.id ? slide : s));
    const deleteSlide = (id: string) => setSlides(prev => prev.filter(s => s.id !== id));

    return (
        <HotelContext.Provider value={{
            hotels, getHotel, addHotel, updateHotel, deleteHotel, importHotels,
            news, addNews, updateNews, deleteNews,
            slides, addSlide, updateSlide, deleteSlide
        }}>
            {children}
        </HotelContext.Provider>
    );
};

export const useHotelContext = () => {
    const context = useContext(HotelContext);
    if (!context) {
        throw new Error('useHotelContext must be used within a HotelProvider');
    }
    return context;
};