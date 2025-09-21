"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Stack,
  useColorMode,
  Center,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  InputLeftElement,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { BsChatLeftDotsFill } from "react-icons/bs";
import { FaDownload } from "react-icons/fa";
import { MdHome, MdAddCircle, MdClear } from "react-icons/md";
import { IoSearchSharp, IoNotifications } from "react-icons/io5";
import { MdEvent } from "react-icons/md";
import { BsBriefcase } from "react-icons/bs";
import { useAuthStore } from "../../store/useAuthStore";
import { useSearchStore } from "../../store/useSearchStore";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const { authUser, logout } = useAuthStore();
  const [searchValue, setSearchValue] = useState("");
  const { isSearching, searchUsers, updateSearchedUsers } = useSearchStore();

  useEffect(() => {
    searchUsers(searchValue, authUser);
  }, [searchValue]);

  const handleLogout = async () => {
    await logout(authUser.authType);
    toast({
      title: "Logged Out",
      description: "You've successfully logged out!",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    navigate("/login");
  };

  const handleSearch = async () => {
    searchUsers(searchValue, authUser);
  };

  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  return (
    <>
      {/* Top Navbar */}
      <Box
        bg={colorMode === "light" ? "gray.100" : "gray.900"}
        px={4}
        py={2}
        position="fixed"
        top={0}
        width="100%"
        zIndex={1000}
        borderBottom="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      >
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          {/* Logo */}
          <Box
            fontSize="xl"
            fontWeight="bold"
            cursor="pointer"
            onClick={() => navigate("/")}
          >
            AlmaHub
          </Box>

          {/* Search Input */}
          <InputGroup mx={4} w="40%" display={{ base: "none", md: "block" }}>
            <Input
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              // onBlur={() => updateSearchedUsers()}
              borderColor="gray.300"
              _focus={{ borderColor: "blue.500" }}
            />
            <InputRightElement>
              <IconButton
                aria-label="Clear Search"
                icon={<MdClear />}
                onClick={() => setSearchValue("")}
                colorScheme="red"
              />
            </InputRightElement>
            <InputLeftElement>
              <IconButton
                aria-label="Search"
                icon={<IoSearchSharp />}
                onClick={handleSearch}
                colorScheme="blue"
                variant="outline"
                isLoading={isSearching}
              />
            </InputLeftElement>
          </InputGroup>

          {/* Profile Menu */}
          <Flex alignItems={"center"}>
            <Stack direction={"row"} spacing={6}>
              <Button onClick={toggleColorMode}>
                {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              </Button>

              <Menu>
                <MenuButton
                  as={Button}
                  rounded={"full"}
                  variant={"link"}
                  cursor={"pointer"}
                >
                  <Avatar
                    size={"sm"}
                    src={
                      authUser?.avatar
                        ? authUser?.avatar
                        : "https://avatars.dicebear.com/api/male/username.svg"
                    }
                  />
                </MenuButton>
                <MenuList alignItems={"center"}>
                  <br />
                  <Center>
                    <Avatar
                      size={"2xl"}
                      src={
                        authUser?.avatar
                          ? authUser?.avatar
                          : "https://avatars.dicebear.com/api/male/username.svg"
                      }
                      cursor="pointer"
                    />
                  </Center>
                  <br />
                  <Center>
                    <p>{authUser?.name || "Username"}</p>
                  </Center>
                  <br />
                  <MenuDivider />
                  <MenuItem onClick={() => navigate("/account")}>
                    Account Settings
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          </Flex>
        </Flex>
      </Box>

      {/* Bottom Navigation Bar */}
      <Flex
        position="fixed"
        bottom={0}
        left={0}
        width="100%"
        bg={colorMode === "light" ? "gray.100" : "gray.900"}
        justifyContent="space-around"
        alignItems="center"
        py={2}
        zIndex={1000}
        borderTop="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        pt={5}
      >
        <IconButton
          icon={<MdHome size={24} />}
          onClick={() => navigate("/")}
          aria-label="Home"
          variant="ghost"
          size="sm"
        />

        <IconButton
          icon={<BsChatLeftDotsFill size={24} />}
          onClick={() => navigate("/chat")}
          aria-label="Messages"
          variant="ghost"
          size="sm"
        />

        <Menu>
          <MenuButton
            as={IconButton}
            icon={<MdAddCircle size={24} />}
            aria-label="Create Post"
            colorScheme="blue"
            size="sm"
            isRound
          />
          <MenuList>
            <MenuItem onClick={() => navigate("/postcreation")}>
              Create Post
            </MenuItem>
            {authUser && authUser?.role !== "student" && (
              <MenuItem onClick={() => navigate("/jobpost")}>
                Create Job
              </MenuItem>
            )}
            <MenuItem onClick={() => navigate("/eventscheduler")}>
              Create Event
            </MenuItem>
          </MenuList>
        </Menu>

        {authUser && authUser?.role !== "student" && (
          <IconButton
            icon={<FaDownload size={24} />}
            onClick={() => navigate("/downloadusers")}
            aria-label="FaDownload"
            variant="ghost"
            size="sm"
          />
        )}

        <IconButton
          icon={<IoNotifications size={24} />}
          onClick={() => navigate("/notification")}
          aria-label="Notifications"
          variant="ghost"
          size="sm"
        />
      </Flex>

      {/* Single spacer for top navbar */}
      <Box height="4rem" />
    </>
  );
}
