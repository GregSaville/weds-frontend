import { useState, useEffect, useCallback } from "react";
import { Box, Flex, Text, Spinner, Image, Button, Icon } from "@chakra-ui/react";
import axios from "axios";

export default function GalleryView() {
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const publicBase = process.env.REACT_APP_PUBLIC_BASE || "/public";

  const fetchAllMedia = useCallback(async () => {
    try {
      setIsLoading(true);
      let currentPage = 0;
      let allItems = [];
      let isLast = false;
      while (!isLast) {
        const res = await axios.get(`${publicBase}/gallery?page=${currentPage}&size=50`);
        allItems = [...allItems, ...res.data.content];
        isLast = res.data.last;
        currentPage++;
      }
      setMediaItems(allItems);
    } catch (err) {
      console.error("Failed to load gallery", err);
    } finally {
      setIsLoading(false);
    }
  }, [publicBase]);

  useEffect(() => {
    fetchAllMedia();
  }, [fetchAllMedia]);

  const [isPaused, setIsPaused] = useState(false);
  const [activeAsset, setActiveAsset] = useState(null);

  const handleAssetClick = (item) => {
    setActiveAsset(item);
    setIsPaused(true);
  };

  const closeAsset = () => {
    setActiveAsset(null);
    setIsPaused(false);
  };

  const displayItems = [...mediaItems, ...mediaItems, ...mediaItems, ...mediaItems];

  const duration = Math.max(mediaItems.length * 8, 30);

  return (
    <Box minH="100vh" bg="transparent" overflowX="hidden" display="flex" alignItems="center" justifyContent="center">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-25%); }
        }
      `}</style>
      <Box w="full" position="relative" h="80vh" display="flex" alignItems="center" overflow="hidden">
          {isLoading && mediaItems.length === 0 ? (
            <Flex justify="center" w="full">
              <Spinner size="xl" color="teal.500" />
            </Flex>
          ) : mediaItems.length === 0 ? (
            <Text textAlign="center" w="full" color="gray.600">No memories yet!</Text>
          ) : (
            <Box
              style={{
                animation: `marquee ${duration}s linear infinite`,
                animationPlayState: isPaused ? 'paused' : 'running',
                display: 'flex',
                whiteSpace: 'nowrap',
                width: 'fit-content'
              }}
            >
              {displayItems.map((item, index) => (
                <Flex
                  key={`${item.id}-${index}`}
                  direction="column"
                  flexShrink={0}
                  mx={4}
                  w={{ base: "300px", md: "400px" }}
                  h={{ base: "400px", md: "500px" }}
                  borderRadius="xl"
                  overflow="hidden"
                  boxShadow="2xl"
                  bg="white"
                  position="relative"
                  cursor="pointer"
                  onClick={() => handleAssetClick(item)}
                  transition="opacity 0.2s"
                  opacity={isPaused ? 0.6 : 1}
                >
                  <Flex flex={1} w="full" overflow="hidden" align="center" justify="center" bg="gray.100">
                    {item.mediaType === "IMAGE" ? (
                      <Image
                        src={item.mediaUrl}
                        alt={item.caption || "Gallery Image"}
                        w="full"
                        h="full"
                        objectFit="cover"
                        loading="lazy"
                      />
                    ) : (
                      <Box position="relative" w="full" h="full">
                        <Box as="video" src={item.mediaUrl} w="full" h="full" objectFit="cover" pointerEvents="none" />
                        <Flex position="absolute" top={0} left={0} right={0} bottom={0} align="center" justify="center" bg="blackAlpha.300">
                          <Icon viewBox="0 0 24 24" fill="white" w={16} h={16} opacity={0.8}>
                            <path d="M8 5v14l11-7z" />
                          </Icon>
                        </Flex>
                      </Box>
                    )}
                  </Flex>
                  {(item.caption || item.uploadedBy) && (
                    <Box w="full" p={4} bg="white" color="gray.800" borderTopWidth="1px" borderColor="gray.100">
                      {item.caption && <Text fontWeight="bold" fontSize="lg" isTruncated>{item.caption}</Text>}
                      {item.uploadedBy && <Text fontSize="sm" color="gray.500">By {item.uploadedBy}</Text>}
                    </Box>
                  )}
                </Flex>
              ))}
            </Box>
          )}
        </Box>

      {activeAsset && (
        <Flex
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.800"
          zIndex={9999}
          align="center"
          justify="center"
          onClick={closeAsset}
          backdropFilter="blur(10px)"
        >
          <Box position="relative" maxW="90vw" maxH="90vh" onClick={(e) => e.stopPropagation()}>
            <Button
              position="absolute"
              top={{ base: -12, md: -14 }}
              right={{ base: 0, md: -10 }}
              onClick={closeAsset}
              colorScheme="whiteAlpha"
              variant="solid"
              borderRadius="full"
              size="sm"
              zIndex={10}
            >
              Close
            </Button>
            <Flex direction="column" w="full" h="full" bg="white" borderRadius="lg" overflow="hidden" boxShadow="2xl">
              <Flex flex={1} overflow="hidden" align="center" justify="center" bg="black">
                {activeAsset.mediaType === "IMAGE" ? (
                  <Image src={activeAsset.mediaUrl} maxW="100%" maxH="80vh" objectFit="contain" />
                ) : (
                  <Box as="video" src={activeAsset.mediaUrl} controls autoPlay maxW="100%" maxH="80vh" />
                )}
              </Flex>
              {(activeAsset.caption || activeAsset.uploadedBy) && (
                <Box w="full" p={4} bg="white" color="gray.800">
                  {activeAsset.caption && <Text fontSize="xl" fontWeight="bold">{activeAsset.caption}</Text>}
                  {activeAsset.uploadedBy && <Text fontSize="md" color="gray.500">Uploaded by: {activeAsset.uploadedBy}</Text>}
                </Box>
              )}
            </Flex>
          </Box>
        </Flex>
      )}
    </Box>
  );
}
