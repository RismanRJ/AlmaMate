import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  VStack,
  Flex,
  Avatar,
  Text,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorMode,
  Icon,
  Grid,
  GridItem,
  Badge,
  Spinner,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  useToast,
  FormHelperText,
  HStack,
  InputGroup,
  InputRightElement,
  Image,
  Heading,
  SimpleGrid,
  Divider,
  Wrap,
  WrapItem,
  Tag,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";

import {
  BiEdit,
  BiLogOut,
  BiCalendar,
  BiMailSend,
  BiLink,
  BiUserPin,
  BiTrash,
  BiBookAlt,
  BiTimeFive,
  BiUpload,
  BiX,
  BiMessageSquareDetail,
  BiCalendarCheck,
  BiBriefcase,
  BiCalendarEvent,
  BiPlus,
  BiTime,
  BiUser,
  BiEnvelope,
  BiPhone,
} from "react-icons/bi";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import PersonalExperience from "../components/PersonalExperience";

const ProfilePage = () => {
  const { authUser, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const fileInputRef = useRef();

  // Form state for edit profile
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    batch: "",
    avatar: "",
  });

  // Preview for uploaded image
  const [imagePreview, setImagePreview] = useState("");

  // State for batch year selection
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: 100 },
    (_, i) => currentYear - 60 + i
  );

  const [userStats, setUserStats] = useState([
    { label: "Connections", value: authUser.connections?.length || 0 },
    { label: "Posts", value: 0 },
    { label: "Likes", value: 0 },
  ]);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get(`/auth/profile/${authUser._id}`);
        const { user, posts } = res.data;

        const jobs = await axiosInstance.get(`dynamic/jobs`);
        const events = await axiosInstance.get(`dynamic/events`);

        setJobs(jobs.data.data);
        setEvents(events.data.data);

        console.log(jobs.data);

        setUserDetails({
          user,
          posts,
        });

        setUserStats([
          { label: "Connections", value: user.connections?.length || 0 },
          { label: "Posts", value: posts.length || 0 },
          {
            label: "Likes",
            value: posts.reduce((sum, post) => sum + post.likes.length, 0) || 0,
          },
        ]);

        // Initialize form data with current user details
        setFormData({
          name: user.name || "",
          email: user.email || "",
          role: user.role || "",
          batch: user.batch || "",
          avatar: user.avatar || "",
        });

        // If batch exists in format "YYYY-YYYY", parse it
        if (user.batch && user.batch.includes("-")) {
          const [start, end] = user.batch.split("-");
          setStartYear(start);
          setEndYear(end);
        }

        // Set image preview if avatar exists
        if (user.avatar) {
          setImagePreview(user.avatar);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // toast({
        //   title: "Error fetching profile",
        //   status: "error",
        //   duration: 3000,
        //   isClosable: true,
        // });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [authUser._id]);

  // Update endYear automatically when startYear changes
  useEffect(() => {
    if (startYear) {
      const calculatedEndYear = parseInt(startYear) + 4;
      setEndYear(calculatedEndYear.toString());
    }
  }, [startYear]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartYearChange = (e) => {
    setStartYear(e.target.value);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image (JPEG, PNG, GIF, WEBP)",
        status: "error",
        duration: 3000,
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 2MB",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result); // Set preview
            setFormData((prevData) => ({
              ...prevData,
              avatar: reader.result, // Set Base64 string in formData
            }));
          };
          reader.readAsDataURL(file); // Convert to Base64
        }
      };

      handleImageChange(e);

      toast({
        title: "Image Loaded successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error uploading image",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
      });
      // Reset preview on error
      setImagePreview(formData.avatar);
    } finally {
      setIsUploading(false);
    }
  };

  const clearImagePreview = () => {
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      avatar: "",
    }));
  };

  const handleUpdateProfile = async () => {
    // Validate and combine batch years
    let batchValue = "";
    if (startYear) {
      batchValue = `${startYear}-${endYear}`;
    }

    setIsLoading(true);
    try {
      const dataToUpdate = {
        ...formData,
        role: "student",
        batch: batchValue,
      };

      const res = await axiosInstance.put(
        `/auth/profile/${authUser._id}`,
        dataToUpdate
      );

      // Update local auth user state through the store
      updateUser(res.data.user);

      toast({
        title: "Profile updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Add your logout logic here
    // For example: logout(); navigate('/login');
  };

  // Handle edit post function
  const handleEditPost = (postId, navigatepage) => {
    console.log(
      `Editing post with ID: ${postId} , navigate to: ${navigatepage}`
    );
    navigate(`/${navigatepage}/${postId}`);
  };

  // Handle delete post function
  const handleDeletePost = async (postId) => {
    try {
      await axiosInstance.delete(`/dynamic/posts/${postId}`);
      // Refresh posts after deletion
      const updatedPosts = userDetails.posts.filter(
        (post) => post._id !== postId
      );
      setUserDetails({ ...userDetails, posts: updatedPosts });

      toast({
        title: "Post deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error deleting post",
        status: "error",
        duration: 3000,
      });
    }
  };

  if (isLoading && !userDetails) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box
      maxW="600px"
      mx="auto"
      py={6}
      px={4}
      minH="100vh"
      bg={colorMode === "dark" ? "gray.800" : "gray.50"}
    >
      <VStack spacing={6} align="stretch">
        {/* Profile Header */}
        <Box
          bg={colorMode === "dark" ? "gray.700" : "white"}
          boxShadow="lg"
          borderRadius="xl"
          p={6}
          textAlign="center"
        >
          <Flex direction="column" align="center" mb={4}>
            <Avatar
              size="2xl"
              src={authUser.avatar}
              mb={4}
              ring={4}
              ringColor={colorMode === "dark" ? "blue.400" : "blue.500"}
            />
            <Text
              fontWeight="bold"
              fontSize="xl"
              color={colorMode === "dark" ? "white" : "gray.800"}
            >
              {authUser.name}
            </Text>
            <Flex
              align="center"
              gap={2}
              mt={2}
              flexWrap="wrap"
              justify="center"
            >
              <Badge colorScheme="purple">{authUser.role || "Student"}</Badge>
              {authUser.batch && (
                <Badge colorScheme="green">Batch: {authUser.batch}</Badge>
              )}
              <Badge colorScheme="blue">
                {authUser.authType?.charAt(0).toUpperCase() +
                  authUser.authType?.slice(1) || "Local"}{" "}
                Account
              </Badge>
            </Flex>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.400" : "gray.500"}
              mt={2}
            >
              Joined {new Date(authUser.createdAt).toLocaleDateString()}
            </Text>
          </Flex>

          <Flex justify="center" gap={4} mt={4}>
            <Button
              leftIcon={<BiEdit />}
              colorScheme="blue"
              variant="outline"
              size="sm"
              onClick={onOpen}
            >
              Edit Profile
            </Button>
            <Button
              leftIcon={<BiLogOut />}
              colorScheme="red"
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Flex>
        </Box>

        {/* User Stats */}
        <Grid
          templateColumns="repeat(3, 1fr)"
          gap={4}
          bg={colorMode === "dark" ? "gray.700" : "white"}
          boxShadow="lg"
          borderRadius="xl"
          p={4}
        >
          {userStats.map((stat, index) => (
            <GridItem
              key={index}
              textAlign="center"
              borderRight={index < userStats.length - 1 ? "1px" : "none"}
              borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
              pr={index < userStats.length - 1 ? 4 : 0}
            >
              <Text
                fontWeight="bold"
                fontSize="lg"
                color={colorMode === "dark" ? "white" : "gray.800"}
              >
                {stat.value}
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.500"}
              >
                {stat.label}
              </Text>
            </GridItem>
          ))}
        </Grid>

        {/* Tabs for Profile Details */}
        <Box
          bg={colorMode === "dark" ? "gray.700" : "white"}
          boxShadow="lg"
          borderRadius="xl"
          overflow="hidden"
        >
          <Tabs
            isFitted
            variant="enclosed"
            colorScheme="blue"
            onChange={(index) => setActiveTab(index)}
          >
            <TabList
              mb="1em"
              borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
              borderRadius="lg"
              p={1}
              bg={colorMode === "dark" ? "gray.700" : "gray.50"}
            >
              <Tab
                _selected={{
                  bg: colorMode === "dark" ? "blue.600" : "blue.100",
                  color: colorMode === "dark" ? "white" : "blue.700",
                  fontWeight: "bold",
                  borderRadius: "md",
                }}
                borderRadius="md"
                transition="all 0.2s"
              >
                <Icon as={BiUserPin} mr={2} /> Profile
              </Tab>
              <Tab
                _selected={{
                  bg: colorMode === "dark" ? "blue.600" : "blue.100",
                  color: colorMode === "dark" ? "white" : "blue.700",
                  fontWeight: "bold",
                  borderRadius: "md",
                }}
                borderRadius="md"
                transition="all 0.2s"
              >
                <Icon as={BiCalendarEvent} mr={2} /> Activity
              </Tab>
              <Tab
                _selected={{
                  bg: colorMode === "dark" ? "blue.600" : "blue.100",
                  color: colorMode === "dark" ? "white" : "blue.700",
                  fontWeight: "bold",
                  borderRadius: "md",
                }}
                borderRadius="md"
                transition="all 0.2s"
              >
                <Icon as={BiBriefcase} mr={2} /> Jobs
              </Tab>
              <Tab
                _selected={{
                  bg: colorMode === "dark" ? "blue.600" : "blue.100",
                  color: colorMode === "dark" ? "white" : "blue.700",
                  fontWeight: "bold",
                  borderRadius: "md",
                }}
                borderRadius="md"
                transition="all 0.2s"
              >
                <Icon as={BiCalendarCheck} mr={2} /> Events
              </Tab>
            </TabList>

            <TabPanels>
              {/* Profile Panel */}
              <TabPanel>
                <Box
                  p={6}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderRadius="xl"
                  boxShadow="md"
                  border="1px"
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                >
                  <VStack spacing={5} align="stretch">
                    <HStack justify="space-between">
                      <Heading size="md" mb={4}>
                        Personal Information
                      </Heading>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <Flex
                        align="center"
                        gap={3}
                        p={3}
                        borderRadius="md"
                        bg={colorMode === "dark" ? "gray.600" : "blue.50"}
                      >
                        <Icon as={BiMailSend} color="blue.500" boxSize={5} />
                        <Box>
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.500"
                            }
                          >
                            Email
                          </Text>
                          <Text fontWeight="medium">{authUser.email}</Text>
                        </Box>
                      </Flex>

                      <Flex
                        align="center"
                        gap={3}
                        p={3}
                        borderRadius="md"
                        bg={colorMode === "dark" ? "gray.600" : "blue.50"}
                      >
                        <Icon as={BiBookAlt} color="blue.500" boxSize={5} />
                        <Box>
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.500"
                            }
                          >
                            Role
                          </Text>
                          <Text fontWeight="medium">
                            {authUser.role || "Student"}
                          </Text>
                        </Box>
                      </Flex>

                      {authUser.batch && (
                        <Flex
                          align="center"
                          gap={3}
                          p={3}
                          borderRadius="md"
                          bg={colorMode === "dark" ? "gray.600" : "blue.50"}
                        >
                          <Icon as={BiTimeFive} color="blue.500" boxSize={5} />
                          <Box>
                            <Text
                              fontSize="xs"
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.500"
                              }
                            >
                              Batch
                            </Text>
                            <Text fontWeight="medium">{authUser.batch}</Text>
                          </Box>
                        </Flex>
                      )}

                      <Flex
                        align="center"
                        gap={3}
                        p={3}
                        borderRadius="md"
                        bg={colorMode === "dark" ? "gray.600" : "blue.50"}
                      >
                        <Icon as={BiLink} color="blue.500" boxSize={5} />
                        <Box>
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.500"
                            }
                          >
                            Connections
                          </Text>
                          <Text fontWeight="medium">
                            {authUser.connections?.length || 0}
                          </Text>
                        </Box>
                      </Flex>
                    </SimpleGrid>
                  </VStack>
                </Box>
              </TabPanel>

              {/* Activity Panel */}
              <TabPanel>
                <Box
                  p={6}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderRadius="xl"
                  boxShadow="md"
                  border="1px"
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                >
                  <HStack justify="space-between" mb={4}>
                    <Heading size="md">Your Posts</Heading>
                    <Button
                      leftIcon={<BiPlus />}
                      colorScheme="blue"
                      size="sm"
                      onClick={() => navigate("/postcreation")}
                    >
                      New Post
                    </Button>
                  </HStack>

                  <Divider mb={4} />

                  {userDetails && userDetails.posts.length > 0 ? (
                    <VStack spacing={4} align="stretch">
                      {userDetails.posts.map((activity) => (
                        <Box
                          key={activity._id}
                          p={4}
                          bg={colorMode === "dark" ? "gray.600" : "gray.50"}
                          borderRadius="lg"
                          boxShadow="sm"
                          borderLeft="4px solid"
                          borderLeftColor="blue.400"
                          transition="transform 0.2s"
                          _hover={{ transform: "translateY(-2px)" }}
                        >
                          <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold" fontSize="md">
                                {activity.title}
                              </Text>
                              <HStack spacing={2}>
                                <Icon
                                  as={BiTime}
                                  color={
                                    colorMode === "dark"
                                      ? "blue.300"
                                      : "blue.500"
                                  }
                                />
                                <Text
                                  fontSize="sm"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.300"
                                      : "gray.600"
                                  }
                                >
                                  {new Date(
                                    activity.createdAt
                                  ).toLocaleDateString()}
                                </Text>
                              </HStack>
                            </VStack>

                            <HStack>
                              <Tooltip label="Edit post" placement="top">
                                <IconButton
                                  icon={<BiEdit />}
                                  size="sm"
                                  colorScheme="blue"
                                  variant="ghost"
                                  aria-label="Edit post"
                                  onClick={() =>
                                    handleEditPost(activity._id, "postcreation")
                                  }
                                />
                              </Tooltip>
                              <Tooltip label="Delete post" placement="top">
                                <IconButton
                                  icon={<BiTrash />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  aria-label="Delete post"
                                  onClick={() => handleDeletePost(activity._id)}
                                />
                              </Tooltip>
                            </HStack>
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Box
                      textAlign="center"
                      py={10}
                      bg={colorMode === "dark" ? "gray.600" : "gray.50"}
                      borderRadius="lg"
                    >
                      <Icon
                        as={BiMessageSquareDetail}
                        boxSize={12}
                        color={colorMode === "dark" ? "gray.400" : "gray.300"}
                      />
                      <Text
                        mt={3}
                        fontSize="lg"
                        fontWeight="medium"
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      >
                        No posts yet
                      </Text>
                      <Text
                        color={colorMode === "dark" ? "gray.400" : "gray.500"}
                      >
                        Share your first update with your network
                      </Text>
                      <Button mt={4} colorScheme="blue" leftIcon={<BiPlus />}>
                        Create a post
                      </Button>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              {/* Jobs Panel */}
              <TabPanel>
                <Box
                  p={6}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderRadius="xl"
                  boxShadow="md"
                  border="1px"
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                >
                  <HStack justify="space-between" mb={4}>
                    <Heading size="md">Your Job Postings</Heading>
                    <Button
                      leftIcon={<BiPlus />}
                      colorScheme="blue"
                      size="sm"
                      onClick={() => navigate("/jobpost")}
                    >
                      Post a New Job
                    </Button>
                  </HStack>

                  <Divider mb={4} />

                  {jobs.length > 0 ? (
                    <VStack spacing={6} align="stretch">
                      {jobs
                        .filter((j) => j.author === authUser._id)
                        .map((job) => (
                          <Box
                            key={job._id}
                            borderRadius="xl"
                            overflow="hidden"
                            boxShadow="md"
                            border="1px"
                            borderColor={
                              colorMode === "dark" ? "gray.600" : "gray.200"
                            }
                          >
                            <Box
                              p={5}
                              bg={colorMode === "dark" ? "blue.700" : "blue.50"}
                            >
                              <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                  <Heading size="md">{job.jobTitle}</Heading>
                                  <Text
                                    color={
                                      colorMode === "dark"
                                        ? "gray.300"
                                        : "gray.600"
                                    }
                                  >
                                    {job.companyName}
                                  </Text>
                                </VStack>
                                <HStack>
                                  <Tooltip label="Edit job" placement="top">
                                    <IconButton
                                      icon={<BiEdit />}
                                      colorScheme="blue"
                                      variant="ghost"
                                      aria-label="Edit job"
                                      onClick={() =>
                                        handleEditPost(job._id, "jobpost")
                                      }
                                    />
                                  </Tooltip>
                                  <Tooltip label="Delete job" placement="top">
                                    <IconButton
                                      icon={<BiTrash />}
                                      colorScheme="red"
                                      variant="ghost"
                                      aria-label="Delete job"
                                    />
                                  </Tooltip>
                                </HStack>
                              </HStack>

                              <HStack mt={3} spacing={2}>
                                <Badge
                                  colorScheme="blue"
                                  py={1}
                                  px={2}
                                  borderRadius="full"
                                >
                                  {job.jobType}
                                </Badge>
                                <Badge
                                  colorScheme="green"
                                  py={1}
                                  px={2}
                                  borderRadius="full"
                                >
                                  {job.experienceLevel}
                                </Badge>
                                {job.isRemote && (
                                  <Badge
                                    colorScheme="purple"
                                    py={1}
                                    px={2}
                                    borderRadius="full"
                                  >
                                    Remote
                                  </Badge>
                                )}
                              </HStack>
                            </Box>

                            <Accordion allowToggle>
                              <AccordionItem border="none">
                                <AccordionButton
                                  p={4}
                                  _hover={{
                                    bg:
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.50",
                                  }}
                                >
                                  <Box flex="1" textAlign="left">
                                    <Text fontWeight="medium">
                                      View Details
                                    </Text>
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel pb={4} px={5}>
                                  <SimpleGrid
                                    columns={{ base: 1, md: 2 }}
                                    spacing={4}
                                    mb={4}
                                  >
                                    <Box
                                      p={3}
                                      bg={
                                        colorMode === "dark"
                                          ? "gray.600"
                                          : "gray.50"
                                      }
                                      borderRadius="md"
                                    >
                                      <Text
                                        fontWeight="bold"
                                        color="blue.400"
                                        mb={1}
                                      >
                                        Location
                                      </Text>
                                      <Text>{job.location}</Text>
                                    </Box>
                                    <Box
                                      p={3}
                                      bg={
                                        colorMode === "dark"
                                          ? "gray.600"
                                          : "gray.50"
                                      }
                                      borderRadius="md"
                                    >
                                      <Text
                                        fontWeight="bold"
                                        color="blue.400"
                                        mb={1}
                                      >
                                        Salary
                                      </Text>
                                      <Text>{job.salary}</Text>
                                    </Box>
                                  </SimpleGrid>

                                  <VStack spacing={4} align="stretch">
                                    <Box
                                      p={3}
                                      bg={
                                        colorMode === "dark"
                                          ? "gray.600"
                                          : "gray.50"
                                      }
                                      borderRadius="md"
                                    >
                                      <Text
                                        fontWeight="bold"
                                        color="blue.400"
                                        mb={1}
                                      >
                                        Job Description
                                      </Text>
                                      <Text>{job.jobDescription}</Text>
                                    </Box>

                                    <Box
                                      p={3}
                                      bg={
                                        colorMode === "dark"
                                          ? "gray.600"
                                          : "gray.50"
                                      }
                                      borderRadius="md"
                                    >
                                      <Text
                                        fontWeight="bold"
                                        color="blue.400"
                                        mb={1}
                                      >
                                        Responsibilities
                                      </Text>
                                      <Text>{job.responsibilities}</Text>
                                    </Box>

                                    <Box
                                      p={3}
                                      bg={
                                        colorMode === "dark"
                                          ? "gray.600"
                                          : "gray.50"
                                      }
                                      borderRadius="md"
                                    >
                                      <Text
                                        fontWeight="bold"
                                        color="blue.400"
                                        mb={1}
                                      >
                                        Requirements
                                      </Text>
                                      <Text>{job.requirements}</Text>
                                    </Box>

                                    <Box
                                      p={3}
                                      bg={
                                        colorMode === "dark"
                                          ? "gray.600"
                                          : "gray.50"
                                      }
                                      borderRadius="md"
                                    >
                                      <Text
                                        fontWeight="bold"
                                        color="blue.400"
                                        mb={1}
                                      >
                                        Tech Stack
                                      </Text>
                                      <Wrap spacing={2} mt={2}>
                                        {job.techStack.map((tech, index) => (
                                          <WrapItem key={index}>
                                            <Tag
                                              colorScheme="blue"
                                              borderRadius="full"
                                            >
                                              {tech}
                                            </Tag>
                                          </WrapItem>
                                        ))}
                                      </Wrap>
                                    </Box>

                                    <Box
                                      p={3}
                                      bg={
                                        colorMode === "dark"
                                          ? "gray.600"
                                          : "gray.50"
                                      }
                                      borderRadius="md"
                                    >
                                      <Text
                                        fontWeight="bold"
                                        color="blue.400"
                                        mb={1}
                                      >
                                        Contact Information
                                      </Text>
                                      <SimpleGrid
                                        columns={{ base: 1, md: 2 }}
                                        spacing={3}
                                        mt={2}
                                      >
                                        <HStack>
                                          <Icon as={BiUser} color="blue.300" />
                                          <Text>{job.contactName}</Text>
                                        </HStack>
                                        <HStack>
                                          <Icon
                                            as={BiEnvelope}
                                            color="blue.300"
                                          />
                                          <Text>{job.contactEmail}</Text>
                                        </HStack>
                                        <HStack>
                                          <Icon as={BiPhone} color="blue.300" />
                                          <Text>{job.contactPhone}</Text>
                                        </HStack>
                                      </SimpleGrid>
                                    </Box>
                                  </VStack>
                                </AccordionPanel>
                              </AccordionItem>
                            </Accordion>
                          </Box>
                        ))}
                    </VStack>
                  ) : (
                    <Box
                      textAlign="center"
                      py={10}
                      bg={colorMode === "dark" ? "gray.600" : "gray.50"}
                      borderRadius="lg"
                    >
                      <Icon
                        as={BiBriefcase}
                        boxSize={12}
                        color={colorMode === "dark" ? "gray.400" : "gray.300"}
                      />
                      <Text
                        mt={3}
                        fontSize="lg"
                        fontWeight="medium"
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      >
                        No jobs posted yet
                      </Text>
                      <Text
                        color={colorMode === "dark" ? "gray.400" : "gray.500"}
                      >
                        Share job opportunities with your network
                      </Text>
                      <Button mt={4} colorScheme="blue" leftIcon={<BiPlus />}>
                        Post a Job
                      </Button>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              {/* Events Panel */}
              <TabPanel>
                <Box
                  p={6}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderRadius="xl"
                  boxShadow="md"
                  border="1px"
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                >
                  <HStack justify="space-between" mb={4}>
                    <Heading size="md">Your Events</Heading>
                    <Button
                      leftIcon={<BiPlus />}
                      colorScheme="blue"
                      size="sm"
                      onClick={() => navigate("/eventscheduler")}
                    >
                      Create Event
                    </Button>
                  </HStack>

                  <Divider mb={4} />

                  {events.length > 0 ? (
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                      {events
                        .filter((e) => e.author === authUser._id)
                        .map((event) => (
                          <Box
                            key={event._id}
                            borderRadius="xl"
                            overflow="hidden"
                            boxShadow="md"
                            border="1px"
                            borderColor={
                              colorMode === "dark" ? "gray.600" : "gray.200"
                            }
                            transition="transform 0.2s"
                            _hover={{ transform: "translateY(-2px)" }}
                          >
                            <Box
                              p={5}
                              bg={
                                colorMode === "dark"
                                  ? "purple.800"
                                  : "purple.50"
                              }
                              borderBottom="1px"
                              borderColor={
                                colorMode === "dark" ? "gray.600" : "gray.200"
                              }
                            >
                              <HStack justify="space-between">
                                <Heading size="md">{event.title}</Heading>
                                <HStack>
                                  <Tooltip label="Edit event" placement="top">
                                    <IconButton
                                      icon={<BiEdit />}
                                      colorScheme="purple"
                                      variant="ghost"
                                      aria-label="Edit event"
                                      onClick={() =>
                                        handleEditPost(
                                          event._id,
                                          "eventscheduler"
                                        )
                                      }
                                    />
                                  </Tooltip>
                                  <Tooltip label="Delete event" placement="top">
                                    <IconButton
                                      icon={<BiTrash />}
                                      colorScheme="red"
                                      variant="ghost"
                                      aria-label="Delete event"
                                    />
                                  </Tooltip>
                                </HStack>
                              </HStack>
                            </Box>

                            <Box
                              p={5}
                              bg={colorMode === "dark" ? "gray.700" : "white"}
                            >
                              <SimpleGrid
                                columns={{ base: 1, sm: 2 }}
                                spacing={4}
                                mb={4}
                              >
                                <Flex align="center" gap={2}>
                                  <Icon
                                    as={BiCalendar}
                                    color="purple.400"
                                    boxSize={5}
                                  />
                                  <Text>{event.date}</Text>
                                </Flex>
                                <Flex align="center" gap={2}>
                                  <Icon
                                    as={BiTime}
                                    color="purple.400"
                                    boxSize={5}
                                  />
                                  <Text>{event.time}</Text>
                                </Flex>
                              </SimpleGrid>

                              <VStack align="start" spacing={4} mt={4}>
                                <Box>
                                  <Text
                                    fontWeight="bold"
                                    mb={1}
                                    color="purple.400"
                                  >
                                    Description
                                  </Text>
                                  <Text>{event.description}</Text>
                                </Box>

                                <Box>
                                  <Text
                                    fontWeight="bold"
                                    mb={1}
                                    color="purple.400"
                                  >
                                    Chief Guest
                                  </Text>
                                  <Text>{event.chiefGuests}</Text>
                                </Box>
                              </VStack>

                              <Button
                                mt={4}
                                colorScheme="purple"
                                variant="outline"
                                width="full"
                              >
                                Event Details
                              </Button>
                            </Box>
                          </Box>
                        ))}
                    </SimpleGrid>
                  ) : (
                    <Box
                      textAlign="center"
                      py={10}
                      bg={colorMode === "dark" ? "gray.600" : "gray.50"}
                      borderRadius="lg"
                    >
                      <Icon
                        as={BiCalendarEvent}
                        boxSize={12}
                        color={colorMode === "dark" ? "gray.400" : "gray.300"}
                      />
                      <Text
                        mt={3}
                        fontSize="lg"
                        fontWeight="medium"
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      >
                        No events yet
                      </Text>
                      <Text
                        color={colorMode === "dark" ? "gray.400" : "gray.500"}
                      >
                        Create and share events with your network
                      </Text>
                      <Button mt={4} colorScheme="purple" leftIcon={<BiPlus />}>
                        Create Event
                      </Button>
                    </Box>
                  )}
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        <PersonalExperience id={authUser._id} />
      </VStack>

      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {/* Profile Image Upload */}
            <FormControl mb={6}>
              <FormLabel>Profile Image</FormLabel>
              <Flex direction="column" align="center">
                {imagePreview ? (
                  <Box position="relative" mb={3}>
                    <Image
                      src={imagePreview}
                      alt="Profile preview"
                      boxSize="150px"
                      objectFit="cover"
                      borderRadius="full"
                    />
                    <IconButton
                      icon={<BiX />}
                      size="sm"
                      colorScheme="red"
                      aria-label="Remove image"
                      position="absolute"
                      top={0}
                      right={0}
                      isRound
                      onClick={clearImagePreview}
                    />
                  </Box>
                ) : (
                  <Avatar size="xl" mb={3} />
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleFileChange}
                />

                <Button
                  leftIcon={<BiUpload />}
                  onClick={triggerFileInput}
                  size="sm"
                  colorScheme="blue"
                  isLoading={isUploading}
                >
                  Upload Image
                </Button>
                <FormHelperText textAlign="center">
                  Recommended: Square image, max 2MB
                </FormHelperText>
              </Flex>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formData.name.length > 0 ? formData.name : authUser.name}
                onChange={handleInputChange}
                placeholder="Your name"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                value={
                  formData.email.length > 0 ? formData.email : authUser.email
                }
                onChange={handleInputChange}
                placeholder="Your email"
                isReadOnly={authUser.authType !== "local"}
                // disabled
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Role</FormLabel>
              <Input value={authUser.role || "Student"} disabled />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Batch</FormLabel>
              <HStack spacing={2} align="center">
                <Select
                  value={startYear.length > 0 ? startYear : authUser.batch}
                  onChange={handleStartYearChange}
                  placeholder="Start Year"
                  width="50%"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
                <Text>-</Text>
                <InputGroup width="50%">
                  <Input value={endYear} isReadOnly placeholder="End Year" />
                  <InputRightElement width="4.5rem">
                    <Text fontSize="sm" color="gray.500">
                      +4 yrs
                    </Text>
                  </InputRightElement>
                </InputGroup>
              </HStack>
              <FormHelperText>
                Select start year (end year will be auto-calculated)
              </FormHelperText>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleUpdateProfile}
              isLoading={isLoading}
            >
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProfilePage;
