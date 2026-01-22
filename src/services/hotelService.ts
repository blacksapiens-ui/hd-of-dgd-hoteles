import { supabase } from '../supabaseClient';
import { Hotel } from '../types';

export const hotelService = {
    async fetchHotels() {
        const { data, error } = await supabase
            .from('hotels')
            .select('*');

        if (error) {
            console.error('Error fetching hotels:', error);
            throw error;
        }

        return (data || []).map(mapFromDb);
    },

    async getHotelById(id: string) {
        const { data, error } = await supabase
            .from('hotels')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching hotel ${id}:`, error);
            throw error;
        }

        return mapFromDb(data);
    },

    async upsertHotel(hotel: Partial<Hotel>) {
        console.log("Saving hotel...", hotel);
        // Map to snake_case for Supabase
        const dbHotel = mapToDb(hotel);

        const { data, error } = await supabase
            .from('hotels')
            .upsert(dbHotel)
            .select()
            .single();

        if (error) {
            console.error('Error saving hotel:', error);
            // Re-lanzar el error con más información si es posible, o el objeto error original
            throw new Error(`Error al guardar: ${error.message} (Code: ${error.code})`);
        }

        console.log("Hotel saved successfully:", data);
        return mapFromDb(data);
    },

    async deleteHotel(id: string) {
        const { error } = await supabase
            .from('hotels')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting hotel:', error);
            throw error;
        }
    }
};

// Helper functions for mapping
const mapToDb = (hotel: Partial<Hotel>) => {
    // Basic spread to get all matching fields
    const {
        mainImage, mealPlan, childPolicy, roomTypes, nearbyPlaces, extendedAmenities,
        ...rest
    } = hotel;

    return {
        ...rest,
        // Map camelCase to snake_case
        main_image: mainImage,
        meal_plan: mealPlan,
        child_policy: childPolicy,
        room_types: roomTypes,
        nearby_places: nearbyPlaces,
        extended_amenities: extendedAmenities
    };
};

const mapFromDb = (dbHotel: any): Hotel => {
    // Destructure snake_case fields
    const {
        main_image, meal_plan, child_policy, room_types, nearby_places, extended_amenities,
        ...rest
    } = dbHotel;

    return {
        ...rest,
        // Map snake_case to camelCase
        mainImage: main_image,
        mealPlan: meal_plan,
        childPolicy: child_policy,
        roomTypes: room_types || [],
        nearbyPlaces: nearby_places || [],
        extendedAmenities: extended_amenities || {},
        // Ensure arrays and objects are initialized if null
        gallery: rest.gallery || [],
        amenities: rest.amenities || {},
        restaurants: rest.restaurants || [],
        schedules: rest.schedules || { checkIn: '', checkOut: '', breakfastTime: '', lunchTime: '', dinnerTime: '' }
    };
};
