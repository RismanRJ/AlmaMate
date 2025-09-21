import { create } from "zustand";
import { axiosInstance } from "../src/lib/axios";

export const useSearchStore = create((set, get) => ({
  searchedUsers: [],
  isSearching: false,
  searchUserProfile: null,
  updateSearchedUsers: null,

  updateSearchedUsers: () => {
    set({ searchedUsers: [] });
  },

  searchUsers: async (name, authUser) => {
    set({ isSearching: true });
    try {
      if (authUser.authType === "google") {
        if (name) {
          const res = await axiosInstance.post(`/auth/google/search`, {
            name: name,
          });
          console.log(res.data);
          set({ searchedUsers: res.data.users });
          return res.data;
        } else {
          set({ searchedUsers: [] });
        }
      } else {
        if (name) {
          const res = await axiosInstance.post(`/auth/search`, {
            name: name,
          });
          console.log(res.data);
          set({ searchedUsers: res.data.users });
          return res.data;
        } else {
          set({ searchedUsers: [] });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      set({ isSearching: false });
    }
  },

  getProfile: async (id) => {
    try {
      const res = await axiosInstance.get(`/auth/profile/${id}`);
      set({
        searchUserProfile: res.data,
      });

      return res.data;
    } catch (error) {
      console.log(error.message);
    }
  },
}));
