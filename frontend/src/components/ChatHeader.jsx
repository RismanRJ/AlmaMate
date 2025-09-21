import React from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Box, Flex, Avatar, Text, Button } from "@chakra-ui/react";
// import { CloseIcon } from "@chakra-ui/icons";
const ChatHeader = () => {
  const { onlineUsers } = useAuthStore();
  const { selectedUser, selectUser } = useChatStore();
  console.log(onlineUsers, selectedUser);

  return (
    <div>
      <Box p="2.5" borderBottom="1px" borderColor="gray.200">
        <Flex alignItems="center" justifyContent="space-between">
          {/* User Info */}
          <Flex alignItems="center" gap="3">
            {/* Avatar */}
            <Avatar
              size="md"
              name={selectedUser.name}
              src={selectedUser.avatar || "/avatar.png"}
            />

            {/* User Info */}
            <Box>
              <Text fontWeight="medium">{selectedUser.name}</Text>
              <Text fontSize="sm" color="gray.500">
                {onlineUsers.includes(selectedUser.userId)
                  ? "Online"
                  : "Offline"}
              </Text>
            </Box>
          </Flex>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => selectUser(null)}
            aria-label="Close"
          >
            close
          </Button>
        </Flex>
      </Box>
    </div>
  );
};

export default ChatHeader;
