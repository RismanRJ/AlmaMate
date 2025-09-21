import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Flex,
  Avatar,
  Text,
  VStack,
  useColorMode,
  Input,
  InputGroup,
  InputLeftElement,
  Box,
  IconButton,
  useToast,
  Textarea,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { BiSearch, BiShareAlt, BiCheck, BiMessageDetail } from "react-icons/bi";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../../store/useAuthStore";

const ShareModal = ({
  isOpen,
  onClose,
  postId,
  //   connections = [],
  authUser,
}) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sharedWith, setSharedWith] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const { connections } = useAuthStore();

  // Filter connections based on search query
  const filteredConnections = connections.filter((connection) => {
    // Extract the connection user (the one that's not the authUser)
    const connectionUser =
      connection.senderId === authUser._id
        ? connection.receiver
        : connection.sender;

    // Only show accepted connections
    // if (connection.status !== "accepted") return false;

    // Filter by name if there's a search query
    if (searchQuery && connectionUser?.name) {
      return connectionUser.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleShare = async (userEmail) => {
    // Toggle shared status
    if (sharedWith.includes(userEmail)) {
      setSharedWith(sharedWith.filter((id) => id !== userEmail));
    } else {
      setSharedWith([...sharedWith, userEmail]);
    }
  };

  const handleSharePost = async () => {
    if (sharedWith.length === 0) {
      toast({
        title: "No connections selected",
        description: "Please select at least one connection to share with",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSharing(true);

    await axiosInstance
      .post(`/posts/${postId}/share`, {
        sharedEmails: sharedWith,
        message: shareMessage, // Include the share message
      })
      .then((res) => {
        toast({
          title: "Post shared successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
      })
      .catch((err) => {
        console.error("Error sharing post:", err.response?.data.message);
        toast({
          title: "Error sharing post",
          description: err.response?.data.message || "An error occurred",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      })
      .finally(() => {
        setIsSharing(false);
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "xs", sm: "sm", md: "md" }}
    >
      <ModalOverlay />
      <ModalContent bg={colorMode === "dark" ? "gray.800" : "white"}>
        <ModalHeader
          borderBottomWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        >
          Share with connections
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={4}>
          <VStack spacing={4} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <BiSearch
                  color={colorMode === "dark" ? "gray.300" : "gray.500"}
                />
              </InputLeftElement>
              <Input
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={colorMode === "dark" ? "gray.700" : "gray.100"}
              />
            </InputGroup>

            <Box
              maxH="300px"
              overflowY="auto"
              borderRadius="md"
              borderWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              p={2}
            >
              {filteredConnections.length > 0 ? (
                filteredConnections.map((connection) => {
                  // Determine which user in the connection is not the authUser
                  const connectionUser = connection;

                  const isSelected = sharedWith.includes(connectionUser?.email);

                  return (
                    <Flex
                      key={connection._id}
                      p={3}
                      alignItems="center"
                      justifyContent="space-between"
                      _hover={{
                        bg: colorMode === "dark" ? "gray.700" : "gray.100",
                      }}
                      borderRadius="md"
                      cursor="pointer"
                      onClick={() => handleShare(connectionUser?.email)}
                    >
                      <Flex alignItems="center" gap={3}>
                        <Avatar
                          size="sm"
                          src={
                            connectionUser?.avatar ||
                            "https://avatars.dicebear.com/api/human/default.svg"
                          }
                        />
                        <Text fontWeight="medium">{connectionUser?.name}</Text>
                      </Flex>
                      <IconButton
                        icon={isSelected ? <BiCheck /> : <BiShareAlt />}
                        size="sm"
                        colorScheme={isSelected ? "green" : "blue"}
                        variant={isSelected ? "solid" : "outline"}
                        isRound
                        aria-label="Share with connection"
                      />
                    </Flex>
                  );
                })
              ) : (
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  h="100px"
                  color="gray.500"
                >
                  {searchQuery
                    ? "No connections match your search"
                    : "No connections available"}
                </Flex>
              )}
            </Box>
            {/* Message field */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">
                Add a message
              </FormLabel>
              <Textarea
                placeholder="Write a message to send with this post..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                size="sm"
                rows={3}
                resize="vertical"
              />
            </FormControl>
            <Flex justifyContent="space-between" pt={2}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                leftIcon={<BiShareAlt />}
                onClick={handleSharePost}
                isLoading={isSharing}
                isDisabled={sharedWith.length === 0}
              >
                Share ({sharedWith.length})
              </Button>
            </Flex>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ShareModal;
