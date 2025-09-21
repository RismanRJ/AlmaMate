import { create } from "zustand";
// import toast from "react-hot-toast";
import { axiosInstance } from "../src/lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: {},
  posts: {},
  usersProfile: {},
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isGettingConvoId: false,
  selectedConvoId: null,
  updateConvoId: null,
  featureFlag: false,
  createChat: async (userId, participantId) => {
    try {
      const res = await axiosInstance.post(`convo/new`, {
        userId: userId,
        participantId: participantId,
      });

      // get().getUsers(res.data.users[0]);
      console.log(res.data.users);
      return res.data.users;
    } catch (error) {
      console.log(error.message);
    }
  },
  getUsers: async (id) => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get(`/convo/getUsers/${id}`);
      console.log(res.data);

      set({ users: res.data.users });
      set({ isUsersLoading: false });
      return res.data.users;
    } catch (error) {
      console.log(error);
      //   toast.error(error.response.data.message);
    } finally {
      set({ isUserLoading: false });
    }
  },

  getConvoId: async (userId, targetUserId) => {
    set({
      isGettingConvoId: true,
    });
    try {
      const res = await axiosInstance.post("/convo/getConvoId", {
        userId: userId,
        targetUserId: targetUserId,
      });

      set({
        selectedConvoId: res.data.id,
      });
      return res.data;
    } catch (error) {
      console.log(error.message);
    } finally {
      set({
        isGettingConvoId: false,
      });
    }
  },

  updateConvoId: (convoId) => {
    set({
      selectedConvoId: convoId,
    });
  },

  setUserProfile: (id, profile) => {
    set({
      usersProfile: {
        ...get().usersProfile,
        [id]: profile,
      },
    });
  },

  selectUser: (user) => {
    set({ selectedUser: user });
  },

  getMessages: async (userId, targetUserId) => {
    set({
      isMessagesLoading: true,
    });

    try {
      const res = await axiosInstance.post(`/messages/getAllmessages`, {
        userId: userId,
        targetUserId: targetUserId,
        conversationId: get().selectedConvoId,
      });

      if (res.data.messages.length > 0) {
        set({
          messages: {
            ...get().messages,
            [get().selectedUser.userId]: [...res.data.messages],
          },
        });
      }
      if (res.data.sharedPosts.length > 0) {
        set({
          posts: {
            ...get().posts,
            [get().selectedUser.userId]: [...res.data.sharedPosts],
          },
        });
      }

      set({
        isMessagesLoading: false,
      });
      return {
        msg: get().messages[get().selectedUser.userId],
        posts: get().posts[get().selectedUser.userId],
      };
    } catch (error) {
      console.log(error.message);
    } finally {
      set({
        isMessagesLoading: false,
      });
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      // if (newMessage.conversationId !== get().selectedConvoId) {
      //   console.log("Message belongs to a different conversation.");
      //   return;
      // }

      console.log("New message received:", newMessage);

      set((state) => ({
        messages: {
          ...state.messages,
          [selectedUser.userId]: [
            ...(state.messages[selectedUser.userId] || []),
            newMessage,
          ],
        },
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  sendMessage: async (senderId, receiverId, text) => {
    try {
      const { selectedUser } = get();
      const newMessage = {
        sender: senderId,
        receiver: receiverId,
        text: text,
        conversationId: get().selectedConvoId,
        createdAt: new Date().toISOString(),
      };

      const res = await axiosInstance.post(
        `message/send/${get().selectedConvoId}`,
        {
          sender: senderId,
          receiver: receiverId,
          text: text,
        }
      );

      set((state) => ({
        messages: {
          ...state.messages,
          [selectedUser.userId]: [
            ...(state.messages[selectedUser.userId] || []),
            res.data.message,
          ],
        },
      }));
    } catch (error) {
      console.log("Send message error:", error.message);
    }
  },
}));
