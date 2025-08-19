import { create } from "zustand";
import axios from "axios";
import pythonApi from "@/lib/pythonApi";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

const useAssessmentStore = create((set, get) => ({
    assessment: [],
    isLoading: false,
    error: null,
    selectedAssessment: null,
    
    setAssessment: (assessment) => set({ assessment }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    
    fetchAssessment: async () => {
        set({ isLoading: true, error: null });    
        try {
            const response = await axiosInstance.get(`/api/assessment`);
            set({ assessment: response.data, isLoading: false });
        } catch (error) {
            console.error('Error fetching assessment:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    generateAssessment: async (assessmentData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await pythonApi.generateAssessment(assessmentData);
            set({ isLoading: false });
            return response;
        } catch (error) {
            console.error('Error generating assessment:', error);
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    createAssessment: async (assessmentData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post('/api/assessment', assessmentData);
            const newAssessment = response.data;
            set((state) => ({ 
                assessment: [...state.assessment, newAssessment], 
                isLoading: false 
            }));
            return newAssessment;
        } catch (error) {
            console.error('Error creating assessment:', error);
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },
    
    // updateAssessment: async (id, assessmentData) => {
    //     set({ isLoading: true, error: null });
    //     try {
    //         const response = await axiosInstance.put(`/api/assessment/${id}`, assessmentData);
    //         const updatedAssessment = response.data;
    //         set((state) => ({
    //             assessment: state.assessment.map(item => 
    //                 item._id === id ? updatedAssessment : item
    //             ),
    //             isLoading: false
    //         }));
    //         return updatedAssessment;
    //     } catch (error) {
    //         console.error('Error updating assessment:', error);
    //         set({ error: error.message, isLoading: false });
    //         throw error;
    //     }
    // },
    
    deleteAssessment: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/api/assessment/${id}`);
            set((state) => ({
                assessment: state.assessment.filter(item => item._id !== id),
                isLoading: false
            }));
        } catch (error) {
            console.error('Error deleting assessment:', error);
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },
    
    getAssessmentById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/api/assessment/${id}`);
            const assessment = response.data;
            set({ selectedAssessment: assessment, isLoading: false });
            return assessment;
        } catch (error) {
            console.error('Error getting assessment by id:', error);
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },
    
    clearError: () => set({ error: null }),
    clearSelectedAssessment: () => set({ selectedAssessment: null }),
}));

export default useAssessmentStore;