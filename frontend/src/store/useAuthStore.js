import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5001/api"
  : "https://chatty-fufg.onrender.com/api";

const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // Admin-specific state
  adminUsers: [],
  adminLoading: false,
  adminError: null,
  adminPage: 1,
  adminLimit: 20,
  adminTotal: 0,

  /* ---------- Auth actions (unchanged) ---------- */
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Signup failed";
      toast.error(msg);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Login failed";
      toast.error(msg);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Logout failed";
      toast.error(msg);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      const msg = error?.response?.data?.message || error?.message || "Update failed";
      toast.error(msg);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

  /* ---------- Admin API actions ---------- */

  // Fetch paginated users (server should support ?page=&limit=&q=)
  fetchAdminUsers: async ({ page = 1, limit = 20, q = "" } = {}) => {
    set({ adminLoading: true, adminError: null });
    try {
      const res = await axiosInstance.get("/admin/users", {
        params: { page, limit, q },
      });
      // Adapt depending on server response shape:
      // if server returns { users, total, page, limit } use that
      if (res?.data?.users) {
        set({
          adminUsers: res.data.users,
          adminTotal: res.data.total || 0,
          adminPage: res.data.page || page,
          adminLimit: res.data.limit || limit,
        });
      } else {
        // fallback: assume res.data is an array
        set({ adminUsers: Array.isArray(res.data) ? res.data : [], adminTotal: Array.isArray(res.data) ? res.data.length : 0 });
      }
    } catch (error) {
      console.error("fetchAdminUsers error:", error);
      const msg = error?.response?.data?.error || error?.message || "Failed to fetch users";
      set({ adminError: msg });
      toast.error(msg);
    } finally {
      set({ adminLoading: false });
    }
  },

  // Get a single user
  getAdminUser: async (id) => {
    set({ adminLoading: true, adminError: null });
    try {
      const res = await axiosInstance.get(`/admin/users/${id}`);
      return res.data; // caller can use returned user
    } catch (error) {
      console.error("getAdminUser error:", error);
      const msg = error?.response?.data?.error || error?.message || "Failed to fetch user";
      set({ adminError: msg });
      toast.error(msg);
      throw error;
    } finally {
      set({ adminLoading: false });
    }
  },

  // Create user (payload is JSON: { email, fullName, password, role })
  createAdminUser: async (payload) => {
    set({ adminLoading: true, adminError: null });
    try {
      const res = await axiosInstance.post("/admin/users", payload);
      // optimistic update: append new user to adminUsers
      set((state) => ({ adminUsers: [res.data, ...state.adminUsers] }));
      toast.success("User created");
      return res.data;
    } catch (error) {
      console.error("createAdminUser error:", error);
      const msg = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Create failed";
      set({ adminError: msg });
      toast.error(msg);
      throw error;
    } finally {
      set({ adminLoading: false });
    }
  },

  // Update user (payload partial)
  updateAdminUser: async (id, payload) => {
    set({ adminLoading: true, adminError: null });
    try {
      const res = await axiosInstance.put(`/admin/users/${id}`, payload);
      // update local list if present
      set((state) => ({
        adminUsers: state.adminUsers.map((u) => (u._id === id ? res.data : u)),
      }));
      toast.success("User updated");
      return res.data;
    } catch (error) {
      console.error("updateAdminUser error:", error);
      const msg = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Update failed";
      set({ adminError: msg });
      toast.error(msg);
      throw error;
    } finally {
      set({ adminLoading: false });
    }
  },

  // Delete user
  deleteAdminUser: async (id) => {
    set({ adminLoading: true, adminError: null });
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      // optimistic remove
      set((state) => ({ adminUsers: state.adminUsers.filter((u) => u._id !== id) }));
      toast.success("User deleted");
    } catch (error) {
      console.error("deleteAdminUser error:", error);
      const msg = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Delete failed";
      set({ adminError: msg });
      toast.error(msg);
      throw error;
    } finally {
      set({ adminLoading: false });
    }
  },
}));

export default useAuthStore;