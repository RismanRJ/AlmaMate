import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Textarea,
  useColorMode,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Divider,
  useColorModeValue,
  List,
  ListItem,
  InputGroup,
  InputRightElement,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon, CloseIcon, SearchIcon } from "@chakra-ui/icons";
import { useAuthStore } from "../../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useLocation, useParams } from "react-router-dom";

const EventScheduler = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [eventId, setEventId] = useState(null);

  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    const postId = params.eventId;
    setEventId(postId);
  }, [params.eventId]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axiosInstance.get(`dynamic/events/${eventId}`);
        const postData = res.data.data;
        console.log("postData", postData);
        if (postData) {
          // Transform chief guests data structure if needed
          const formattedChiefGuests = postData.chiefGuests?.map
            ? postData.chiefGuests.map((guest) => ({
                id: typeof guest === "string" ? guest : guest._id || guest.id,
                name: typeof guest === "string" ? guest : guest.name,
              }))
            : [];

          setEvent({
            ...postData,
            chiefGuests: formattedChiefGuests || [],
          });
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast({
          title: "Error",
          description: "Failed to load event data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (eventId) {
      fetchEvent();
    } else {
      setIsEditing(false);
      // Reset form when not editing
      setEvent({
        title: "",
        date: "",
        time: "",
        description: "",
        chiefGuests: [],
      });
    }
  }, [eventId]);

  const [event, setEvent] = useState({
    title: "",
    date: "",
    time: "",
    description: "",
    chiefGuests: [],
  });

  const [chiefGuestInput, setChiefGuestInput] = useState("");
  const [showConnectionsList, setShowConnectionsList] = useState(false);
  const [filteredConnections, setFilteredConnections] = useState([]);

  const { authUser, connections, getConnections } = useAuthStore();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Chakra UI color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const previewBgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const dropdownBgColor = useColorModeValue("white", "gray.700");
  const hoverBgColor = useColorModeValue("gray.100", "gray.600");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChiefGuestInputChange = (e) => {
    const value = e.target.value;
    setChiefGuestInput(value);

    if (value.trim() === "") {
      setShowConnectionsList(false);
      return;
    }

    // Filter connections based on input and alumni role
    // Assuming connections is an array of user objects with connection data
    const filtered = connections.filter((conn) => {
      // Check if the connection's name contains the input text
      const nameMatch = conn.name?.toLowerCase().includes(value.toLowerCase());
      // Check if the connection has role 'alumni' or no role specified
      const isAlumni = !conn.role || conn.role === "alumni";

      return nameMatch && isAlumni;
    });

    setFilteredConnections(filtered);
    setShowConnectionsList(filtered.length > 0);
  };

  const addChiefGuest = (connection) => {
    // Check if already added
    if (event.chiefGuests.some((guest) => guest.id === connection._id)) {
      return;
    }

    setEvent((prev) => ({
      ...prev,
      chiefGuests: [
        ...prev.chiefGuests,
        {
          id: connection._id,
          name: connection.name,
        },
      ],
    }));

    setChiefGuestInput("");
    setShowConnectionsList(false);
  };

  const removeChiefGuest = (guestId) => {
    setEvent((prev) => ({
      ...prev,
      chiefGuests: prev.chiefGuests.filter((guest) => guest.id !== guestId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert chiefGuests array to string format for API
      const eventData = {
        ...event,
        chiefGuests: event.chiefGuests.map((guest) => guest.id).join(","),
        author: authUser._id,
      };

      console.log(`${isEditing ? "Updating" : "Creating"} event:`, eventData);

      let res;

      if (isEditing) {
        // Update existing event
        const { _id, ...filteredFormData } = eventData;
        res = await axiosInstance.put(
          `dynamic/events/${eventId}`,
          filteredFormData
        );

        if (res.status === 201) {
          toast({
            title: "Event updated",
            description: "Your event has been successfully updated",
            status: "success",
            duration: 5000,
            isClosable: true,
          });

          // Navigate back to events list after successful update
          navigate("/events");
        }
      } else {
        // Create new event
        res = await axiosInstance.post(`dynamic/events`, eventData);

        if (res.status === 201) {
          toast({
            title: "Event created",
            description: "Your event has been successfully created",
            status: "success",
            duration: 5000,
            isClosable: true,
          });

          // Reset form after successful creation
          setEvent({
            title: "",
            date: "",
            time: "",
            description: "",
            chiefGuests: [],
          });
          setChiefGuestInput("");

          // Navigate back to events list after successful creation
          navigate("/events");
        }
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} event`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Navigate back without saving changes
    navigate("/events");
  };

  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      await getConnections(authUser._id);
      setLoading(false);
    };
    fetchConnections();
  }, [navigate, authUser._id, getConnections]);

  if (loading) return <Text>Loading...</Text>;

  return (
    <Box bg={bgColor} minH="100vh" py={6}>
      <Container maxW="4xl">
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading size="lg">
            {isEditing ? "Edit Event" : "Event Scheduler"}
          </Heading>
          <Button onClick={() => navigate("/events")} size="md">
            Back
          </Button>
        </Flex>

        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
          {/* Form Section */}
          <Card bg={cardBgColor} shadow="md" borderRadius="lg">
            <CardHeader>
              <Heading size="md">
                {isEditing ? "Edit Event" : "Create New Event"}
              </Heading>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="flex-start">
                  <FormControl isRequired>
                    <FormLabel>Event Title</FormLabel>
                    <Input
                      type="text"
                      name="title"
                      value={event.title}
                      onChange={handleChange}
                      placeholder="Title of your event"
                    />
                  </FormControl>

                  <Grid
                    templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                    gap={4}
                    width="100%"
                  >
                    <FormControl isRequired>
                      <FormLabel>Date</FormLabel>
                      <Input
                        type="date"
                        name="date"
                        value={event.date}
                        onChange={handleChange}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Time</FormLabel>
                      <Input
                        type="time"
                        name="time"
                        value={event.time}
                        onChange={handleChange}
                      />
                    </FormControl>
                  </Grid>

                  <FormControl>
                    <FormLabel>Chief Guest(s)</FormLabel>
                    <Box position="relative">
                      <InputGroup>
                        <Input
                          type="text"
                          value={chiefGuestInput}
                          onChange={handleChiefGuestInputChange}
                          onClick={() => setShowConnectionsList(true)}
                          onBlur={() =>
                            setTimeout(() => setShowConnectionsList(false), 200)
                          }
                          placeholder="Search for connections..."
                          onFocus={() =>
                            chiefGuestInput && setShowConnectionsList(true)
                          }
                        />
                        <InputRightElement>
                          <SearchIcon color="gray.500" />
                        </InputRightElement>
                      </InputGroup>

                      {/* Connections dropdown */}
                      {showConnectionsList && (
                        <Box
                          position="absolute"
                          top="100%"
                          left={0}
                          right={0}
                          zIndex={10}
                          mt={1}
                          bg={dropdownBgColor}
                          boxShadow="md"
                          borderRadius="md"
                          maxH="200px"
                          overflowY="auto"
                          border="1px solid"
                          borderColor={borderColor}
                        >
                          <List spacing={0}>
                            {connections.length > 0 ? (
                              connections
                                .filter((conn) => conn.role === "alumni")
                                .map((connection) => (
                                  <ListItem
                                    key={connection._id}
                                    px={4}
                                    py={2}
                                    cursor="pointer"
                                    _hover={{ bg: hoverBgColor }}
                                    onClick={() => addChiefGuest(connection)}
                                  >
                                    <Text>{connection.name}</Text>
                                    {connection.role && (
                                      <Text fontSize="sm" color="gray.500">
                                        {connection.role}
                                      </Text>
                                    )}
                                  </ListItem>
                                ))
                            ) : (
                              <ListItem px={4} py={2}>
                                <Text>No matching connections found</Text>
                              </ListItem>
                            )}
                          </List>
                        </Box>
                      )}
                    </Box>

                    {/* Selected Chief Guests */}
                    {event.chiefGuests.length > 0 && (
                      <Wrap spacing={2} mt={2}>
                        {event.chiefGuests.map((guest) => (
                          <WrapItem key={guest.id}>
                            <Tag
                              size="md"
                              borderRadius="full"
                              variant="solid"
                              colorScheme="blue"
                            >
                              <TagLabel>{guest.name}</TagLabel>
                              <TagCloseButton
                                onClick={() => removeChiefGuest(guest.id)}
                              />
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    )}
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      name="description"
                      value={event.description}
                      onChange={handleChange}
                      placeholder="Describe your event"
                      rows={4}
                    />
                  </FormControl>

                  <HStack width="100%" spacing={4}>
                    <Button
                      type="submit"
                      width="100%"
                      colorScheme="blue"
                      isLoading={loading}
                    >
                      {isEditing ? "Update Event" : "Schedule Event"}
                    </Button>
                    {isEditing && (
                      <Button width="100%" onClick={handleCancel}>
                        Cancel
                      </Button>
                    )}
                  </HStack>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* Preview Section */}
          <Card bg={cardBgColor} shadow="md" borderRadius="lg">
            <CardHeader>
              <Heading size="md">Event Preview</Heading>
            </CardHeader>
            <CardBody>
              <Box
                p={4}
                borderRadius="md"
                bg={previewBgColor}
                borderWidth="1px"
                borderColor={borderColor}
              >
                {event.title ? (
                  <VStack align="stretch" spacing={3}>
                    <Heading size="md">{event.title}</Heading>
                    <HStack wrap="wrap" spacing={2}>
                      {event.date && (
                        <Badge borderRadius="full" px={3} py={1}>
                          📅 {event.date}
                        </Badge>
                      )}
                      {event.time && (
                        <Badge borderRadius="full" px={3} py={1}>
                          ⏰ {event.time}
                        </Badge>
                      )}
                    </HStack>
                    {event.description && (
                      <Text mt={2}>{event.description}</Text>
                    )}
                    {event.chiefGuests.length > 0 && (
                      <Box mt={2}>
                        <Heading size="sm">Chief Guest(s):</Heading>
                        <Wrap mt={1} spacing={2}>
                          {event.chiefGuests.map((guest) => (
                            <WrapItem key={guest.id}>
                              <Badge
                                colorScheme="blue"
                                borderRadius="full"
                                px={2}
                                py={1}
                              >
                                {guest.name}
                              </Badge>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </Box>
                    )}
                  </VStack>
                ) : (
                  <Flex
                    direction="column"
                    justify="center"
                    align="center"
                    py={8}
                    color="gray.500"
                  >
                    <Text>Your event preview will appear here</Text>
                    <Text>Fill out the form to see the preview</Text>
                  </Flex>
                )}
              </Box>
            </CardBody>
          </Card>
        </Grid>
      </Container>
    </Box>
  );
};

export default EventScheduler;
