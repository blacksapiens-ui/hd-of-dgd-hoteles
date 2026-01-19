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

        return data || [];
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

        return data;
    },

    async upsertHotel(hotel: Partial<Hotel>) {
        console.log("Saving hotel...", hotel);
        // Filtrar campos undefined para evitar errores, pero mantener nulls si es intencional
        // Supabase ignora campos que no están en la tabla si se usa spread, pero mejor ser explícitos o limpiar el objeto
        const { data, error } = await supabase
            .from('hotels')
            .upsert(hotel)
            .select()
            .single();

        if (error) {
            console.error('Error saving hotel:', error);
            throw error;
        }

        console.log("Hotel saved successfully:", data);
        return data;
    }
};
