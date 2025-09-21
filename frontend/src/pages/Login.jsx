"use client";

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const { login, googleSignUp } = useAuthStore();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(formData);
    toast({
      title: "Account Log In",
      description: res.message,
      status: res.status ? "success" : "error",
      duration: 5000,
      isClosable: true,
    });
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  const handleGoogleLogin = async () => {
    await googleSignUp();
    setTimeout(() => navigate("/"), 500);
  };

  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Sign in to your account</Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            to enjoy all of our cool{" "}
            <Text as="span" color={"blue.400"}>
              features ✌️
            </Text>
          </Text>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={4} as="form" onSubmit={handleSubmit}>
            <FormControl id="email" isRequired>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </FormControl>
            <Stack spacing={10}>
              <Stack
                direction={{ base: "column", sm: "row" }}
                align={"start"}
                justify={"space-between"}
              >
                <Checkbox>Remember me</Checkbox>
                {/* <Text as="button" color={"blue.400"}>
                  Forgot password?
                </Text> */}
              </Stack>
              <Button
                bg={"blue.400"}
                color={"white"}
                _hover={{ bg: "blue.500" }}
                type="submit"
              >
                Sign in
              </Button>
              <Button
                leftIcon={<FaGoogle />}
                colorScheme="red"
                variant="outline"
                onClick={handleGoogleLogin}
              >
                Sign in with Google
              </Button>
            </Stack>
          </Stack>
          <Text textAlign="center" mt={4}>
            Don't have an account?{" "}
            <Button
              variant="link"
              colorScheme="blue"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>
          </Text>
        </Box>
      </Stack>
    </Flex>
  );
}
