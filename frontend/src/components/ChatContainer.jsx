import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import {
  Box,
  Avatar,
  Flex,
  Text,
  Spinner,
  VStack,
  Image,
  AspectRatio,
  Stack,
  Heading,
  HStack,
  Icon,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  useColorModeValue,
} from "@chakra-ui/react";
import { BiHeart, BiComment, BiShare } from "react-icons/bi";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { axiosInstance } from "../lib/axios";

const PostPreview = ({ post }) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Card
      maxW="full"
      bg={cardBg}
      borderColor={borderColor}
      borderWidth="1px"
      borderRadius="md"
      overflow="hidden"
      boxShadow="sm"
    >
      <CardHeader pb={0}>
        <Flex spacing="4">
          <Flex flex="1" gap="4" alignItems="center">
            <Avatar
              size="sm"
              name={post.author?.name}
              src={post.author?.avatar}
            />
            <Box>
              <Heading size="sm">{post.title}</Heading>
              <Text fontSize="sm" color="gray.500">
                {new Date(post.createdAt).toLocaleDateString()}
              </Text>
            </Box>
          </Flex>
        </Flex>
      </CardHeader>

      <CardBody py={3}>
        <Text noOfLines={2}>{post.description}</Text>
      </CardBody>

      {post.media && post.media.length > 0 && (
        <Box position="relative" width="100%">
          {post.media[0].type === "image" ? (
            <Image
              src={post.media[0].url}
              alt={post.title}
              objectFit="cover"
              width="100%"
              height="150px"
              fallbackSrc="https://via.placeholder.com/150"
            />
          ) : post.media[0].type === "video" ? (
            <AspectRatio ratio={16 / 9} maxH="150px">
              <Box
                as="video"
                controls
                src={post.media[0].url}
                objectFit="cover"
                width="100%"
                height="150px"
                fallback={<Spinner />}
              />
            </AspectRatio>
          ) : null}

          {post.media.length > 1 && (
            <Text
              position="absolute"
              bottom="2"
              right="2"
              bg="blackAlpha.700"
              color="white"
              fontSize="xs"
              px="2"
              py="1"
              borderRadius="md"
            >
              +{post.media.length - 1} more
            </Text>
          )}
        </Box>
      )}

      <CardFooter pt={0}>
        <HStack spacing={4}>
          <Flex align="center">
            <Icon as={BiHeart} mr={1} />
            <Text fontSize="sm">{post.likes?.length || 0}</Text>
          </Flex>
          <Flex align="center">
            <Icon as={BiComment} mr={1} />
            <Text fontSize="sm">{post.comments?.length || 0}</Text>
          </Flex>
        </HStack>
      </CardFooter>
    </Card>
  );
};

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    isGettingConvoId,
    selectedConvoId,
    featureFlag,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const msgRef = useRef(null);

  const [allMessages, setAllMessages] = useState(
    messages[selectedUser.userId] || []
  );
  const [allPosts, setAllPosts] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser || !authUser) return;

      const { posts } = await getMessages(authUser._id, selectedUser.userId);
      setAllMessages(messages[selectedUser.userId] || []);
      setAllPosts(posts || []);
    };
    fetchMessages();
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser,
    selectedConvoId,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // useEffect(() => {
  //   if (msgRef.current) {
  //     msgRef.current.scrollIntoView({
  //       behavior: "smooth",
  //     });
  //   }
  // }, [messages]);

  // Find post by ID
  const findPostById = (postId) => {
    return allPosts.find((post) => post._id === postId);
  };

  // Check if message has associated post (shared post)
  const getPostForMessage = (message) => {
    if (message.postId) {
      return findPostById(message.postId);
    }

    // Check if this message is about sharing a post
    if (message.type === "post_share" && message.metadata?.postId) {
      return findPostById(message.metadata.postId);
    }

    return null;
  };

  if (isGettingConvoId) {
    return <Spinner />;
  }

  // Create a combined timeline of messages and standalone shared posts
  const combinedTimeline = [...allMessages];

  // Find posts that were shared without a message
  allPosts.forEach((post) => {
    // Check if this post has shared entries for current chat users
    if (post.sharedWith && post.sharedWith.length > 0) {
      post.sharedWith.forEach((share) => {
        if (
          (share.senderId === authUser._id &&
            share.receiverId === selectedUser.userId) ||
          (share.senderId === selectedUser.userId &&
            share.receiverId === authUser._id)
        ) {
          // Check if this shared post is already represented in a message
          const hasAssociatedMessage = allMessages.some(
            (msg) =>
              msg.postId === post._id ||
              (msg.type === "post_share" && msg.metadata?.postId === post._id)
          );

          // If not already in messages, add it to the timeline
          if (!hasAssociatedMessage) {
            combinedTimeline.push({
              _id: share._id || `share_${post._id}_${Date.now()}`,
              sender: share.senderId,
              text: share.message || "Shared a post with you",
              createdAt: share.sharedAt || post.createdAt,
              postId: post._id,
              isSharedPost: true,
            });
          }
        }
      });
    }
  });

  // Sort by date
  combinedTimeline.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  if (isMessagesLoading) {
    return (
      <Flex flex="1" direction="column" overflow="auto">
        {selectedUser && <ChatHeader />}
        <Flex flex="1" justify="center" align="center">
          <Spinner size="lg" />
        </Flex>
        <MessageInput />
      </Flex>
    );
  }

  console.log(messages[selectedUser.userId]);

  return (
    <Flex height={"80%"} pb={5} flexDirection="column" my={5}>
      <VStack
        flex="1"
        height={"100%"}
        overflowY="scroll"
        p="4"
        spacing="4"
        align="start"
        divider={<Box borderColor="gray.200" />}
        bg={"gray.100"}
      >
        {messages[selectedUser.userId] &&
        messages[selectedUser.userId].length > 0 ? (
          messages[selectedUser.userId].map((message, idx) => {
            const associatedPost = message.post ? message.post : null;

            return (
              <Flex
                key={idx}
                align="flex-start"
                flexDir={
                  message.sender === authUser._id ? "row-reverse" : "row"
                }
                w="full"
                ref={idx === combinedTimeline.length - 1 ? msgRef : null}
              >
                <Avatar
                  size="sm"
                  src={
                    message.sender === authUser._id
                      ? authUser.avatar || "/avatar.png"
                      : selectedUser.avatar || "/avatar.png"
                  }
                  name={
                    message.sender === authUser._id
                      ? authUser.name
                      : selectedUser.name
                  }
                />

                <Box
                  bg={message.sender === authUser._id ? "blue.500" : "gray.200"}
                  color={message.sender === authUser._id ? "white" : "black"}
                  px="5"
                  py="3"
                  borderRadius="lg"
                  maxW="80%"
                  ml={message.sender === authUser._id ? "0" : "2"}
                  mr={message.sender === authUser._id ? "2" : "0"}
                >
                  {message.text && (
                    <Text mb={associatedPost ? 3 : 0}>{message.text}</Text>
                  )}

                  {/* Show associated post if exists */}
                  {associatedPost && (
                    <Box mt={2} maxW="300px">
                      <PostPreview post={associatedPost} />
                    </Box>
                  )}
                </Box>
              </Flex>
            );
          })
        ) : (
          <Flex justify="center" align="center" w="full" py={10}>
            <Text color="gray.500">No messages yet. Start a conversation!</Text>
          </Flex>
        )}
        <Box ref={msgRef}></Box>
      </VStack>
      <MessageInput />
    </Flex>
  );
};

export default ChatContainer;
