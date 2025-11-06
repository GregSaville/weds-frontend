import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { checkAuth } from "../utils/auth";
import { Flex, Spinner, Text, VStack } from "@chakra-ui/react";

export default function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    checkAuth().then(setIsAuthorized);
  }, []);

  // While checking authentication — show a loading spinner
  if (isAuthorized === null) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="100vh"
        bg="gray.50"
      >
        <VStack spacing={4}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="yellow.400"
            size="xl"
          />
          <Text color="gray.600" fontSize="lg">
            Checking authorization...
          </Text>
        </VStack>
      </Flex>
    );
  }

  if (!isAuthorized) return <Navigate to="/admin/login" replace />;
  // If this component wraps nested routes, render them via <Outlet />.
  return children || <Outlet />;
}
