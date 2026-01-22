import { supabase } from '../supabaseClient';
import { NewsItem } from '../types';

export const newsService = {
    async fetchNews() {
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('publish_date', { ascending: false });

        if (error) {
            console.error('Error fetching news:', error);
            throw error;
        }

        // Map snake_case from DB to camelCase for App
        return (data || []).map(item => ({
            id: item.id,
            category: item.category,
            tagColor: item.tag_color,
            title: item.title,
            content: item.content,
            relatedHotelId: item.related_hotel_id,
            destination: item.destination,
            publishDate: item.publish_date,
            expirationDate: item.expiration_date,
            isActive: item.is_active
        }));
    },

    async upsertNews(newsItem: Partial<NewsItem>) {
        // Map camelCase from App to snake_case for DB
        // Helper to convert empty strings to null
        const toNullIfEmpty = (val: string | undefined) => (!val || val.trim() === '') ? null : val;

        const dbPayload = {
            id: newsItem.id,
            category: newsItem.category,
            tag_color: newsItem.tagColor,
            title: newsItem.title,
            content: newsItem.content,
            related_hotel_id: toNullIfEmpty(newsItem.relatedHotelId),
            destination: newsItem.destination,
            publish_date: toNullIfEmpty(newsItem.publishDate),
            expiration_date: toNullIfEmpty(newsItem.expirationDate),
            is_active: newsItem.isActive
        };

        const { data, error } = await supabase
            .from('news')
            .upsert(dbPayload)
            .select()
            .single();

        if (error) {
            console.error('Error saving news:', error);
            throw error;
        }

        // Map back to camelCase
        return {
            id: data.id,
            category: data.category,
            tagColor: data.tag_color,
            title: data.title,
            content: data.content,
            relatedHotelId: data.related_hotel_id,
            destination: data.destination,
            publishDate: data.publish_date,
            expirationDate: data.expiration_date,
            isActive: data.is_active
        };
    },

    async deleteNews(id: string) {
        const { error } = await supabase
            .from('news')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting news:', error);
            throw error;
        }
    }
};
