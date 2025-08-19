"use client";
import { create } from "zustand";
import axios from "axios";
import { persist, createJSONStorage } from "zustand/middleware";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      // Setters
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      // Sign Up
      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/api/auth/signup", userData);
          if (response.data.success) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
            });
          }
          set({ isLoading: false });
          return response.data; // Return response for component handling
        } catch (error) {
          set({
            error: error.response?.data?.message || "Signup failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // Sign In
      signin: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/api/auth/signin", userData);
          if (response.data.success) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
            });
          }
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Signin failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/api/auth/logout");
          if (response.data.success) {
            set({ user: null, token: null, isAuthenticated: false });
          }
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Logout failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // Verify Email
      verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.get(`/api/auth/verify-email/${code}`);
          if (response.data.success) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
            });
          }
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Email verification failed",
            isLoading: false,
          });
          throw error;
        }
      },

      // Forget Password
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/api/auth/forget-password", { email });
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Password reset request failed",
            isLoading: false,
          });
          throw error;
        }
      },

      resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post(`/api/auth/reset-password/${token}`, { password });
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Password reset failed",
            isLoading: false,
          });
          throw error;
        }
      },
      // Get User
      getUser: async () => {
        const response = await axiosInstance.get("/api/auth/me");
        return response.data;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;