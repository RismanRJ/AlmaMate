import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Tag,
  Text,
  useColorMode,
  VStack,
  HStack,
  Badge,
  Avatar,
  IconButton,
  useColorModeValue,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
} from "@chakra-ui/react";
import {
  MoonIcon,
  SunIcon,
  SearchIcon,
  EmailIcon,
  PhoneIcon,
} from "@chakra-ui/icons";
import { useAuthStore } from "../../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const JobListings = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: "",
    jobType: "",
    experienceLevel: "",
  });

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`dynamic/jobs`);
        // Get the data from the response
        const jobsData = res?.data?.data || [];
        console.log("jobs data:", jobsData);

        if (res.status === 200) {
          // Set the jobs state with the data
          setJobs(jobsData);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Failed to load job listings");
        toast({
          title: "Error fetching jobs",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [toast]);

  // Colors that change based on color mode
  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const badgeBg = useColorModeValue("blue.50", "blue.900");
  const badgeColor = useColorModeValue("blue.600", "blue.200");
  const highlightColor = useColorModeValue("blue.500", "blue.300");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Filter jobs based on search and filter criteria
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.jobTitle?.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.companyName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.location?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesJobType =
      filters.jobType === "" || job.jobType === filters.jobType;
    const matchesExperience =
      filters.experienceLevel === "" ||
      job.experienceLevel === filters.experienceLevel;

    return matchesSearch && matchesJobType && matchesExperience;
  });

  // Job type badge color mapping
  const getJobTypeBadgeProps = (jobType) => {
    switch (jobType) {
      case "internship":
        return { colorScheme: "green" };
      case "full-time":
        return { colorScheme: "blue" };
      case "contract":
        return { colorScheme: "purple" };
      case "part-time":
        return { colorScheme: "orange" };
      default:
        return { colorScheme: "gray" };
    }
  };

  // Experience level badge color mapping
  const getExperienceBadgeProps = (level) => {
    switch (level) {
      case "entry":
        return { colorScheme: "teal" };
      case "mid":
        return { colorScheme: "yellow" };
      case "senior":
        return { colorScheme: "red" };
      default:
        return { colorScheme: "gray" };
    }
  };

  // For debugging - remove in production
  console.log("Current jobs state:", jobs);
  console.log("Filtered jobs:", filteredJobs);

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")} py={8}>
      <Container maxW="6xl">
        <Flex justify="space-between" align="center" mb={8}>
          <Heading
            size="xl"
            bgGradient={useColorModeValue(
              "linear(to-r, blue.400, teal.400)",
              "linear(to-r, blue.200, teal.200)"
            )}
            bgClip="text"
          >
            Job Listings
          </Heading>
          <Button onClick={() => navigate("/jobpost")}>Add Jobs</Button>
        </Flex>

        {/* Search and Filters */}
        <Card mb={8} bg={cardBg} shadow="md" borderRadius="lg">
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color={mutedText} />
                </InputLeftElement>
                <Input
                  placeholder="Search jobs..."
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </InputGroup>

              <Select
                placeholder="Job Type"
                name="jobType"
                value={filters.jobType}
                onChange={handleFilterChange}
              >
                <option value="internship">Internship</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </Select>

              <Select
                placeholder="Experience Level"
                name="experienceLevel"
                value={filters.experienceLevel}
                onChange={handleFilterChange}
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </Select>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Job Listings */}
        <VStack spacing={6} align="stretch">
          {loading ? (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg">Loading jobs...</Text>
            </Box>
          ) : error ? (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg" color="red.500">
                {error}
              </Text>
            </Box>
          ) : filteredJobs.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg">No jobs match your filters.</Text>
            </Box>
          ) : (
            filteredJobs.map((job, index) => (
              <Card
                key={job._id || index}
                bg={cardBg}
                shadow="md"
                borderRadius="lg"
                overflow="hidden"
                borderWidth="1px"
                borderColor={borderColor}
                transition="all 0.2s"
                _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
              >
                <CardHeader
                  bg={headerBg}
                  py={4}
                  px={6}
                  borderBottomWidth="1px"
                  borderColor={borderColor}
                >
                  <Flex justify="space-between" align="flex-start">
                    <Box>
                      <Heading size="md" fontWeight="bold" mb={1}>
                        {job.jobTitle}
                      </Heading>
                      <HStack spacing={2}>
                        <Avatar
                          size="xs"
                          name={job.companyName}
                          bg={highlightColor}
                        />
                        <Text fontWeight="medium">{job.companyName}</Text>
                        <Text fontSize="sm" color={mutedText}>
                          {job.companyDescription}
                        </Text>
                      </HStack>
                    </Box>
                    <VStack align="flex-end" spacing={1}>
                      <Text
                        fontWeight="bold"
                        fontSize="md"
                        color={highlightColor}
                      >
                        {job.salary}
                      </Text>
                      <HStack>
                        <Text fontSize="sm">{job.location}</Text>
                        {job.isRemote && (
                          <Badge colorScheme="green">Remote</Badge>
                        )}
                      </HStack>
                    </VStack>
                  </Flex>
                </CardHeader>

                <CardBody px={6} py={4}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box>
                      <VStack align="start" spacing={4}>
                        <Box width="full">
                          <HStack mb={2}>
                            {job.jobType && (
                              <Badge {...getJobTypeBadgeProps(job.jobType)}>
                                {job.jobType.charAt(0).toUpperCase() +
                                  job.jobType.slice(1)}
                              </Badge>
                            )}
                            {job.experienceLevel && (
                              <Badge
                                {...getExperienceBadgeProps(
                                  job.experienceLevel
                                )}
                              >
                                {job.experienceLevel.charAt(0).toUpperCase() +
                                  job.experienceLevel.slice(1)}{" "}
                                Level
                              </Badge>
                            )}
                          </HStack>

                          <Heading size="sm" mb={1}>
                            Description
                          </Heading>
                          <Text fontSize="sm">{job.jobDescription}</Text>
                        </Box>

                        <Box width="full">
                          <Heading size="sm" mb={1}>
                            Requirements
                          </Heading>
                          <Text fontSize="sm">{job.requirements}</Text>
                        </Box>
                      </VStack>
                    </Box>

                    <Box>
                      <VStack align="start" spacing={4}>
                        <Box width="full">
                          <Heading size="sm" mb={1}>
                            Responsibilities
                          </Heading>
                          <Text fontSize="sm">{job.responsibilities}</Text>
                        </Box>

                        <Box width="full">
                          <Heading size="sm" mb={2}>
                            Tech Stack
                          </Heading>
                          <Flex wrap="wrap" gap={2}>
                            {Array.isArray(job.techStack) &&
                              job.techStack.map((tech, index) => (
                                <Tag
                                  key={index}
                                  size="md"
                                  variant="subtle"
                                  bg={badgeBg}
                                  color={badgeColor}
                                >
                                  {tech}
                                </Tag>
                              ))}
                          </Flex>
                        </Box>
                      </VStack>
                    </Box>
                  </SimpleGrid>
                </CardBody>

                <CardFooter
                  bg={headerBg}
                  px={6}
                  py={3}
                  borderTopWidth="1px"
                  borderColor={borderColor}
                >
                  <SimpleGrid
                    columns={{ base: 1, md: 3 }}
                    spacing={4}
                    width="full"
                  >
                    <HStack>
                      <Text fontSize="sm" fontWeight="medium">
                        Contact:
                      </Text>
                      <Text fontSize="sm">{job.contactName}</Text>
                    </HStack>
                    <HStack>
                      <EmailIcon boxSize={3} color={mutedText} />
                      <Text fontSize="sm">{job.contactEmail}</Text>
                    </HStack>
                    <HStack>
                      <PhoneIcon boxSize={3} color={mutedText} />
                      <Text fontSize="sm">{job.contactPhone}</Text>
                    </HStack>
                  </SimpleGrid>
                </CardFooter>
              </Card>
            ))
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default JobListings;
