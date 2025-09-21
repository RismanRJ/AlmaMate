import React, { useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  CardFooter,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
} from "@chakra-ui/react";
import { useConnectionStore } from "../../store/useConnectionStore";

const NotificationProfileBar = (props) => {
  const { getUserProfile, searchUserProfile, authUser, isSearching } =
    useAuthStore();

  const { acceptConnection, rejectConnection } = useConnectionStore();

  useEffect(() => {
    console.log(props.id);

    getUserProfile(props.id);
    console.log(searchUserProfile);
  }, [getUserProfile]);

  const handleAccept = () => {
    console.log("Accepted");
    props.updateStatus(props.id, "accept");
  };
  const handleReject = () => {
    console.log("Rejected");
    props.updateStatus(props.id, "reject");
  };

  if (!searchUserProfile || isSearching) return <Spinner />;
  return (
    <div>
      <Card
        maxW="100%"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="lg"
        p={4}
        m={5}
      >
        <CardBody>
          <Alert status="info" mb={4}>
            <AlertIcon />
            <AlertTitle mr={2}>New User Notification</AlertTitle>
            <AlertDescription>
              You have a new user request from {searchUserProfile.name}.
            </AlertDescription>
          </Alert>

          <VStack spacing={2} align="start">
            <Heading size="md">{searchUserProfile.name}</Heading>
            <Text>Email: {searchUserProfile.email}</Text>
            <Text>Category: {searchUserProfile.role}</Text>
          </VStack>
        </CardBody>

        <CardFooter>
          <HStack spacing={4}>
            <Button colorScheme="green" onClick={handleAccept}>
              Accept
            </Button>
            <Button colorScheme="red" onClick={handleReject}>
              Reject
            </Button>
          </HStack>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotificationProfileBar;
