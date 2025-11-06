import {
  Box,
  Button,
  Heading,
  Input,
  VStack,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setAuth } from "../utils/auth";
import { useToast } from "../componets/ToastProvider";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const authHeader = "Basic " + btoa(`${username}:${password}`);

    try {
      const res = await axios.get("http://localhost:8080/admin/health", {
        headers: { Authorization: authHeader },
      });

      if (res.status === 200) {
        // Persist credentials for subsequent requests
        setAuth(username, password);
        showToast("Login successful - welcome!", "success");
        navigate("/admin/dashboard");
      } else {
        showToast("Unexpected response during login.", "error");
      }
    } catch (err) {
      showToast(
        `Login failed: ${err.response?.data?.message || err.message}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex justify="center" align="center" h="100vh" bg="gray.50">
      <Box
        as="form"
        onSubmit={handleSubmit}
        bg="rgba(255,255,255,0.6)"
        backdropFilter="blur(12px)"
        p={8}
        rounded="2xl"
        boxShadow="0 8px 24px rgba(0,0,0,0.08)"
        w="full"
        maxW="md"
      >
        <VStack spacing={5} align="stretch">
          <Heading textAlign="center" size="lg" color="#b08649">
            Admin Login
          </Heading>

          <Box>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </Box>

          <Box>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Box>

          <Button
            colorScheme="yellow"
            type="submit"
            isLoading={loading}
            loadingText="Verifying..."
            size="lg"
          >
            Log In
          </Button>

          <Text textAlign="center" fontSize="sm" color="gray.600">
            Protected admin area - authorized personnel only.
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}

