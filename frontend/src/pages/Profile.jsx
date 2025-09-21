import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Avatar,
  Button,
  Divider,
  Spinner,
  Flex,
  Icon,
  useBreakpointValue,
  Container,
  Badge,
  useColorModeValue,
  Fade,
  ScaleFade,
  SlideFade,
  Tooltip,
  IconButton,
  useDisclosure,
  Skeleton,
  useColorMode,
} from "@chakra-ui/react";
import { FaEnvelope, FaUserPlus, FaComment, FaCalendarAlt, FaInfo, FaMoon, FaSun } from "react-icons/fa";
import { useConnectionStore } from "../../store/useConnectionStore";
import { useChatStore } from "../../store/useChatStore";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const { getUserProfile, searchUserProfile, isSearching, authUser } = useAuthStore();
  const { createChat } = useChatStore();
  const {
    isSendingConnection,
    sendConnection,
    isCheckingConnectionStatus,
    checkConnectionStatus,
  } = useConnectionStore();
  
  const id = location?.state?.id;
  const [status, setStatus] = useState("Connect");
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const headerBg = useColorModeValue(
    "linear-gradient(45deg, rgba(66, 153, 225, 0.6) 0%, rgba(66, 153, 225, 0.9) 100%)",
    "linear-gradient(45deg, rgba(45, 55, 72, 0.6) 0%, rgba(26, 32, 44, 0.9) 100%)"
  );
  const headerHoverBg = useColorModeValue(
    "linear-gradient(45deg, rgba(66, 153, 225, 0.7) 0%, rgba(66, 153, 225, 1) 100%)",
    "linear-gradient(45deg, rgba(45, 55, 72, 0.7) 0%, rgba(26, 32, 44, 1) 100%)"
  );
  const textColor = useColorModeValue("gray.600", "gray.300");
  const highlightColor = useColorModeValue("blue.500", "blue.300");
  const dividerColor = useColorModeValue("gray.200", "gray.600");
  const avatarBorderColor = useColorModeValue("white", "gray.700");
  
  // Responsive design adjustments
  const avatarSize = useBreakpointValue({ base: "lg", md: "xl" });
  const containerPadding = useBreakpointValue({ base: 3, md: 5 });
  
  useEffect(() => {
    const loadProfile = async () => {
      await getUserProfile(id);
      const res = await checkConnectionStatus(authUser._id, id);
      if (res.status) setStatus(res.connectionStatus);
      // Simulate loading for smoother transitions
      setTimeout(() => setIsLoaded(true), 800);
    };

    loadProfile();
  }, [getUserProfile, checkConnectionStatus , id]);

  const handleConnectionRequest = async () => {
    console.log("Connection Request Sent");
    const res = await sendConnection(authUser._id, searchUserProfile._id);
    console.log(res.connectionStatus);
    setStatus(res.connectionStatus);
  };
  
  const handleSendMessage = async () => {
    const res = createChat(authUser._id, searchUserProfile._id);
    if (res || res.length > 0) {
      console.log("Chat created");
      navigate("/chat");
    }
  };

  const getStatusColor = () => {
    switch(status.toLowerCase()) {
      case "accepted": return "green";
      case "pending": return "orange";
      default: return "blue";
    }
  };

  if (!searchUserProfile || !isLoaded) {
    return (
      <Container maxW="800px" centerContent p={containerPadding}>
        <VStack spacing={4} w="full">
          <Skeleton height="200px" w="full" borderRadius="md" />
          <HStack w="full" spacing={5}>
            <Skeleton height="96px" width="96px" borderRadius="full" />
            <VStack align="start" w="full">
              <Skeleton height="24px" w="200px" />
              <Skeleton height="20px" w="150px" />
              <Skeleton height="20px" w="180px" />
            </VStack>
          </HStack>
          <Divider />
          <Skeleton height="120px" w="full" />
          <Skeleton height="20px" w="full" />
          <HStack w="full">
            <Skeleton height="40px" w="100px" />
            <Skeleton height="40px" w="100px" />
          </HStack>
        </VStack>
      </Container>
    );
  }

  return (
    <Fade in={true} transition={{ enter: { duration: 0.5 } }}>
      <Container maxW="800px" centerContent p={containerPadding}>
        <Box 
          w="full" 
          bg={cardBg} 
          boxShadow="lg" 
          borderRadius="lg" 
          overflow="hidden"
          position="relative"
        >
          <MotionBox
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <Box
              h="220px"
              position="relative"
              backgroundImage={headerBg}
              backgroundSize="cover"
              transition="all 0.3s"
              _hover={{ 
                backgroundImage: headerHoverBg,
              }}
            >
              <VStack
                position="absolute"
                bottom="50px"
                left="0"
                right="0"
                textAlign="center"
                spacing={1}
              >
                <Heading
                  color="white"
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="bold"
                  textShadow="1px 1px 3px rgba(0,0,0,0.3)"
                >
                  {searchUserProfile.name}
                </Heading>
                <Badge 
                  colorScheme={useColorModeValue("blue", "gray")} 
                  fontSize="md"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {searchUserProfile.role}
                </Badge>
              </VStack>
            </Box>
          </MotionBox>

          <ScaleFade in={true} initialScale={0.9}>
            <Box position="relative" mt="-50px" textAlign="center">
              <Avatar 
                size={avatarSize} 
                name={searchUserProfile.name} 
                src="" 
                border={`4px solid ${avatarBorderColor}`}
                bg={useColorModeValue("blue.500", "blue.400")}
                mb={2}
                transition="transform 0.3s"
                _hover={{ transform: "scale(1.05)" }}
              />
            </Box>
            
            <Box px={6} pt={2} pb={6}>
              <HStack justify="center" mb={4}>
                <Tooltip label="Email" hasArrow>
                  <HStack spacing={2}>
                    <Icon as={FaEnvelope} color={highlightColor} />
                    <Text color={textColor}>{searchUserProfile.email}</Text>
                  </HStack>
                </Tooltip>
              </HStack>

              <Divider mb={5} borderColor={dividerColor} />
              
              <VStack align="start" spacing={5}>
                <SlideFade in={true} offsetY={20}>
                  <Box w="full">
                    <HStack mb={2}>
                      <Icon as={FaInfo} color={highlightColor} />
                      <Heading size="md">About</Heading>
                    </HStack>
                    <Text color={textColor} fontSize="md">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
                      lacinia odio vitae vestibulum. Integer ut quam turpis. Pellentesque sed
                      dignissim eros, sit amet finibus velit.
                    </Text>
                  </Box>
                </SlideFade>
                
                <SlideFade in={true} offsetY={20} delay={0.1}>
                  <Box w="full">
                    <HStack mb={2}>
                      <Icon as={FaCalendarAlt} color={highlightColor} />
                      <Heading size="md">Account Created</Heading>
                    </HStack>
                    <Text color={textColor}>
                      {new Date(searchUserProfile.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Text>
                  </Box>
                </SlideFade>
                
                <SlideFade in={true} offsetY={20} delay={0.2}>
                  <HStack spacing={4} mt={2} w="full" justify="center">
                    <Button
                      leftIcon={<FaUserPlus />}
                      colorScheme={getStatusColor()}
                      variant={useColorModeValue("solid", "solid")}
                      size="md"
                      onClick={handleConnectionRequest}
                      isLoading={isSendingConnection || isCheckingConnectionStatus}
                      disabled={status.toLowerCase() === "accepted"}
                      px={6}
                      _hover={{ 
                        transform: "translateY(-2px)", 
                        boxShadow: "md",
                        bg: useColorModeValue(null, `${getStatusColor()}.600`)
                      }}
                      transition="all 0.2s"
                    >
                      {status}
                    </Button>
                    
                    <Button
                      leftIcon={<FaComment />}
                      colorScheme="green"
                      variant={useColorModeValue("solid", "solid")}
                      size="md"
                      onClick={handleSendMessage}
                      px={6}
                      _hover={{ 
                        transform: "translateY(-2px)", 
                        boxShadow: "md",
                        bg: useColorModeValue(null, "green.600")
                      }}
                      transition="all 0.2s"
                    >
                      Message
                    </Button>
                  </HStack>
                </SlideFade>
              </VStack>
            </Box>
          </ScaleFade>
        </Box>
      </Container>
    </Fade>
  );
};

export default Profile;