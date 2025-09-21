import { useState } from "react";
import { Box, Input, IconButton, FormControl, Flex } from "@chakra-ui/react";
import { IoMdSend } from "react-icons/io";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
const MessageInput = () => {
  const [text, setText] = useState("");
  const { authUser } = useAuthStore();
  const { sendMessage, selectedUser } = useChatStore();

  const sendIcon = <IoMdSend />;
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await sendMessage({
        sender: authUser._id,
        receiverId: selectedUser.userId,
        text: text.trim(),
      });

      // Clear the input
      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <Box
      p="4"
      w={"50%"}
      position={"fixed"}
      bottom="10"
      left="0"
      right="0"
      mb={"10px"}
      mx={"auto"}
    >
      <form>
        <Flex
          gap="2"
          align="center"
          bg={"black"}
          textColor={"white"}
          rounded={"lg"}
          p={3}
        >
          {/* Text Input */}
          <FormControl flex="1">
            <Input
              type="text"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              size="md"
              borderRadius="lg"
            />
          </FormControl>

          {/* Send Button */}
          <IconButton
            type="submit"
            aria-label="Send message"
            icon={sendIcon}
            isDisabled={!text.trim()}
            colorScheme="teal"
            size="md"
            borderRadius="full"
            onClick={handleSendMessage}
          />
        </Flex>
      </form>
    </Box>
  );
};

export default MessageInput;
