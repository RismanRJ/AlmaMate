import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
  IconButton,
  Toast,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { axiosInstance } from "../lib/axios";

const PersonalExperience = ({ id }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    userId: id,
    bio: "",
    education: [""],
    experience: [""],
    skills: [""],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetch from DB
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(
          `/dynamic/personal-experience?userId=${id}`
        ); // replace with actual endpoint
        if (res.data.data.length > 0) {
          setFormData(res.data.data[0]);
        }
      } catch (err) {
        console.log("No existing profile found.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field, index = null, value) => {
    if (index !== null) {
      const updatedArray = [...formData[field]];
      updatedArray[index] = value;
      setFormData({ ...formData, [field]: updatedArray });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const addField = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeField = (field, index) => {
    const updatedArray = [...formData[field]];
    updatedArray.splice(index, 1);
    setFormData({ ...formData, [field]: updatedArray });
  };

  const handleSubmit = async () => {
    try {
      const checkRes = await axiosInstance.get(
        `/dynamic/personal-experience?userId=${id}`
      );
      console.log("Check response:", checkRes.data.data._id);

      // Check if a profile already exists
      if (checkRes.data.data.length > 0) {
        // Profile exists, so send a PUT request to update it
        const res = await axiosInstance.put(
          `/dynamic/personal-experience?userId=${id}`,
          formData
        );
        toast({
          title: "Profile updated!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // No profile exists, send a POST request to create it
        const res = await axiosInstance.post(
          `/dynamic/personal-experience?userId=${id}`,
          formData
        );

        toast({
          title: "Profile created!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error submitting form",
        description: "Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <Box mx="auto" p={6} w={"full"}>
      <Heading mb={6}> {id > 0 ? "My" : "Edit My"} Profile</Heading>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Bio</FormLabel>
          <Textarea
            value={formData.bio}
            onChange={(e) => handleChange("bio", null, e.target.value)}
          />
        </FormControl>

        {["education", "experience", "skills"].map((field) => (
          <Box key={field}>
            <FormLabel textTransform="capitalize">{field}</FormLabel>
            {formData[field].map((item, idx) => (
              <Flex key={idx} mb={2}>
                <Input
                  value={item}
                  onChange={(e) => handleChange(field, idx, e.target.value)}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  onClick={() => removeField(field, idx)}
                  ml={2}
                  aria-label="Remove"
                />
              </Flex>
            ))}
            <Button
              leftIcon={<AddIcon />}
              onClick={() => addField(field)}
              size="sm"
              mt={2}
            >
              Add {field}
            </Button>
          </Box>
        ))}

        <Button colorScheme="blue" onClick={handleSubmit}>
          Save Profile
        </Button>
      </VStack>
    </Box>
  );
};
export default PersonalExperience;
