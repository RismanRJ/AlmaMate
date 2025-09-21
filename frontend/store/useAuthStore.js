import { create } from "zustand";
import { axiosInstance } from "../src/lib/axios";
import { io } from "socket.io-client";
import { useEffect } from "react";
const BASE_URL = "http://localhost:3500";
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSignUp: false,
  isLogin: false,
  isCheckingAuth: true,
  searchUserProfile: null,
  isSearching: false,
  connections: [],
  getConnections: null,
  onlineUsers: [],
  socket: null,
  updateUser: null,

  updateUser: (user) => {
    set({
      authUser: user,
    });
  },
  //checking auth for user logged in or not
  checkAuth: async () => {
    try {
      const googleAuth = await axiosInstance.get("/auth/google/checkAuth");
      const jwtAuth = await axiosInstance.get("/auth/checkAuthState");

      if (!googleAuth.data.status && !jwtAuth.data.status)
        set({
          authUser: null,
        });
      else if (!googleAuth.data.status && jwtAuth.data.status)
        set({
          authUser: jwtAuth.data.user,
        });
      else {
        const res = await axiosInstance.get("/auth/login/google/success");
        console.log(res.data);

        set({
          authUser: googleAuth.data.user,
        });
      }
      console.log("connected");

      get().connectSocket();
      return get().authUser;
    } catch (error) {
      console.log(error.message);
    } finally {
      set({
        isCheckingAuth: false,
      });
    }
  },

  signup: async (formData) => {
    const res = await axiosInstance.post("/auth/register", formData);
    if (res.data.user) {
      set({
        authUser: res.data.user,
      });
    }
    return res.data.user;
  },

  googleSignUp: async () => {
    window.location.href = "http://localhost:3500/almaHub/auth/login/google";
    const res = await axiosInstance.get("/auth/login/google/success");

    if (res.data.user) {
      set({
        authUser: res.data.user,
      });
    }
    get().connectSocket();
  },

  login: async (formData) => {
    const res = await axiosInstance.post("/auth/login", formData);
    if (res.data.user) {
      set({
        authUser: res.data.user,
      });
    }
    get().connectSocket();
    return res.data;
  },

  logout: async (authType) => {
    if (authType === "local") {
      const res = await axiosInstance.get("/auth/logout");
      console.log(res.data);

      if (res.data.status) {
        set({
          authUser: null,
        });
      }
      get().disConnectSocket();
      return true;
    } else if (authType === "google") {
      const res = await axiosInstance.get("/auth/google/logout");
      console.log(res.data);

      if (res.data.status) {
        set({
          authUser: null,
        });
      }
      get().disConnectSocket();
      return true;
    }
    return false;
  },

  getUserProfile: async (id) => {
    try {
      set({
        isSearching: true,
      });
      const res = await axiosInstance.get(`/auth/profile/${id}`);

      set({
        searchUserProfile: res.data.user,
      });
      return res.data.user;
    } catch (error) {
      console.log(error.message);
    } finally {
      set({
        isSearching: false,
      });
    }
  },

  getConnections: async (userId) => {
    try {
      const res = await axiosInstance.get(`/auth/connections/${userId}`);

      set({
        connections: res.data.user,
      });
      console.log(res.data);

      return res.data.user;
    } catch (error) {
      console.log(error);
    }
  },

  clearProfile: () => {
    set({
      searchUserProfile: null,
    });
  },

  connectSocket: () => {
    try {
      const { authUser } = get();
      if (!authUser || get().socket?.connected) return;

      const socket = io(BASE_URL, {
        query: {
          userId: authUser._id,
        },
      });

      socket.connect();
      socket.on("connect", () => {
        console.log("Socket connected successfully:", socket.id);
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });

      set({ socket: socket });

      socket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  disConnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
