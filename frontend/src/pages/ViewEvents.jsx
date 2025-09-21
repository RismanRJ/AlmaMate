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
  CalendarIcon,
  TimeIcon,
} from "@chakra-ui/icons";
import { useAuthStore } from "../../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const EventListings = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: "",
    month: "",
    year: "",
  });

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`dynamic/events`);
        const eventsData = res?.data?.data || [];
        console.log("events data:", eventsData);

        if (res.status === 200) {
          setEvents(eventsData);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to load event listings");
        toast({
          title: "Error fetching events",
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
  const badgeBg = useColorModeValue("orange.50", "orange.900");
  const badgeColor = useColorModeValue("orange.600", "orange.200");
  const highlightColor = useColorModeValue("orange.500", "orange.300");
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

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get current year for filter
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  // Month options for filter
  const monthOptions = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Filter events based on search and filter criteria
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.chiefGuests?.toLowerCase().includes(filters.search.toLowerCase());

    let matchesMonth = true;
    if (filters.month) {
      matchesMonth =
        event.date &&
        event.date.startsWith(
          `${filters.year || currentYear}-${filters.month}`
        );
    }

    let matchesYear = true;
    if (filters.year && !filters.month) {
      matchesYear = event.date && event.date.startsWith(`${filters.year}`);
    }

    return matchesSearch && matchesMonth && matchesYear;
  });

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")} py={8}>
      <Container maxW="6xl">
        <Flex justify="space-between" align="center" mb={8}>
          <Heading
            size="xl"
            bgGradient={useColorModeValue(
              "linear(to-r, orange.400, red.400)",
              "linear(to-r, orange.200, red.200)"
            )}
            bgClip="text"
          >
            Event Calendar
          </Heading>
          <Button onClick={() => navigate("/eventscheduler")}>
            Add Events
          </Button>
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
                  placeholder="Search events..."
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </InputGroup>

              <Select
                placeholder="Month"
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </Select>

              <Select
                placeholder="Year"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Event Listings */}
        <VStack spacing={6} align="stretch">
          {loading ? (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg">Loading events...</Text>
            </Box>
          ) : error ? (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg" color="red.500">
                {error}
              </Text>
            </Box>
          ) : filteredEvents.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Text fontSize="lg">No events match your filters.</Text>
            </Box>
          ) : (
            filteredEvents.map((event, index) => (
              <Card
                key={event._id || index}
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
                        {event.title}
                      </Heading>
                      <HStack spacing={2}>
                        <Badge colorScheme="orange">Upcoming Event</Badge>
                      </HStack>
                    </Box>
                    <VStack align="flex-end" spacing={1}>
                      <HStack>
                        <CalendarIcon boxSize={4} color={highlightColor} />
                        <Text fontWeight="bold">{formatDate(event.date)}</Text>
                      </HStack>
                      <HStack>
                        <TimeIcon boxSize={4} color={highlightColor} />
                        <Text fontSize="md">{event.time}</Text>
                      </HStack>
                    </VStack>
                  </Flex>
                </CardHeader>

                <CardBody px={6} py={4}>
                  <SimpleGrid columns={{ base: 1, md: 1 }} spacing={6}>
                    <Box>
                      <VStack align="start" spacing={4}>
                        <Box width="full">
                          <Heading size="sm" mb={1}>
                            Description
                          </Heading>
                          <Text fontSize="md">{event.description}</Text>
                        </Box>

                        <Box width="full">
                          <Heading size="sm" mb={1}>
                            Chief Guests
                          </Heading>
                          <HStack spacing={2} mt={2}>
                            <Avatar
                              size="sm"
                              name={event.chiefGuests}
                              bg={highlightColor}
                            />
                            <Text>{event.chiefGuests}</Text>
                          </HStack>
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
                    columns={{ base: 1, md: 2 }}
                    spacing={4}
                    width="full"
                  >
                    <HStack>
                      <Tag
                        size="md"
                        variant="subtle"
                        bg={badgeBg}
                        color={badgeColor}
                      >
                        {event.date &&
                          new Date(event.date).toLocaleDateString()}
                      </Tag>
                      <Tag
                        size="md"
                        variant="subtle"
                        bg={badgeBg}
                        color={badgeColor}
                      >
                        {event.time}
                      </Tag>
                    </HStack>
                    <HStack justifyContent="flex-end">
                      <Text fontSize="sm" fontWeight="medium">
                        Event ID:
                      </Text>
                      <Text fontSize="sm">{event._id?.$oid || event._id}</Text>
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

export default EventListings;
