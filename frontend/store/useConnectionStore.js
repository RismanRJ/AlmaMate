import { create } from "zustand";
import { axiosInstance } from "../src/lib/axios";

export const useConnectionStore = create((set) => ({
  connections: [],
  isSendingConnection: false,
  isAcceptingConnection: false,
  isRejectingConnection: false,
  isGettingConnections: false,
  isCheckingConnectionStatus: false,

  checkConnectionStatus: async (userId, targetUserId) => {
    set({ isCheckingConnectionStatus: true });
    try {
      const res = await axiosInstance.post("/connect/status", {
        userId: userId,
        targetUserId: targetUserId,
      });
      return res.data;
    } catch (error) {
      console.log(error.message);
    } finally {
      set({ isCheckingConnectionStatus: false });
    }
  },

  sendConnection: async (userId, targetUserId) => {
    set({ isSendingConnection: true });
    try {
      const res = await axiosInstance.post("/connect", {
        userId,
        targetUserId,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.log(error);
    } finally {
      set({ isSendingConnection: false });
    }
  },

  acceptConnection: async (userId, targetUserId) => {
    set({ isAcceptingConnection: true });
    try {
      const res = await axiosInstance.post("/connect/accept", {
        userId: userId,
        targetUserId: targetUserId,
      });
      return res.data.status;
    } catch (error) {
      console.log(error);
    } finally {
      set({ isAcceptingConnection: false });
    }
  },

  rejectConnection: async (userId, targetUserId) => {
    set({ isRejectingConnection: true });
    try {
      const res = await axiosInstance.post("/connect/reject", {
        userId,
        targetUserId,
      });
      console.log(res.data);
      return res.data.status;
    } catch (error) {
      console.log(error);
    } finally {
      set({ isRejectingConnection: false });
    }
  },

  getAllConnections: async (userId) => {
    set({ isGettingConnections: true });
    try {
      const res = await axiosInstance.post("/connect/all", {
        userId,
      });
      console.log(res.data);
      set({ connections: res.data.connections });
    } catch (error) {
      console.log(error);
    } finally {
      set({ isGettingConnections: false });
    }
  },
}));
