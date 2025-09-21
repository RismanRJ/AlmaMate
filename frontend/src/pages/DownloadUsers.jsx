import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  Input,
  Stack,
  Select,
  Button,
  HStack,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  useToast,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { ChevronDownIcon, DownloadIcon } from "@chakra-ui/icons";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { useAuthStore } from "../../store/useAuthStore";
import MenuItems from "../components/MenuItems";
import { axiosInstance } from "../lib/axios";

const UserManagementPage = () => {
  const { connections, authUser, getConnections } = useAuthStore();
  const [users, setUsers] = useState(connections);
  const [filteredUsers, setFilteredUsers] = useState(connections);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [personalFilters, setPersonalFilters] = useState([]);
  const toast = useToast();

  // Selected filter category and value
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("");
  const [selectedFilterValue, setSelectedFilterValue] = useState("");

  // Dynamic filter options based on actual user data
  const [dynamicFilterOptions, setDynamicFilterOptions] = useState([]);

  // Apply filters and search
  useEffect(() => {
    let result = users;

    // Apply active filters
    activeFilters.forEach((filter) => {
      result = result.filter((user) => user[filter.key] === filter.value);
    });

    // Apply search
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(result);
  }, [users, activeFilters, searchTerm]);

  // Generate dynamic filter options based on user data
  useEffect(() => {
    if (!users || users.length === 0) return;

    const filterableFields = [
      { key: "role", label: "Role" },
      { key: "authType", label: "Auth Type" },
      { key: "batch", label: "Batch" },
    ];

    const options = filterableFields.map((field) => {
      let values = [];

      if (["experience", "education", "skill"].includes(field.key)) {
        users.forEach((user) => {
          const items = user[field.key];
          if (Array.isArray(items)) {
            if (field.key === "experience") {
              // e.g., { role: "Software Engineer", company: "ABC", duration: "2 years" }
              items.forEach((exp) => {
                if (exp.role) values.push(exp.role);
                if (exp.company) values.push(exp.company);
              });
            } else if (field.key === "education") {
              // e.g., { degree: "B.Tech", institute: "XYZ", year: 2023 }
              items.forEach((edu) => {
                if (edu.degree) values.push(edu.degree);
                if (edu.institute) values.push(edu.institute);
              });
            } else if (field.key === "skill") {
              // Just flat list of strings
              values = values.concat(items);
            }
          }
        });
      } else {
        values = users
          .filter((user) => user[field.key])
          .map((user) => user[field.key]);
      }

      const uniqueValues = [...new Set(values)].sort();

      return {
        key: field.key,
        label: field.label,
        options: uniqueValues,
      };
    });

    setDynamicFilterOptions(options);
    console.log(users);
  }, [users]);

  // Add selected filter
  const addCurrentFilter = () => {
    if (selectedFilterCategory && selectedFilterValue) {
      // Prevent duplicate filters
      if (
        !activeFilters.some(
          (filter) =>
            filter.key === selectedFilterCategory &&
            filter.value === selectedFilterValue
        )
      ) {
        setActiveFilters([
          ...activeFilters,
          { key: selectedFilterCategory, value: selectedFilterValue },
        ]);
      }

      // Reset selections for next filter
      setSelectedFilterCategory("");
      setSelectedFilterValue("");
    }
  };

  // Remove a filter
  const removeFilter = (index) => {
    const newFilters = [...activeFilters];
    newFilters.splice(index, 1);
    setActiveFilters(newFilters);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredUsers.map((user) => ({
        Name: user.name,
        Email: user.email,
        Role: user.role,
        "Auth Type": user.authType,
        Batch: user.batch,
        "Created At": formatDate(user.createdAt),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users_data.xlsx");

    toast({
      title: "Export Successful",
      description: "The data has been exported to Excel",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("User Management Data", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

    // Create table data
    const tableColumn = [
      "Name",
      "Email",
      "Role",
      "Auth Type",
      "Batch",
      "Created At",
    ];
    const tableRows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.role,
      user.authType,
      user.batch,
      formatDate(user.createdAt),
    ]);

    // Create the table manually instead of using autoTable plugin
    // This avoids the "doc.autoTable is not a function" error
    const startY = 40;
    const rowHeight = 10;
    const colWidth = 30;

    // Draw headers
    doc.setFillColor(75, 85, 99);
    doc.rect(10, startY, tableColumn.length * colWidth, rowHeight, "F");
    doc.setTextColor(255);
    doc.setFontSize(10);
    tableColumn.forEach((header, i) => {
      doc.text(header, 15 + i * colWidth, startY + 7);
    });

    // Draw rows
    doc.setTextColor(0);
    tableRows.forEach((row, rowIndex) => {
      const y = startY + (rowIndex + 1) * rowHeight;
      row.forEach((cell, colIndex) => {
        doc.text(String(cell || ""), 15 + colIndex * colWidth, y + 7);
      });

      // Add light gray background for even rows
      if (rowIndex % 2 === 1) {
        doc.setFillColor(240, 240, 240);
        doc.rect(10, y, tableColumn.length * colWidth, rowHeight, "F");
      }
    });

    doc.save("users_data.pdf");

    toast({
      title: "Export Successful",
      description: "The data has been exported to PDF",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const updateRole = async (userId, role) => {
    try {
      const res = await axiosInstance.put(`/auth/profile/${userId}`, { role });
      if (res.data.status) {
        toast({
          title: "Role Updated",
          description: `User role updated to ${role}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        const updatedUsers = users.map((user) =>
          user._id === userId ? { ...user, role } : user
        );
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
      } else {
        toast({
          title: "Error",
          description: "Failed to update user role",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getConnections(authUser._id);
        console.log(res);

        const personalData = await axiosInstance.get(
          `/dynamic/personal-experience`
        );
        setPersonalFilters(personalData.data.data);
        const mergedUsers = res.map((user) => {
          const personal = personalFilters.find((p) => p.userId === user._id);
          return {
            ...user,
            experience: personal?.experience || [],
            education: personal?.education || [],
            skill: personal?.skill || [],
          };
        });

        setUsers(mergedUsers);
        setFilteredUsers(mergedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Box p={6}>
      <Heading mb={6}>User Management</Heading>

      {/* Search and Filter Section */}
      <Stack spacing={4} mb={6}>
        <Flex
          justifyContent="space-between"
          alignItems="flex-start"
          flexDirection={{ base: "column", md: "row" }}
          gap={4}
        >
          <Input
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="400px"
          />

          {/* Dynamic Filter System */}
          <HStack alignItems="flex-start" spacing={3}>
            <Box>
              <FormControl>
                <FormLabel fontSize="sm">Filter Category</FormLabel>
                <Select
                  placeholder="Select category"
                  value={selectedFilterCategory}
                  onChange={(e) => {
                    setSelectedFilterCategory(e.target.value);
                    setSelectedFilterValue("");
                  }}
                  w="150px"
                >
                  {dynamicFilterOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {selectedFilterCategory && (
              <Box>
                <FormControl>
                  <FormLabel fontSize="sm">Filter Value</FormLabel>
                  <Select
                    placeholder="Select value"
                    value={selectedFilterValue}
                    onChange={(e) => setSelectedFilterValue(e.target.value)}
                    w="150px"
                  >
                    {dynamicFilterOptions
                      .find((option) => option.key === selectedFilterCategory)
                      ?.options.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {selectedFilterCategory && selectedFilterValue && (
              <Button onClick={addCurrentFilter} colorScheme="blue" mt="24px">
                Add Filter
              </Button>
            )}

            {/* Export Buttons */}
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                leftIcon={<DownloadIcon />}
                mt="24px"
              >
                Export
              </MenuButton>
              <MenuList>
                <MenuItem onClick={exportToExcel}>Excel</MenuItem>
                <MenuItem onClick={exportToPDF}>PDF</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <Wrap spacing={2} mt={2}>
            {activeFilters.map((filter, index) => (
              <WrapItem key={index}>
                <Tag colorScheme="blue" borderRadius="full" variant="solid">
                  <TagLabel>
                    {dynamicFilterOptions.find(
                      (option) => option.key === filter.key
                    )?.label || filter.key}
                    : {filter.value}
                  </TagLabel>
                  <TagCloseButton onClick={() => removeFilter(index)} />
                </Tag>
              </WrapItem>
            ))}
            {activeFilters.length > 1 && (
              <WrapItem>
                <Button size="xs" onClick={() => setActiveFilters([])}>
                  Clear All
                </Button>
              </WrapItem>
            )}
          </Wrap>
        )}
      </Stack>

      {/* Users Table */}
      <TableContainer borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Batch</Th>
              <Th>Joined At</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Tr key={user._id}>
                  <Td>{user.name}</Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <Badge
                      colorScheme={user.role === "student" ? "green" : "purple"}
                    >
                      {user.role}
                    </Badge>
                  </Td>
                  <Td>{user.batch}</Td>
                  <Td>{formatDate(user.createdAt)}</Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        size="sm"
                      >
                        Update Role
                      </MenuButton>
                      <MenuList>
                        <MenuItem
                          onClick={() => updateRole(user._id, "alumni")}
                        >
                          Alumni
                        </MenuItem>
                        <MenuItem onClick={() => updateRole(user._id, "admin")}>
                          Admin
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6} textAlign="center" py={4}>
                  No users found matching your filters
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Summary */}
      <Box mt={4} textAlign="right">
        Showing {filteredUsers.length} of {users.length} users
      </Box>
    </Box>
  );
};

export default UserManagementPage;
