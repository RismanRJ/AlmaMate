import React, { useEffect } from "react";
import { useChatStore } from "../../../store/useChatStore";
import { Spinner } from "@chakra-ui/react";
import { useAuthStore } from "../../../store/useAuthStore";
import ChatSideBarProfile from "../../components/ChatSideBarProfile";
import { use } from "react";
import { useNavigate } from "react-router-dom";

const MsgSidebar = () => {
  const {
    authUser,
    onlineUsers,
    getUserProfile,
    searchUserProfile,
    clearProfile,
  } = useAuthStore();
  const id = authUser._id;
  const { users, getUsers, isUsersLoading, setUserProfile, usersProfile } =
    useChatStore();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = await getUsers(id);

      if (fetchedUsers) {
        const filteredUsers = fetchedUsers.flatMap((conversation) =>
          conversation.participants
            .filter((participant) => participant._id !== id) // Exclude the requesting user
            .map((participant) => ({
              convoId: conversation._id, // Conversation ID
              userId: participant._id, // Participant ID
              name: participant.name, // Participant Name
              email: participant.email, // Participant Email
              avatar: participant.avatar || null, // Optional Avatar
            }))
        );

        filteredUsers.forEach(async (id) => {
          if (id.userId != authUser._id) {
            setUserProfile(id.userId, id);
            console.log(id);
          }
        });
      }
    };
    fetchUsers();
  }, [navigate, getUsers]);

  if (isUsersLoading) return <Spinner />;

  return (
    <div>
      {Object.keys(usersProfile).map((user) => (
        <ChatSideBarProfile key={user} user={usersProfile[user]} />
      ))}
    </div>
  );
};

export default MsgSidebar;
