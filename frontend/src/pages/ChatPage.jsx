import React, { useEffect } from "react";
import {
  ChakraProvider,
  Box,
  Flex,
  Text,
  useColorMode,
  useColorModeValue,
  IconButton,
  SlideFade,
  ScaleFade,
  Slide,
  useDisclosure,
  Button,
  Tooltip,
  Heading,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon, ChatIcon } from "@chakra-ui/icons";
import MsgSidebar from "./chat/MsgSidebar";
import { useChatStore } from "../../store/useChatStore";
import ChatHeader from "../components/ChatHeader";
import ChatContainer from "../components/ChatContainer";

const ChatPage = () => {
  const { selectedUser } = useChatStore();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen } = useDisclosure({ defaultIsOpen: false });

  // Background colors based on color mode
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const sidebarBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = useColorModeValue("teal.500", "teal.300");
  const scrollbarThumbColor = useColorModeValue(
    "rgba(0,0,0,0.2)",
    "rgba(255,255,255,0.2)"
  );
  const scrollbarThumbHoverColor = useColorModeValue(
    "rgba(0,0,0,0.4)",
    "rgba(255,255,255,0.4)"
  );

  // Trigger animations on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      onOpen();
    }, 100);

    return () => clearTimeout(timer);
  }, [onOpen]);

  return (
    <ChakraProvider>
      <Box
        h="100vh"
        bg={bgColor}
        overflow="hidden"
        transition="background-color 0.3s ease"
      >
        <Flex h="full" direction="column">
          <Flex flex="1" overflow="hidden">
            {/* Sidebar with animation */}
            {/* <ScaleFade in={isOpen} initialScale={0.9}> */}
            <Box
              w="280px"
              h="full"
              bg={sidebarBg}
              borderRight="1px"
              borderColor={borderColor}
              boxShadow="md"
              transition="all 0.3s ease"
              _hover={{ boxShadow: "lg" }}
              display="flex"
              flexDirection="column"
            >
              <Flex
                p={4}
                borderBottom="1px"
                borderColor={borderColor}
                bg={useColorModeValue("teal.50", "teal.900")}
                transition="all 0.3s ease"
                mt={5}
              >
                <Heading
                  size="md"
                  color={useColorModeValue("teal.600", "teal.200")}
                  display="flex"
                  alignItems="center"
                >
                  <ChatIcon mr={2} />
                  Users
                </Heading>
              </Flex>

              {/* Custom scrollbar styles for the sidebar content */}
              <Box
                flex="1"
                overflowY="auto"
                sx={{
                  "&::-webkit-scrollbar": {
                    width: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: scrollbarThumbColor,
                    borderRadius: "20px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: scrollbarThumbHoverColor,
                  },
                  // Firefox scrollbar styling
                  scrollbarWidth: "thin",
                  scrollbarColor: `${scrollbarThumbColor} transparent`,
                }}
              >
                <MsgSidebar />
              </Box>
            </Box>
            {/* </ScaleFade> */}

            {/* Chat container with animation */}
            {/* <Slide in={isOpen} direction="right"> */}
            <Flex flex="1" direction="column" transition="all 0.3s ease">
              {/* <SlideFade in={!!selectedUser} offsetY="20px"> */}
              <Flex
                direction="column"
                h="100vh"
                bg={useColorModeValue("white", "gray.800")}
                borderRadius="md"
                m={5}
                boxShadow="sm"
                transition="all 0.3s ease"
                _hover={{ boxShadow: "md" }}
              >
                {selectedUser && (
                  <>
                    <ChatHeader />
                    <ChatContainer />
                  </>
                )}

                {!selectedUser && (
                  <Flex
                    justify="center"
                    align="center"
                    h="full"
                    color={useColorModeValue("gray.400", "gray.500")}
                  >
                    <Box
                      p={8}
                      borderRadius="lg"
                      bg={useColorModeValue("gray.50", "gray.700")}
                      textAlign="center"
                      // animation="pulse 2s infinite ease-in-out"
                      sx={{
                        "@keyframes pulse": {
                          "0%": { transform: "scale(1)" },
                          "50%": { transform: "scale(1.05)" },
                          "100%": { transform: "scale(1)" },
                        },
                      }}
                    >
                      <ChatIcon boxSize={10} mb={4} color={accentColor} />
                      <Text fontSize="xl" mb={4}>
                        Select a user to start chatting
                      </Text>
                      <Button
                        colorScheme="teal"
                        variant="outline"
                        _hover={{
                          transform: "translateY(-2px)",
                          boxShadow: "md",
                        }}
                        transition="all 0.2s"
                      >
                        Browse Users
                      </Button>
                    </Box>
                  </Flex>
                )}
              </Flex>
              {/* </SlideFade> */}
            </Flex>
            {/* </Slide> */}
          </Flex>
        </Flex>
      </Box>
    </ChakraProvider>
  );
};

export default ChatPage;
