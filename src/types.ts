export interface HotelAmenities {
    // Basic filtering amenities
    wifi: boolean;
    pool: boolean;
    spa: boolean;
    gym: boolean;
    ac: boolean;
    roomService: boolean;
    beach: boolean;
    kidsClub: boolean;
}

export interface ExtendedAmenities {
    petFriendly: boolean;
    accessibility: boolean;
    eventsHall: boolean;
    parking: boolean;
    hotWater: boolean;
    miniFridge: boolean;
    safe: boolean;
    nightShow: boolean;
    extraActivities: boolean;
    kidsPark: boolean;
    kidsPool: boolean;
    privateBeach: boolean;
}

export interface RoomType {
    id: string;
    name: string; // "Estándar", "Suite", etc.
    description: string;
    capacity: number;
    quantity: number;
}

export interface Restaurant {
    id: string;
    name: string;
    cuisineType: string;
    requiresReservation: boolean;
    schedule: string;
}

export interface HotelSchedules {
    checkIn: string;
    checkOut: string;
    breakfastTime: string;
    lunchTime: string;
    dinnerTime: string;
}

export interface NearbyPlace {
    id: string;
    name: string;
    type: 'attraction' | 'activity' | 'dining';
    distance: string; // Ej: "5 min a pie", "2 km"
    note?: string; // Ej: "Preguntar en recepción"
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  // price removed as requested
  category: 'Elite' | 'Confort' | 'Esencial';
  featured: boolean;
  status: 'Activo' | 'Inactivo';
  
  // Detalle extendido
  description: string;
  latitude: string;
  longitude: string;
  highlights: string[]; 
  
  // Imágenes
  mainImage: string;
  gallery: string[]; 
  
  // Estructuras complejas
  amenities: HotelAmenities;
  extendedAmenities: ExtendedAmenities;
  roomTypes: RoomType[];
  restaurants: Restaurant[];
  bars: number;
  schedules: HotelSchedules;
  nearbyPlaces: NearbyPlace[]; // New AI suggestions field
  
  // Políticas
  mealPlan: string; // "Desayuno y cena", "Todo incluido", etc.
  childPolicy: string; // Edades y reglas
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface HeroSlide {
    id: string;
    title: string;
    subtitle: string;
    promoTag: string;
    tagColor: string; 
    imageUrl: string;
    ctaText: string;
    ctaLink: string;
}

export interface NewsItem {
    id: string;
    category: string; 
    tagColor: string; 
    title: string;
    content: string;
    relatedHotelId: string; 
    destination: string;
    publishDate: string;
    expirationDate: string;
    isActive: boolean;
}