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

        return data || [];
    },

    async upsertNews(newsItem: Partial<NewsItem>) {
        const { data, error } = await supabase
            .from('news')
            .upsert(newsItem)
            .select()
            .single();

        if (error) {
            console.error('Error saving news:', error);
            throw error;
        }

        return data;
    }
};
