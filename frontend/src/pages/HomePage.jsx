import React, { useEffect, useState, useRef } from "react";
import { useSearchStore } from "../../store/useSearchStore";
import {
  Box,
  Text,
  Avatar,
  Button,
  Flex,
  VStack,
  IconButton,
  Divider,
  useColorMode,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Textarea,
  useDisclosure,
  Collapse,
  FormControl,
  FormErrorMessage,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  BiLike,
  BiComment,
  BiShare,
  BiSend,
  BiDotsVertical,
  BiEdit,
  BiTrash,
  BiX,
  BiReply,
} from "react-icons/bi";
import { AiFillLike } from "react-icons/ai";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../../store/useAuthStore";
import CommentItemInput from "../components/CommentItemInput";
import ShareModal from "../components/ShareModal";

const fetchAllPosts = async (pageParam) => {
  try {
    const res = await axiosInstance.get(
      `/posts/getAll?pageNumber=${pageParam}&limit=10`
    );

    const { posts, totalPages } = res.data;

    return { posts, nextPage: pageParam + 1, totalPages };
  } catch (error) {
    console.log(error);
    throw new Error("Error fetching posts");
  }
};

const HomePage = () => {
  const navigate = useNavigate();
  const { authUser, connections, getConnections } = useAuthStore();
  const { searchedUsers, isSearching } = useSearchStore();
  const { colorMode } = useColorMode();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likePost, setLikePost] = useState(false);
  const [allConnections, setAllConnections] = useState([]);

  // Comment state
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [showComments, setShowComments] = useState({});

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);

  // Image preview modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Refs
  const editInputRef = useRef(null);

  const loadPosts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await fetchAllPosts(page);
      console.log(data);

      setPosts((prevPosts) => {
        data.posts.forEach((post) => {
          if (prevPosts.find((p) => p._id === post._id)) return;
          else prevPosts.push(post);
        });
        return prevPosts;
      });
      if (data.nextPage <= data.totalPages) {
        setPage((prevPage) => prevPage + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToProfile = (id) => {
    navigate("/profile", { state: { id } });
  };

  const handleLikePost = async (postId) => {
    try {
      const res = await axiosInstance.get(`/posts/${postId}/like`);
      const { post } = res.data;
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === post._id ? post : p))
      );

      setLikePost(!likePost);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleUnlikePost = async (postId) => {
    try {
      const res = await axiosInstance.get(`/posts/${postId}/unlike`);
      const { post } = res.data;
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === post._id ? post : p))
      );

      setLikePost(!likePost);
    } catch (error) {
      console.error("Error unliking post:", error);
    }
  };

  // Image preview handlers
  const handleOpenImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  // Comment handlers
  const toggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleStartEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditCommentText(comment.text);
  };

  const handleCancelEditComment = () => {
    setEditingComment(null);
    setEditCommentText("");
  };

  const checkThisPostAuthorHasConnectionWithTheCurretntUser = (
    postAuthorId
  ) => {
    const myUserId = authUser._id;

    const authorUser = connections.find((user) => user._id === postAuthorId);
    if (!authorUser) return false;

    const acceptedConnections = authorUser.connections.filter(
      (conn) => conn.status === "accepted" || conn.status === "pending"
    );

    const isConnectedWithMe = acceptedConnections.some(
      (conn) =>
        (conn.senderId === postAuthorId && conn.receiverId === myUserId) ||
        (conn.senderId === myUserId && conn.receiverId === postAuthorId)
    );

    console.log(isConnectedWithMe);

    return !isConnectedWithMe;
  };

  const UpdateConnections = (postAuthorId) => {
    const myUserId = authUser._id;

    // Clone the connections state to avoid direct mutation
    const updatedConnections = [...connections];

    // Find index of the receiver
    const receiverIndex = updatedConnections.findIndex(
      (user) => user._id === receiverId
    );

    if (receiverIndex === -1) {
      console.log("Receiver not found in connections");
      return;
    }

    const receiver = updatedConnections[receiverIndex];

    // Check if the connection already exists
    const alreadyExists = receiver.connections.some(
      (conn) =>
        (conn.senderId === myUserId && conn.receiverId === receiverId) ||
        (conn.senderId === receiverId && conn.receiverId === myUserId)
    );

    if (alreadyExists) {
      console.log("Connection already exists or request already sent");
      return;
    }

    // Add the new pending connection
    receiver.connections.push({
      senderId: myUserId,
      receiverId: receiverId,
      status: "pending",
    });

    // Update the state
    setConnections(updatedConnections);

    console.log("Follow request sent and state updated!");
  };

  const handleUpdateComment = async (postId, commentId) => {
    if (!editCommentText.trim()) {
      return;
    }

    try {
      const res = await axiosInstance.put(
        `/posts/${postId}/comment/${commentId}`,
        {
          comment: editCommentText,
        }
      );

      const { post } = res.data;
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === post._id ? post : p))
      );

      setEditingComment(null);
      setEditCommentText("");
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const res = await axiosInstance.delete(
        `/posts/${postId}/comment/${commentId}`
      );
      const { comments } = res.data;
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === postId ? { ...p, comments } : p))
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleStartReply = (comment) => {
    setReplyingTo(comment._id);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  const handleAddReply = async (postId, commentId) => {
    if (!replyText.trim()) {
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/posts/${postId}/comment/${commentId}/reply`,
        {
          text: replyText,
        }
      );

      const { post } = res.data;
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === post._id ? post : p))
      );

      setReplyingTo(null);
      setReplyText("");
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };
  const handleOpenShareModal = (postId) => {
    setCurrentPostId(postId);
    setIsShareModalOpen(true);
  };

  const handleFollowUser = async (userId) => {
    try {
      const res = await axiosInstance.post("/connect", {
        userId: authUser._id,
        targetUserId: userId,
      });
      if (res.data.status === "success") {
        UpdateConnections(userId);
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  useEffect(() => {
    const fetchConnnections = async () => {
      const connections = await getConnections(authUser._id);
      setAllConnections(connections);
    };
    fetchConnnections();
    loadPosts();
  }, []);

  const handleScroll = async (event) => {
    const { scrollHeight, scrollTop, clientHeight } = event.target;
    if (scrollHeight - scrollTop <= clientHeight + 5) {
      await loadPosts();
    }
  };

  // Comments component for cleaner code
  const CommentItem = ({ comment, post }) => {
    return (
      <Box mt={2} pl={comment.reply ? 8 : 0}>
        <Flex gap={2} alignItems="flex-start">
          <VStack>
            <Avatar
              size="xs"
              src={
                comment.user?.avatar ||
                "https://avatars.dicebear.com/api/human/default.svg"
              }
            />
            <Text fontWeight="bold" fontSize="sm">
              {comment.user?.name}
            </Text>
          </VStack>
          <Box
            bg={colorMode === "dark" ? "gray.600" : "gray.100"}
            px={3}
            py={2}
            borderRadius="lg"
            flex="1"
          >
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontWeight="bold" fontSize="sm">
                {comment.comment}
              </Text>
              {comment.user?._id === authUser?._id && (
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<BiDotsVertical />}
                    variant="ghost"
                    size="xs"
                    aria-label="Comment options"
                  />
                  <MenuList fontSize="sm">
                    <MenuItem
                      icon={<BiEdit />}
                      onClick={() => handleStartEditComment(comment)}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem
                      icon={<BiTrash />}
                      color="red.500"
                      onClick={() => handleDeleteComment(post._id, comment._id)}
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              )}
            </Flex>

            {editingComment === comment._id ? (
              <Box mt={1}>
                <InputGroup size="sm">
                  <Textarea
                    value={editCommentText}
                    onChange={(e) => {
                      setEditCommentText(e.target.value);
                    }}
                    size="sm"
                    resize="none"
                    rows={2}
                  />
                </InputGroup>
                <Flex mt={1} justifyContent="flex-end">
                  <Button
                    size="xs"
                    variant="ghost"
                    mr={1}
                    onClick={handleCancelEditComment}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="xs"
                    colorScheme="blue"
                    onClick={() => handleUpdateComment(post._id, comment._id)}
                  >
                    Save
                  </Button>
                </Flex>
              </Box>
            ) : (
              <>
                <Text fontSize="sm">{comment.text}</Text>
                {!comment.reply && (
                  <Button
                    variant="ghost"
                    size="xs"
                    leftIcon={<BiReply />}
                    mt={1}
                    onClick={() => handleStartReply(comment)}
                  >
                    Reply
                  </Button>
                )}
              </>
            )}
          </Box>
        </Flex>

        {/* Reply input */}
        {replyingTo === comment._id && (
          <Box pl={8} mt={2}>
            <InputGroup size="sm">
              <Input
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                pr="4.5rem"
              />
              <InputRightElement width="4.5rem">
                <Flex>
                  <IconButton
                    icon={<BiX />}
                    size="xs"
                    aria-label="Cancel reply"
                    onClick={handleCancelReply}
                  />
                  <IconButton
                    icon={<BiSend />}
                    size="xs"
                    colorScheme="blue"
                    aria-label="Send reply"
                    ml={1}
                    onClick={() => handleAddReply(post._id, comment._id)}
                  />
                </Flex>
              </InputRightElement>
            </InputGroup>
          </Box>
        )}

        {/* Display replies */}
        {comment.reply && comment.reply.length > 0 && (
          <VStack spacing={2} alignItems="stretch" pl={8} mt={2}>
            {comment.reply.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={{ ...reply, reply: true }}
                post={post}
              />
            ))}
          </VStack>
        )}
      </Box>
    );
  };

  if (loading && posts.length === 0) return <Text>Loading...</Text>;

  return (
    <Box
      maxW="600px"
      mx="auto"
      py={6}
      px={4}
      minH="100vh"
      bg={colorMode === "dark" ? "gray.800" : "gray.50"}
      onScroll={handleScroll}
      height={["auto", "100vh"]}
    >
      {/* Search Results */}
      {searchedUsers && (
        <Box
          bg={colorMode === "dark" ? "gray.700" : "white"}
          boxShadow="lg"
          borderRadius="xl"
          position="absolute"
          zIndex={10}
          width="100%"
          maxW="600px"
          left="50%"
          transform="translateX(-50%)"
          overflow="hidden"
        >
          {searchedUsers
            .filter((user) => user._id !== authUser._id)
            .map((user) => (
              <Flex
                key={user._id}
                p={4}
                _hover={{ bg: colorMode === "dark" ? "gray.600" : "gray.50" }}
                cursor="pointer"
                onClick={() => handleGoToProfile(user._id)}
                borderBottom="1px"
                borderColor={colorMode === "dark" ? "gray.600" : "gray.100"}
                align="center"
              >
                <Text>{user.name}</Text>
              </Flex>
            ))}
          {/* {searchedUsers.length === 0 && (
            <Text
              p={4}
              textAlign="center"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              No Users found
            </Text>
          )} */}
        </Box>
      )}

      {/* Image Preview Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={handleCloseImageModal}
        size="xl"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
        <ModalContent bg="transparent" boxShadow="none" mx={4}>
          <ModalCloseButton
            color="white"
            bg="blackAlpha.600"
            borderRadius="full"
            size="lg"
            _hover={{ bg: "blackAlpha.700" }}
          />
          <ModalBody
            p={0}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Image
              src={selectedImage}
              alt="Post image"
              maxH="90vh"
              borderRadius="md"
              objectFit="contain"
              boxShadow="dark-lg"
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Posts */}
      <VStack spacing={6} mt={4} alignItems="stretch">
        {posts?.map((post, index) => (
          <Box
            key={post._id}
            bg={colorMode === "dark" ? "gray.700" : "white"}
            boxShadow="lg"
            borderRadius="xl"
            w="100%"
            overflow="hidden"
            transition="all 0.2s"
            _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
            style={{ marginBottom: index === posts.length - 1 ? "80px" : "0" }}
          >
            <Flex p={4} align="center" justify="space-between">
              <Flex align="center" gap={3}>
                <Avatar
                  src={
                    post.author.avatar ||
                    "https://avatars.dicebear.com/api/human/default.svg"
                  }
                  size="md"
                  ring={2}
                  ringColor={colorMode === "dark" ? "blue.400" : "blue.500"}
                />
                <Box>
                  <Text
                    fontWeight="bold"
                    fontSize="md"
                    color={colorMode === "dark" ? "white" : "gray.800"}
                  >
                    {post.author.name}
                  </Text>
                </Box>
              </Flex>
              {post.author._id !== authUser._id &&
                checkThisPostAuthorHasConnectionWithTheCurretntUser(
                  post.author._id
                ) && (
                  <Button
                    size="sm"
                    colorScheme="blue"
                    borderRadius="full"
                    _hover={{ transform: "translateY(-1px)" }}
                    onClick={() => handleFollowUser(post.author._id)}
                  >
                    Follow
                  </Button>
                )}
            </Flex>

            <Box p={4} pt={0}>
              <Text
                color={colorMode === "dark" ? "gray.100" : "gray.700"}
                fontSize="md"
                lineHeight="tall"
                mb={post.image ? 4 : 0}
              >
                {post.description}
              </Text>

              {/* Post Image */}
              {post.media && (
                <Box
                  mt={2}
                  borderRadius="md"
                  overflow="hidden"
                  cursor="pointer"
                  onClick={() => handleOpenImageModal(post.media[0].url)}
                  position="relative"
                  _hover={{
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      bg: "blackAlpha.200",
                    },
                  }}
                >
                  <Image
                    src={post.media[0].url}
                    alt="Post image"
                    w="100%"
                    objectFit="contain"
                    maxH="200px"
                  />
                </Box>
              )}
            </Box>

            <Divider
              borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
            />

            <Flex p={4} justify="space-between" align="center">
              <Flex align="center" gap={2}>
                <IconButton
                  icon={
                    post.likes.find((p) => p._id == authUser._id) ? (
                      <AiFillLike />
                    ) : (
                      <BiLike />
                    )
                  }
                  variant="ghost"
                  aria-label="Like"
                  colorScheme="blue"
                  _hover={{
                    bg: colorMode === "dark" ? "blue.800" : "blue.50",
                  }}
                  onClick={
                    post.likes.find((p) => p._id == authUser._id)
                      ? () => handleUnlikePost(post._id)
                      : () => handleLikePost(post._id)
                  }
                />
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.500"}
                >
                  {post.likes.length}
                </Text>
              </Flex>

              <Flex align="center" gap={2}>
                <IconButton
                  icon={<BiComment />}
                  variant="ghost"
                  aria-label="Comment"
                  colorScheme="blue"
                  _hover={{
                    bg: colorMode === "dark" ? "blue.800" : "blue.50",
                  }}
                  onClick={() => toggleComments(post._id)}
                />
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.500"}
                >
                  {post.comments.length}
                </Text>
              </Flex>

              <IconButton
                icon={<BiShare />}
                variant="ghost"
                aria-label="Share"
                colorScheme="blue"
                _hover={{ bg: colorMode === "dark" ? "blue.800" : "blue.50" }}
                onClick={() => handleOpenShareModal(post._id)}
              />
            </Flex>

            {/* Comments section */}
            <Collapse in={showComments[post._id]} animateOpacity>
              <Box p={4} pt={0}>
                <Divider
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  mb={4}
                />

                {/* Add comment */}
                <CommentItemInput
                  key={post._id}
                  setShowComments={setShowComments}
                  setPosts={setPosts}
                  post={post}
                />

                {/* Comments list */}
                <VStack spacing={3} mt={4} alignItems="stretch" pb={10}>
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                      <CommentItem
                        key={comment._id}
                        comment={comment}
                        post={post}
                      />
                    ))
                  ) : (
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      No comments yet. Be the first to comment!
                    </Text>
                  )}
                </VStack>
              </Box>
            </Collapse>
          </Box>
        ))}

        {/* Loading indicator at the bottom */}
        {loading && posts.length > 0 && (
          <Box textAlign="center" w="100%" py={4}>
            <Text>Loading more posts...</Text>
          </Box>
        )}

        {isShareModalOpen && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            postId={currentPostId}
            authUser={authUser}
          />
        )}
      </VStack>
    </Box>
  );
};

export default HomePage;
