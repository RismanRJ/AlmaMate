import React, { useEffect, useState } from "react";
import { useConnectionStore } from "../../store/useConnectionStore";
import {
  Heading,
  Spinner,
  Box,
  VStack,
  Text,
  Container,
  Flex,
  useColorModeValue,
  SlideFade,
  Fade,
  Badge,
  Icon,
  Divider,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import { useAuthStore } from "../../store/useAuthStore";
import NotificationProfileBar from "../components/NotificationProfileBar";
import { FaBell, FaMoon, FaSun } from "react-icons/fa";

const Notification = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const {
    isGettingConnections,
    getAllConnections,
    connections,
    acceptConnection,
    rejectConnection,
  } = useConnectionStore();

  const { authUser } = useAuthStore();

  const [myConnections, setMyConnections] = useState(connections);

  useEffect(() => {
    getAllConnections(authUser._id);
    console.log(connections);
  }, [getAllConnections]);

  const updateNotificationStatus = async (id, status) => {
    if (status == "accept") {
      const res = await acceptConnection(authUser._id, id);
      if (res)
        setMyConnections(myConnections.filter((conn) => conn.senderId != id));
    } else {
      const res = await rejectConnection(authUser._id, id);
      if (res)
        setMyConnections(myConnections.filter((conn) => conn.senderId != id));
    }
    getAllConnections(authUser._id);
  };

  // Filter pending connections that are not from the current user
  const pendingConnections = myConnections?.filter(
    (conn) => conn.status == "pending" && conn.senderId != authUser._id
  );

  // Colors based on theme
  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const dividerColor = useColorModeValue("gray.200", "gray.600");
  const badgeColor = useColorModeValue("blue.500", "blue.300");
  const emptyTextColor = useColorModeValue("gray.500", "gray.400");
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const iconColor = useColorModeValue("blue.500", "blue.300");
  const loadingTextColor = useColorModeValue("gray.600", "gray.400");
  const shadowColor = useColorModeValue(
    "0 4px 6px rgba(0, 0, 0, 0.1)",
    "0 4px 6px rgba(0, 0, 0, 0.3)"
  );
  const hoverShadow = useColorModeValue(
    "0 6px 8px rgba(0, 0, 0, 0.1)",
    "0 6px 8px rgba(0, 0, 0, 0.4)"
  );

  if (isGettingConnections) {
    return (
      <Fade in={true}>
        <Container centerContent py={10}>
          <VStack spacing={6}>
            <Spinner
              size="xl"
              thickness="4px"
              speed="0.65s"
              color={iconColor}
            />
            <Text color={loadingTextColor}>Loading notifications...</Text>
          </VStack>
        </Container>
      </Fade>
    );
  }

  return (
    <Fade in={true} transition={{ enter: { duration: 0.4 } }}>
      <Container maxW="800px" py={6}>
        <Box
          bg={cardBg}
          borderRadius="lg"
          boxShadow={shadowColor}
          overflow="hidden"
          p={5}
          position="relative"
        >
          <Flex
            alignItems="center"
            mb={6}
            pb={3}
            borderBottomWidth="1px"
            borderBottomColor={dividerColor}
          >
            <Icon
              as={FaBell}
              color={iconColor}
              mr={3}
              boxSize={6}
              className="bell-animation"
            />
            <Heading as="h2" size="lg" color={headingColor}>
              User Notifications
            </Heading>

            {pendingConnections && pendingConnections.length > 0 && (
              <Badge
                ml={3}
                colorScheme={colorMode === "light" ? "blue" : "blue"}
                borderRadius="full"
                px={3}
                py={1}
                fontSize="md"
              >
                {pendingConnections.length}
              </Badge>
            )}
          </Flex>

          {(!myConnections || pendingConnections.length === 0) && (
            <Box textAlign="center" py={10} color={emptyTextColor}>
              <Icon
                as={FaBell}
                boxSize={10}
                mb={4}
                opacity={0.5}
                color={emptyTextColor}
              />
              <Text fontSize="lg">No new notifications</Text>
              <Text fontSize="sm" mt={2}>
                Check back later for updates
              </Text>
            </Box>
          )}

          <VStack spacing={4} align="stretch">
            {connections &&
              pendingConnections.map((conn, index) => (
                <SlideFade
                  in={true}
                  offsetY={20}
                  delay={index * 0.1}
                  key={conn.senderId}
                >
                  <Box
                    borderRadius="md"
                    transition="all 0.2s ease"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: hoverShadow,
                      bg: hoverBg,
                    }}
                    p={2}
                  >
                    <NotificationProfileBar
                      id={conn.senderId}
                      updateStatus={updateNotificationStatus}
                    />
                  </Box>
                  {index < pendingConnections.length - 1 && (
                    <Divider my={2} borderColor={dividerColor} />
                  )}
                </SlideFade>
              ))}
          </VStack>
        </Box>
      </Container>

      {/* Add CSS for bell animation */}
      <style jsx global>{`
        @keyframes bellRing {
          0% {
            transform: rotate(0);
          }
          10% {
            transform: rotate(10deg);
          }
          20% {
            transform: rotate(-10deg);
          }
          30% {
            transform: rotate(6deg);
          }
          40% {
            transform: rotate(-6deg);
          }
          50% {
            transform: rotate(0);
          }
          100% {
            transform: rotate(0);
          }
        }

        .bell-animation {
          animation: bellRing 2s ease infinite;
          transform-origin: top center;
        }

        /* Adjust animation for dark mode to be more subtle */
        @media (prefers-color-scheme: dark) {
          .bell-animation {
            animation-duration: 3s;
          }
        }
      `}</style>
    </Fade>
  );
};

export default Notification;
