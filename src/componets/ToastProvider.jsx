import React, { createContext, useContext, useState, useCallback } from "react";
import { Box, Text, VStack } from "@chakra-ui/react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, status = "info", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, status, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Centered toasts */}
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex="toast"
        pointerEvents="none"
      >
        <VStack spacing={3}>
          {toasts.map((toast) => (
              <Box
                key={toast.id}
                bg="rgba(255, 255, 255, 0.85)"
                backdropFilter="blur(10px)"
                border="1px solid rgba(255, 255, 255, 0.4)"
                color="black"
                fontWeight="semibold"
                textAlign="center"
                px={6}
                py={3}
                borderRadius="xl"
                boxShadow="0 4px 24px rgba(0,0,0,0.25)"
                maxW="sm"
                pointerEvents="auto"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              >
                <Text
                  fontSize="lg"
                  textShadow="0 0 12px rgba(0,0,0,0.2)"
                >
                  {toast.message}
                </Text>
              </Box>
          ))}
        </VStack>
      </Box>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
