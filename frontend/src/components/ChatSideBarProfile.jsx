import React, { useEffect } from "react";
import { Box, Avatar, Text, Flex, Spinner } from "@chakra-ui/react";
import { useChatStore } from "../../store/useChatStore";

const ChatSideBarProfile = ({ user }) => {
  const { selectUser, selectedUser, updateConvoId } = useChatStore();

  const handleSelectChat = () => {
    selectUser(null);
    selectUser(user);
    console.log(selectedUser);

    updateConvoId(user.convoId);
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      bg="white"
      cursor={"pointer"}
      boxShadow="md"
      _hover={{ boxShadow: "lg" }}
      my={5}
      onClick={handleSelectChat}
      zIndex={100}
    >
      <Flex align="center">
        <Avatar src={user.avatar} name={user.name} size="md" mr={4} />
        <Box color={"black"}>
          <Text fontWeight="bold">{user.name}</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default ChatSideBarProfile;
