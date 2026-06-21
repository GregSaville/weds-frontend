import { useState, useEffect, useRef, useCallback } from "react";
import { Box, Flex, Text, Button, Input, VStack, Spinner, Image, Icon } from "@chakra-ui/react";
import { useToast } from "../componets/ToastProvider";
import { useTranslation } from "react-i18next";
import NavBar from "../componets/NavBar";
import LanguageSlider from "../componets/LanguageSlider";
import TitleWithBrackets from "../componets/TitleWithBrackets";
import axios from "axios";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export default function Gallery() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [caption, setCaption] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadsOpen, setUploadsOpen] = useState(false);

  const publicBase = process.env.REACT_APP_PUBLIC_BASE || "/public";

  const fetchSettings = useCallback(async () => {
    try {
      const res = await axios.get(`${publicBase}/settings`);
      if (res.data) {
        setUploadsOpen(!!res.data.galleryUploadsOpen);
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    }
  }, [publicBase]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const [mediaItems, setMediaItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef();

  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );


  const fetchMedia = useCallback(async (pageNumber) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${publicBase}/gallery?page=${pageNumber}&size=20`);
      const newItems = res.data?.content || [];
      setMediaItems((prev) => [...prev, ...newItems]);
      setHasMore(!res.data.last);
    } catch (err) {
      console.error("Failed to load gallery", err);
    } finally {
      setIsLoading(false);
    }
  }, [publicBase]);

  useEffect(() => {
    fetchMedia(page);
  }, [page, fetchMedia]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) {
        showToast("File is too large! Maximum allowed size is 50MB.", "error", 5000);
        return;
      }
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        showToast("Invalid file type. Please select an image or a video.", "error", 5000);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (uploadedBy) formData.append("uploadedBy", uploadedBy);
      if (caption) formData.append("caption", caption);

      await axios.post(`${publicBase}/gallery/upload`, formData);

      showToast("Your file has been uploaded and is pending approval.", "success", 5000);

      setSelectedFile(null);
      setCaption("");
      setUploadedBy("");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "There was an error uploading your file.", "error", 5000);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box minH="100vh" bg="transparent" pb={12}>
      <NavBar />
      <Flex direction="column" align="center" pt={24} px={4}>
        <TitleWithBrackets fontSize={["3xl", "4xl", "5xl"]}>
          {t("home.nav.gallery") || "Gallery"}
        </TitleWithBrackets>
        <LanguageSlider />

        {/* Upload Section */}
        {uploadsOpen ? (
          <Box
            mt={10}
            p={8}
          bg="white"
          borderRadius="2xl"
          boxShadow="2xl"
          w="full"
          maxW="2xl"
        >
          <VStack spacing={6}>
            <Text fontSize="2xl" fontWeight="medium" color="gray.800" fontFamily="serif">
              Share Your Memories
            </Text>
            <VStack spacing={2} px={4} textAlign="center">
              <Text fontSize="md" color="gray.600">
                We would love to see our special day through your eyes. Upload your favorite photos or videos below!
              </Text>
              <Flex align="center" justify="center" color="green.600" fontSize="xs" bg="green.50" px={3} py={1} borderRadius="full" border="1px solid" borderColor="green.100">
                <Icon viewBox="0 0 24 24" fill="currentColor" w={3} h={3} mr={1.5}>
                  <path d="M12 1c-3.3 0-6 2.7-6 6v4H5v12h14V11h-1V7c0-3.3-2.7-6-6-6zm0 2c2.2 0 4 1.8 4 4v4H8V7c0-2.2 1.8-4 4-4zm0 13.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z" />
                </Icon>
                <Text fontWeight="medium">
                  Safe & Private. Your uploads are securely encrypted and sent directly to the couple, who will curate favorites for the public gallery.
                </Text>
              </Flex>
            </VStack>

            <Box
              w="full"
              p={10}
              border="2px dashed"
              borderColor="teal.200"
              borderRadius="xl"
              bg="teal.50"
              textAlign="center"
              cursor="pointer"
              onClick={() => fileInputRef.current?.click()}
              _hover={{ bg: "teal.100", borderColor: "teal.300", transform: "scale(1.01)" }}
              transition="all 0.2s"
            >
              <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" w={12} h={12} color="teal.500" mb={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </Icon>
              <Text fontWeight="semibold" color="teal.700" fontSize="lg">
                Tap to select a file
              </Text>
              <Text fontSize="sm" color="teal.600" mt={1}>
                Images and videos are welcome
              </Text>
            </Box>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={handleFileChange}
              hidden
            />

            {selectedFile && (
              <Box w="full" position="relative" borderRadius="xl" overflow="hidden" boxShadow="md" bg="black">
                {selectedFile.type.startsWith("image/") ? (
                  <Image src={URL.createObjectURL(selectedFile)} alt="Preview" w="full" maxH="400px" objectFit="contain" />
                ) : (
                  <Box as="video" src={URL.createObjectURL(selectedFile)} controls w="full" maxH="400px" />
                )}
                <Button
                  position="absolute"
                  top={2}
                  right={2}
                  size="sm"
                  colorScheme="red"
                  variant="solid"
                  borderRadius="full"
                  onClick={() => setSelectedFile(null)}
                >
                  X
                </Button>
              </Box>
            )}

            <VStack w="full" spacing={4}>
              <Input
                placeholder="Your Name (optional)"
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                bg="gray.50"
                variant="filled"
                size="lg"
                _focus={{ bg: "white", borderColor: "teal.400" }}
              />
              <Input
                placeholder="Caption (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                bg="gray.50"
                variant="filled"
                size="lg"
                _focus={{ bg: "white", borderColor: "teal.400" }}
              />
              <Button
                colorScheme="teal"
                w="full"
                size="lg"
                isLoading={isUploading}
                onClick={handleUpload}
                isDisabled={!selectedFile}
                _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
                transition="all 0.2s"
                borderRadius="full"
                fontWeight="bold"
                mt={2}
              >
                Upload to Gallery
              </Button>
            </VStack>
          </VStack>
        </Box>
        ) : (
          <Box mt={10} p={8} bg="whiteAlpha.900" borderRadius="2xl" boxShadow="xl" w="full" maxW="2xl" textAlign="center">
            <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" w={10} h={10} color="gray.400" mb={3}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0110 0v4"></path>
            </Icon>
            <Text fontSize="xl" fontWeight="medium" color="gray.700" fontFamily="serif">
              Uploads are Closed
            </Text>
            <Text fontSize="md" color="gray.500" mt={2}>
              The couple has currently paused public uploads. Check back closer to the event date!
            </Text>
          </Box>
        )}

        {/* Masonry Layout */}
        <Box w="full" maxW="7xl" mt={16}>
          <Box
            sx={{
              columnCount: { base: 1, md: 2, lg: 3 },
              columnGap: "1rem",
            }}
          >
            {mediaItems.map((item, index) => {
              const isLast = index === mediaItems.length - 1;
              return (
                <MotionBox
                  key={item.id}
                  ref={isLast ? lastElementRef : null}
                  mb="1rem"
                  breakInside="avoid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="sm"
                  _hover={{ boxShadow: "xl", transform: "scale(1.02)" }}
                >
                  {item.mediaType === "IMAGE" ? (
                    <Image
                      src={item.mediaUrl}
                      alt={item.caption || "Gallery Image"}
                      w="full"
                      objectFit="cover"
                      loading="lazy"
                    />
                  ) : (
                    <Box as="video" src={item.mediaUrl} controls w="full" />
                  )}
                  {(item.caption || item.uploadedBy) && (
                    <Box p={3} bg="white">
                      {item.caption && <Text fontWeight="medium" color="gray.800">{item.caption}</Text>}
                      {item.uploadedBy && <Text fontSize="sm" color="gray.500">By {item.uploadedBy}</Text>}
                    </Box>
                  )}
                </MotionBox>
              );
            })}
          </Box>
          {isLoading && (
            <Flex justify="center" mt={8}>
              <Spinner size="xl" color="teal.500" />
            </Flex>
          )}
          {!hasMore && mediaItems.length > 0 && (
            <Text textAlign="center" mt={8} color="gray.600">
              You've seen all the memories!
            </Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
