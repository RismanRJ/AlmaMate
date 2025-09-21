import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { FaGoogle } from 'react-icons/fa';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, googleSignUp } = useAuthStore();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signup(formData);
    toast({
      title: 'Account Created.',
      description: "You've successfully signed up!",
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    setTimeout(() => navigate('/login'), 500);
  };

  const handleGoogleLogin = async () => {
    await googleSignUp();
    setTimeout(() => navigate('/'), 500);
  };

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
      p={8}
    >
      <Stack spacing={6} mx={'auto'} maxW={'md'} width="100%" py={8} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'3xl'} textAlign={'center'}>
            Sign Up
          </Heading>
          <Text fontSize={'md'} color={'gray.600'}>
            Join us and explore all features ✌️
          </Text>
        </Stack>
        <Box
          rounded={'md'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}
        >
          <Stack spacing={4} as="form" onSubmit={handleSubmit}>
            <FormControl id="name" isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                type="text"
                placeholder="Your Name"
              />
            </FormControl>
            <FormControl id="email" isRequired>
              <FormLabel>Email address</FormLabel>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                type="email"
                placeholder="Your Email"
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Your Password"
                />
                <InputRightElement h={'full'}>
                  <Button variant={'ghost'} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Stack spacing={6} pt={2}>
              <Button
                type="submit"
                size="md"
                bg={'blue.400'}
                color={'white'}
                _hover={{ bg: 'blue.500' }}
              >
                Sign Up
              </Button>
            </Stack>
            <Text textAlign="center" mt={4}>
              Already have an account?{' '}
              <Button variant="link" colorScheme="blue" onClick={() => navigate('/login')}>
                Log In
              </Button>
            </Text>
            <Text textAlign="center" pt={4}>---- or ----</Text>
            <Button
              onClick={handleGoogleLogin}
              w="full"
              colorScheme="red"
              variant="outline"
              leftIcon={<FaGoogle />}
              size="md"
            >
              Sign up With Google
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
