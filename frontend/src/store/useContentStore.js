import { create } from "zustand";
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

const useContentStore = create((set) => ({
    content: [],
    setContent: (content) => set({content}),
    fetchContent: async () => {
        try {
            const response = await axiosInstance.get(`/api/content`);
            set({content: response.data});
        } catch (error) {
            console.error('Error fetching content:', error);
        }
    },
    createContent: async (content) => {
        try {
            const response = await axiosInstance.post('/api/content', content);
            set({content: response.data});
        } catch (error) {
            console.error('Error creating content:', error);
        }
    },
    updateContent: async (id, content) => {
        try {
            const response = await axiosInstance.put(`/api/content/${id}`, content);
            set({content: response.data});
            } catch (error) {
            console.error('Error updating content:', error);
        }
    },
    deleteContent: async (id) => {
        try {
            const response = await axiosInstance.delete(`/api/content/${id}`);
            set({content: response.data});
        } catch (error) {
            console.error('Error deleting content:', error);
        }
    },
    getContentById: async (id) => {
        try {
            const response = await axiosInstance.get(`/api/content/${id}`);
            set({content: response.data});
        } catch (error) {
            console.error('Error getting content by id:', error);
        }
    },
   
}))

export default useContentStore;