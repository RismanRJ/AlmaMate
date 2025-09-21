import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Textarea,
  useColorModeValue,
  HStack,
  VStack,
  InputGroup,
  InputRightElement,
  Badge,
} from "@chakra-ui/react";
import { useAuthStore } from "../../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useLocation, useParams } from "react-router-dom";

const JobPostingForm = () => {
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    companyDescription: "",
    jobType: "full-time",
    experienceLevel: "entry",
    location: "",
    isRemote: false,
    salary: "",
    jobDescription: "",
    responsibilities: "",
    requirements: "",
    techStack: [],
    techStackInput: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const [preview, setPreview] = useState(false);
  const { authUser, connections, getConnections } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [jobId, setJobId] = useState(null);

  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    const postId = params.jobId;
    setJobId(postId);
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axiosInstance.get(`dynamic/jobs/${jobId}`);
        const postData = res.data.data;
        console.log("postData", postData);
        if (postData) {
          setFormData(postData);
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    }
    if (jobId != null) {
      fetchJobs();
    }

  }, [jobId]);

  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleTechStackAdd = () => {
    if (formData.techStackInput.trim()) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, formData.techStackInput.trim()],
        techStackInput: "",
      });
    }
  };

  const handleTechStackRemove = (index) => {
    const newTechStack = [...formData.techStack];
    newTechStack.splice(index, 1);
    setFormData({
      ...formData,
      techStack: newTechStack,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTechStackAdd();
    }
  };

  const togglePreview = () => {
    setPreview(!preview);
  };

  // Add submit handler function
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("uaer", authUser);
      formData.author = authUser._id;
      console.log("Post data submitted:", formData);
      let res;
      if (isEditing) {
        const { _id, ...filteredFormData } = formData;
        res = await axiosInstance.put(`dynamic/jobs/${jobId}`, filteredFormData);
      } else {

        res = await axiosInstance.post(`dynamic/jobs`, formData);
      }
      if (res.status === 201) {
        toast({
          title: isEditing ? "Job Updated Successfully" : "Job posting submitted",
          description: isEditing ? "Your job posting has been successfully updated." : "Your job posting has been successfully submitted.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setFormData({
          jobTitle: "",
          companyName: "",
          companyDescription: "",
          jobType: "full-time",
          experienceLevel: "entry",
          location: "",
          isRemote: false,
          salary: "",
          jobDescription: "",
          responsibilities: "",
          requirements: "",
          techStack: [],
          techStackInput: "",
          contactName: "",
          contactEmail: "",
          contactPhone: "",
        });
        navigate("/jobs");
      }
    } catch (error) {
      console.log(error);
      throw new Error("Error Posting events");
    }
  };

  // Chakra UI color mode values
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "white");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.400");

  const techTagBg = useColorModeValue("blue.100", "blue.900");
  const techTagColor = useColorModeValue("blue.800", "blue.200");

  const jobTypeBg = useColorModeValue("blue.100", "blue.900");
  const jobTypeColor = useColorModeValue("blue.800", "blue.200");

  const remoteBg = useColorModeValue("green.100", "green.900");
  const remoteColor = useColorModeValue("green.800", "green.200");

  return (
    <Container
      maxW="4xl"
      p={4}
      bg={bgColor}
      color={textColor}
      borderRadius="lg"
    >
      <Heading as="h1" size="xl" textAlign="center" mb={6}>
        Job & Internship Posting Form
      </Heading>

      <Flex justifyContent="flex-end" mb={6}>
        <Button onClick={togglePreview} colorScheme="blue">
          {preview ? "Edit Form" : "Preview"}
        </Button>
      </Flex>

      {!preview ? (
        <form onSubmit={handleSubmit}>
          <Stack spacing={6}>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <FormControl isRequired>
                <FormLabel fontWeight="medium">Job Title</FormLabel>
                <Input
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  bg={cardBgColor}
                  borderColor={borderColor}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="medium">Company Name</FormLabel>
                <Input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  bg={cardBgColor}
                  borderColor={borderColor}
                />
              </FormControl>
            </Grid>

            <FormControl isRequired>
              <FormLabel fontWeight="medium">Company Description</FormLabel>
              <Textarea
                name="companyDescription"
                value={formData.companyDescription}
                onChange={handleChange}
                rows={3}
                bg={cardBgColor}
                borderColor={borderColor}
              />
            </FormControl>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={6}>
              <FormControl isRequired>
                <FormLabel fontWeight="medium">Job Type</FormLabel>
                <Select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  bg={cardBgColor}
                  borderColor={borderColor}
                >
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="medium">Experience Level</FormLabel>
                <Select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  bg={cardBgColor}
                  borderColor={borderColor}
                >
                  <option value="entry">Entry Level (0-2 years)</option>
                  <option value="mid">Mid Level (3-5 years)</option>
                  <option value="senior">Senior Level (5+ years)</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium">Salary Range</FormLabel>
                <Input
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g., $60,000 - $80,000"
                  bg={cardBgColor}
                  borderColor={borderColor}
                />
              </FormControl>
            </Grid>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <FormControl isRequired>
                <FormLabel fontWeight="medium">Location</FormLabel>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., New York, NY"
                  bg={cardBgColor}
                  borderColor={borderColor}
                />
              </FormControl>

              <Flex alignItems="center" h="full">
                <Checkbox
                  id="isRemote"
                  name="isRemote"
                  isChecked={formData.isRemote}
                  onChange={handleChange}
                  colorScheme="green"
                  size="lg"
                  mt={{ base: 0, md: 8 }}
                >
                  Remote Work Available
                </Checkbox>
              </Flex>
            </Grid>

            <FormControl isRequired>
              <FormLabel fontWeight="medium">Job Description</FormLabel>
              <Textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                rows={4}
                bg={cardBgColor}
                borderColor={borderColor}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="medium">Key Responsibilities</FormLabel>
              <Textarea
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                rows={4}
                placeholder="Enter key responsibilities (one per line)"
                bg={cardBgColor}
                borderColor={borderColor}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="medium">
                Requirements & Qualifications
              </FormLabel>
              <Textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                placeholder="Enter requirements (one per line)"
                bg={cardBgColor}
                borderColor={borderColor}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="medium">Tech Stack</FormLabel>
              <InputGroup>
                <Input
                  name="techStackInput"
                  value={formData.techStackInput}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a technology and press Enter"
                  bg={cardBgColor}
                  borderColor={borderColor}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={handleTechStackAdd}
                    colorScheme="blue"
                  >
                    Add
                  </Button>
                </InputRightElement>
              </InputGroup>

              <Flex wrap="wrap" mt={2} gap={2}>
                {formData.techStack.map((tech, index) => (
                  <Tag
                    key={index}
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    bg={techTagBg}
                    color={techTagColor}
                  >
                    <TagLabel>{tech}</TagLabel>
                    <TagCloseButton
                      onClick={() => handleTechStackRemove(index)}
                    />
                  </Tag>
                ))}
              </Flex>
            </FormControl>

            <Divider borderColor={borderColor} />

            <Box pt={6}>
              <Heading as="h2" size="md" mb={4}>
                Contact Information
              </Heading>

              <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
                gap={6}
              >
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Contact Name</FormLabel>
                  <Input
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    bg={cardBgColor}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Contact Email</FormLabel>
                  <Input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    bg={cardBgColor}
                    borderColor={borderColor}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">Contact Phone</FormLabel>
                  <Input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    bg={cardBgColor}
                    borderColor={borderColor}
                  />
                </FormControl>
              </Grid>
            </Box>

            <Flex justifyContent="flex-end" gap={4} mt={4}>
              <Button
                variant="outline"
                colorScheme="gray"
                type="button"
                onClick={() => navigate("/jobs")}
              >
                Back
              </Button>
              <Button type="submit" colorScheme="green">
                {isEditing ? "Update Job" : "Create Job"}
              </Button>
            </Flex>
          </Stack>
        </form>
      ) : (
        <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md">
          <Flex
            justifyContent="space-between"
            alignItems="center"
            mb={6}
            flexWrap="wrap"
          >
            <Box>
              <Heading as="h2" size="lg" color="blue.500" mb={1}>
                {formData.jobTitle || "Job Title"}
              </Heading>
              <Text fontSize="lg">
                {formData.companyName || "Company Name"}
              </Text>
            </Box>
            <Box textAlign="right">
              <Badge
                px={3}
                py={1}
                bg={jobTypeBg}
                color={jobTypeColor}
                borderRadius="full"
                mb={2}
                mr={formData.isRemote ? 2 : 0}
              >
                {formData.jobType === "full-time"
                  ? "Full-Time"
                  : formData.jobType === "part-time"
                    ? "Part-Time"
                    : formData.jobType === "contract"
                      ? "Contract"
                      : "Internship"}
              </Badge>
              {formData.isRemote && (
                <Badge
                  px={3}
                  py={1}
                  bg={remoteBg}
                  color={remoteColor}
                  borderRadius="full"
                >
                  Remote Available
                </Badge>
              )}
            </Box>
          </Flex>

          <Grid
            templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
            gap={6}
            mb={6}
          >
            <Box>
              <Text fontWeight="medium" color={secondaryTextColor}>
                Location
              </Text>
              <Text>{formData.location || "Location"}</Text>
            </Box>
            <Box>
              <Text fontWeight="medium" color={secondaryTextColor}>
                Experience
              </Text>
              <Text>
                {formData.experienceLevel === "entry"
                  ? "Entry Level (0-2 years)"
                  : formData.experienceLevel === "mid"
                    ? "Mid Level (3-5 years)"
                    : "Senior Level (5+ years)"}
              </Text>
            </Box>
            <Box>
              <Text fontWeight="medium" color={secondaryTextColor}>
                Salary Range
              </Text>
              <Text>{formData.salary || "Not specified"}</Text>
            </Box>
          </Grid>

          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading as="h3" size="md" mb={2}>
                About the Company
              </Heading>
              <Text whiteSpace="pre-line">
                {formData.companyDescription ||
                  "Company description will appear here."}
              </Text>
            </Box>

            <Box>
              <Heading as="h3" size="md" mb={2}>
                Job Description
              </Heading>
              <Text whiteSpace="pre-line">
                {formData.jobDescription || "Job description will appear here."}
              </Text>
            </Box>

            <Box>
              <Heading as="h3" size="md" mb={2}>
                Key Responsibilities
              </Heading>
              <Text whiteSpace="pre-line">
                {formData.responsibilities ||
                  "Responsibilities will appear here."}
              </Text>
            </Box>

            <Box>
              <Heading as="h3" size="md" mb={2}>
                Requirements & Qualifications
              </Heading>
              <Text whiteSpace="pre-line">
                {formData.requirements || "Requirements will appear here."}
              </Text>
            </Box>

            <Box>
              <Heading as="h3" size="md" mb={2}>
                Tech Stack
              </Heading>
              <Flex wrap="wrap" gap={2}>
                {formData.techStack.length > 0 ? (
                  formData.techStack.map((tech, index) => (
                    <Badge
                      key={index}
                      px={3}
                      py={1}
                      bg={techTagBg}
                      color={techTagColor}
                      borderRadius="full"
                    >
                      {tech}
                    </Badge>
                  ))
                ) : (
                  <Text>No technologies specified</Text>
                )}
              </Flex>
            </Box>
          </VStack>

          <Divider my={6} borderColor={borderColor} />

          <Box>
            <Heading as="h3" size="md" mb={4}>
              Contact Information
            </Heading>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
              gap={6}
            >
              <Box>
                <Text fontWeight="medium" color={secondaryTextColor}>
                  Name
                </Text>
                <Text>{formData.contactName || "Contact name"}</Text>
              </Box>
              <Box>
                <Text fontWeight="medium" color={secondaryTextColor}>
                  Email
                </Text>
                <Text>{formData.contactEmail || "Contact email"}</Text>
              </Box>
              <Box>
                <Text fontWeight="medium" color={secondaryTextColor}>
                  Phone
                </Text>
                <Text>{formData.contactPhone || "Not provided"}</Text>
              </Box>
            </Grid>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default JobPostingForm;
