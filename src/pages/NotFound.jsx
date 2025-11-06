// pages/NotFound.jsx
import React from "react";
import { Box, Heading, Text, Button, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      p={6}
    >
      <VStack spacing={6} textAlign="center">
        <Heading size="2xl">404</Heading>
        <Text fontSize="lg" color="gray.600">
          Oops! The page you’re looking for doesn’t exist.
        </Text>
        <Button colorScheme="teal" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </VStack>
    </Box>
  );
}
