import React, { useState,useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  IconButton,
  Image,
  Input,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  Badge,
  Avatar,
  Center,
  AspectRatio,
  VStack,
  HStack,
} from "@chakra-ui/react";
import {
  Trash2,
  Upload,
  Film,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import { useToast } from "@chakra-ui/react";
import { useLocation, useParams } from "react-router-dom";
import { use } from "react";

import { useNavigate } from "react-router-dom";


const PostCreationForm = () => {
  const [post, setPost] = useState({
    title: "",
    description: "",
    media: [],
  });
  const navigate = useNavigate();


  const [isEditing, setIsEditing] = useState(false);
  const [postId, setPostId] = useState(null);

  const location = useLocation();
  const params = useParams();

  // const queryParams = new URLSearchParams(location.search);
  // const queryPostId = queryParams.get('postId');

  useEffect(() => {
    const postId = params.postId;
    setPostId(postId);
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axiosInstance.get(`dynamic/posts/${postId}`);
        const postData = res.data.data;
        console.log("postData", postData);
        if (postData) {
          setPost({
            title: postData.title,
            description: postData.description,
            media: postData.media,
          });
          
          // Set selectedFiles for the existing media
          if (postData.media && postData.media.length > 0) {
            const mediaFiles = postData.media.map(media => ({
              file: null, // We don't have the original file object
              preview: media.url,
              type: media.type,
              url: media.url
            }));
            setSelectedFiles(mediaFiles);
          }
          
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    }
    if(postId !=null){
    fetchPost();
    }

  }, [postId]);

  
  

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const { authUser, connections, getConnections } = useAuthStore();
  const toast = useToast();

  const handleTitleChange = (e) => {
    setPost({ ...post, title: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    setPost({ ...post, description: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Allow only one file

    if (!file) return;

    const isImage = file.type.startsWith("image/");

    if (!isImage) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Generate URL for preview
    const url = URL.createObjectURL(file);

    const newFile = {
      file,
      preview: url,
      type: "image",
      url: url,
    };

    // Update state: Allow only one image at a time
    setSelectedFiles([newFile]);

    setPost({
      ...post,
      media: [{ type: "image", url: url }], // Replace existing media with new one
    });
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    const removedFile = newFiles.splice(index, 1)[0];

    // Release object URL to avoid memory leaks
    URL.revokeObjectURL(removedFile.preview);

    setSelectedFiles(newFiles);

    // Also remove from post.media
    const newMedia = post.media.filter((_, i) => i !== index);
    setPost({ ...post, media: newMedia });

    // Adjust current index if needed
    if (currentMediaIndex >= newFiles.length && newFiles.length > 0) {
      setCurrentMediaIndex(newFiles.length - 1);
    }
  };

  const nextMedia = () => {
    if (currentMediaIndex < selectedFiles.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!post.title || !post.description) {
      toast({
        title: "Missing Fields",
        description: "Title and description are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "No Image Selected",
        description: "Please select an image to upload.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const file = selectedFiles[0].file; // Only allow 1 image
    const isImage = file.type.startsWith("image/");

    if (!isImage) {
      toast({
        title: "Invalid File",
        description: "Only images are allowed.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(file); // Convert image to Base64

    reader.onload = async () => {
      const base64Image = reader.result; // Base64 string

      const payload = {
        title: post.title,
        description: post.description,
        media: [
          {
            type: "image", // Only image is allowed
            url: base64Image, // Store Base64 as URL
          },
        ],
      };

      try {
        let res;
        console.log("payload",payload);
        // Check if we are editing or creating a new post
        if (isEditing) {
           res = await axiosInstance.put(`dynamic/posts/${postId}`, payload, {
            headers: { "Content-Type": "application/json" },
        });
      }else {
        // Create new post    
         res = await axiosInstance.post(`posts/create`, payload, {
          headers: { "Content-Type": "application/json" },
        });
      }

        if (res.status === 201) {
          setPost({ title: "", description: "", media: [] });
          setSelectedFiles([]); // Clear selected files
          setCurrentMediaIndex(0);

          toast({
            title: isEditing ? "Post Updated" : "Post Created",
            description: isEditing ? "Your post has been successfully updated." : "Your post has been successfully created.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          navigate("/");
        }
      } catch (error) {
        console.log(error);
        toast({
          title: "Error",
          description: "Failed to create post",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to convert image to Base64",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    };
  };

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");

  return (
    <Container maxW="6xl" py={4}>
      <Flex direction={{ base: "column", md: "row" }} gap={6}>
        {/* Form Section */}
        <Box
          w={{ base: "full", md: "50%" }}
          bg={bgColor}
          p={6}
          borderRadius="lg"
          boxShadow="md"
        >
          <Heading size="lg" mb={6} color={headingColor}>
            Create New Post
          </Heading>

          <FormControl mb={4}>
            <FormLabel color={textColor} fontWeight="medium">
              Title
            </FormLabel>
            <Input
              value={post.title}
              onChange={handleTitleChange}
              placeholder="Enter post title"
              focusBorderColor="blue.500"
            />
          </FormControl>

          <FormControl mb={6}>
            <FormLabel color={textColor} fontWeight="medium">
              Description
            </FormLabel>
            <Textarea
              value={post.description}
              onChange={handleDescriptionChange}
              placeholder="Describe your post"
              h="32"
              resize="none"
              focusBorderColor="blue.500"
            />
          </FormControl>

          <FormControl mb={6}>
            <FormLabel color={textColor} fontWeight="medium">
              Media
            </FormLabel>

            <Box
              borderWidth="2px"
              borderStyle="dashed"
              borderRadius="lg"
              p={4}
              textAlign="center"
              borderColor={borderColor}
              mb={4}
            >
              <Input
                type="file"
                id="fileInput"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                display="none"
              />
              <Center
                as="label"
                htmlFor="fileInput"
                cursor="pointer"
                flexDirection="column"
              >
                <Center
                  w="12"
                  h="12"
                  borderRadius="full"
                  bg={useColorModeValue("blue.100", "blue.900")}
                  mb={3}
                >
                  <Upload
                    color={useColorModeValue("blue.600", "blue.300")}
                    size={24}
                  />
                </Center>
                <Text color={textColor} mb={1}>
                  Drag and drop files, or click to browse
                </Text>
                <Text
                  fontSize="sm"
                  color={useColorModeValue("gray.500", "gray.400")}
                >
                  Support images and videos
                </Text>
              </Center>
            </Box>

            {selectedFiles.length > 0 && (
              <Grid
                templateColumns={{
                  base: "repeat(2, 1fr)",
                  sm: "repeat(3, 1fr)",
                }}
                gap={3}
              >
                {selectedFiles.map((file, index) => (
                  <Box key={index} position="relative" role="group">
                    <Box
                      h="20"
                      borderRadius="md"
                      overflow="hidden"
                      bg={useColorModeValue("gray.100", "gray.700")}
                    >
                      {file.type === "image" ? (
                        <Image
                          src={file.preview}
                          alt={`Preview ${index}`}
                          w="full"
                          h="full"
                          objectFit="cover"
                        />
                      ) : (
                        <Center h="full">
                          <Film
                            color={useColorModeValue("gray.500", "gray.400")}
                            size={24}
                          />
                        </Center>
                      )}
                    </Box>
                    <IconButton
                      icon={<Trash2 size={16} />}
                      aria-label="Remove file"
                      position="absolute"
                      top="-2"
                      right="-2"
                      colorScheme="red"
                      borderRadius="full"
                      size="xs"
                      onClick={() => removeFile(index)}
                      opacity="0"
                      _groupHover={{ opacity: 1 }}
                      transition="opacity 0.2s"
                    />
                  </Box>
                ))}
                <Center
                  as="label"
                  htmlFor="fileInput"
                  h="20"
                  borderWidth="2px"
                  borderStyle="dashed"
                  borderRadius="md"
                  borderColor={borderColor}
                  cursor="pointer"
                >
                  <Plus
                    color={useColorModeValue("gray.500", "gray.400")}
                    size={24}
                  />
                </Center>
              </Grid>
            )}
          </FormControl>

          <Button
            onClick={handleSubmit}
            w="full"
            colorScheme="blue"
            py={2}
            px={4}
            borderRadius="md"
            fontWeight="medium"
          >
            {isEditing ? "Update Post" : "Create Post"}
          </Button>
        </Box>

        {/* Preview Section */}
        <Box
          w={{ base: "full", md: "50%" }}
          bg={bgColor}
          p={6}
          borderRadius="lg"
          boxShadow="md"
        >
          <Heading size="lg" mb={6} color={headingColor}>
            Preview
          </Heading>

          <Box
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            borderColor={useColorModeValue("gray.200", "gray.700")}
          >
            <Box p={4}>
              <Flex alignItems="center" gap={3} mb={3}>
                <Avatar
                  size="md"
                  bg={useColorModeValue("gray.200", "gray.700")}
                />
                <Box>
                  <Text fontWeight="medium" color={headingColor}>
                    User Name
                  </Text>
                  <Text
                    fontSize="xs"
                    color={useColorModeValue("gray.500", "gray.400")}
                  >
                    Just now
                  </Text>
                </Box>
              </Flex>

              {post.title && (
                <Heading as="h2" size="md" mb={2} color={headingColor}>
                  {post.title}
                </Heading>
              )}

              {post.description && (
                <Text color={textColor} mb={4}>
                  {post.description}
                </Text>
              )}

              {selectedFiles.length > 0 && (
                <Box mb={4} position="relative">
                  <Box
                    borderRadius="lg"
                    overflow="hidden"
                    bg={useColorModeValue("gray.100", "gray.700")}
                    h="80"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {selectedFiles[currentMediaIndex].type === "image" ? (
                      <Image
                        src={selectedFiles[currentMediaIndex].preview}
                        alt="Preview"
                        w="full"
                        h="full"
                        objectFit="contain"
                      />
                    ) : (
                      <AspectRatio w="full" ratio={16 / 9}>
                        <video
                          src={selectedFiles[currentMediaIndex].preview}
                          controls
                          style={{
                            objectFit: "contain",
                            width: "100%",
                            height: "100%",
                          }}
                        />
                      </AspectRatio>
                    )}
                  </Box>

                  {selectedFiles.length > 1 && (
                    <>
                      <Badge
                        position="absolute"
                        top="4"
                        right="4"
                        bg="blackAlpha.700"
                        color="white"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {currentMediaIndex + 1}/{selectedFiles.length}
                      </Badge>

                      <IconButton
                        icon={<ChevronLeft size={24} />}
                        aria-label="Previous media"
                        position="absolute"
                        left="2"
                        top="50%"
                        transform="translateY(-50%)"
                        bg="blackAlpha.500"
                        color="white"
                        isRound
                        onClick={prevMedia}
                        isDisabled={currentMediaIndex === 0}
                        opacity={currentMediaIndex === 0 ? 0.5 : 1}
                        _hover={{ bg: "blackAlpha.700" }}
                      />

                      <IconButton
                        icon={<ChevronRight size={24} />}
                        aria-label="Next media"
                        position="absolute"
                        right="2"
                        top="50%"
                        transform="translateY(-50%)"
                        bg="blackAlpha.500"
                        color="white"
                        isRound
                        onClick={nextMedia}
                        isDisabled={
                          currentMediaIndex === selectedFiles.length - 1
                        }
                        opacity={
                          currentMediaIndex === selectedFiles.length - 1
                            ? 0.5
                            : 1
                        }
                        _hover={{ bg: "blackAlpha.700" }}
                      />

                      <HStack justify="center" spacing={1} mt={2}>
                        {selectedFiles.map((_, index) => (
                          <Box
                            key={index}
                            as="button"
                            w="2"
                            h="2"
                            borderRadius="full"
                            bg={
                              currentMediaIndex === index
                                ? "blue.500"
                                : useColorModeValue("gray.300", "gray.600")
                            }
                            onClick={() => setCurrentMediaIndex(index)}
                          />
                        ))}
                      </HStack>
                    </>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Flex>
    </Container>
  );
};

export default PostCreationForm;
