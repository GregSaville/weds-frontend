import { Box, Button, Flex, SimpleGrid, Text, Image, HStack, Spinner, Tabs } from "@chakra-ui/react";
import { useToast } from "../../componets/ToastProvider";
import axios from "axios";
import { getAuthHeader } from "../../utils/auth";
import { useState, useEffect, useCallback } from "react";

export default function GalleryAdjudicationPanel({ uploads, loading, reload }) {
  const adminBase = process.env.REACT_APP_ADMIN_BASE || "/admin";
  const { showToast } = useToast();
  const [tab, setTab] = useState("pending");

  // State for past adjudications
  const [pastUploads, setPastUploads] = useState([]);
  const [pastLoading, setPastLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);

  const fetchPastAdjudications = useCallback(async (pageNum = 0, status = "APPROVED") => {
    setPastLoading(true);
    try {
      const res = await axios.get(`${adminBase}/gallery?status=${status}&page=${pageNum}&size=20`, {
        headers: { Authorization: getAuthHeader() }
      });
      if (pageNum === 0) {
        setPastUploads(res.data.content);
      } else {
        setPastUploads(prev => [...prev, ...res.data.content]);
      }
      setHasMore(!res.data.last);
      setPage(pageNum);
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error", 5000);
    } finally {
      setPastLoading(false);
    }
  }, [adminBase, showToast]);

  useEffect(() => {
    if (tab === "approved") fetchPastAdjudications(0, "APPROVED");
    else if (tab === "rejected") fetchPastAdjudications(0, "REJECTED");
  }, [tab, fetchPastAdjudications]);

  const handleAdjudicate = async (id, status) => {
    try {
      await axios.put(
        `${adminBase}/gallery/${id}/adjudicate`,
        { status },
        { headers: { Authorization: getAuthHeader() } }
      );
      showToast(`Upload marked as ${status}`, "success", 3000);
      if (tab === "pending") reload();
      else fetchPastAdjudications(0, tab.toUpperCase());
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error", 5000);
    }
  };

  const renderUploads = (items, isPending) => {
    if (!items || items.length === 0) {
      return (
        <Box p={8} textAlign="center">
          <Text color="gray.500">No uploads found.</Text>
        </Box>
      );
    }
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} p={4}>
        {items.map((upload) => (
          <Box key={upload.id} borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="sm" bg="white">
            {upload.mediaType === "IMAGE" ? (
              <Image 
                src={upload.mediaUrl} 
                alt={upload.caption || "Pending Upload"} 
                w="full" h="200px" objectFit="cover" 
                cursor="pointer"
                onClick={() => setPreviewMedia(upload)}
              />
            ) : (
              <Box 
                as="video" 
                src={upload.mediaUrl} 
                w="full" h="200px" objectFit="cover" 
                cursor="pointer"
                onClick={() => setPreviewMedia(upload)}
              />
            )}
            <Box p={4}>
              {upload.caption && <Text fontWeight="bold">{upload.caption}</Text>}
              <Text fontSize="sm" color="gray.500">By: {upload.uploadedBy || "Anonymous"}</Text>
              <Text fontSize="xs" color="gray.400" mt={1}>
                {new Date(upload.uploadedAt).toLocaleString()}
              </Text>
              {isPending ? (
                <HStack mt={4} spacing={3}>
                  <Button colorScheme="green" size="sm" flex={1} onClick={() => handleAdjudicate(upload.id, "APPROVED")}>
                    Approve
                  </Button>
                  <Button colorScheme="red" size="sm" flex={1} onClick={() => handleAdjudicate(upload.id, "REJECTED")}>
                    Reject
                  </Button>
                </HStack>
              ) : (
                <HStack mt={4} spacing={3}>
                  <Text fontSize="sm" fontWeight="medium" color={upload.status === "APPROVED" ? "green.600" : "red.600"} flex={1}>
                    Status: {upload.status}
                  </Text>
                  <Button size="xs" variant="outline" onClick={() => handleAdjudicate(upload.id, upload.status === "APPROVED" ? "REJECTED" : "APPROVED")}>
                    Change to {upload.status === "APPROVED" ? "REJECTED" : "APPROVED"}
                  </Button>
                </HStack>
              )}
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    );
  };

  return (
    <Box>
      <Tabs.Root variant="enclosed" onValueChange={(e) => setTab(e.value)} defaultValue="pending">
        <Tabs.List>
          <Tabs.Trigger value="pending">Pending Review</Tabs.Trigger>
          <Tabs.Trigger value="approved">Approved</Tabs.Trigger>
          <Tabs.Trigger value="rejected">Rejected</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="pending">
          {loading ? (
            <Flex justify="center" p={8}><Spinner size="xl" /></Flex>
          ) : (
            renderUploads(uploads, true)
          )}
        </Tabs.Content>
        <Tabs.Content value="approved">
          {pastLoading && page === 0 ? (
            <Flex justify="center" p={8}><Spinner size="xl" /></Flex>
          ) : (
            <>
              {renderUploads(pastUploads, false)}
              {hasMore && (
                <Flex justify="center" p={4}>
                  <Button onClick={() => fetchPastAdjudications(page + 1, "APPROVED")} isLoading={pastLoading}>
                    Load More
                  </Button>
                </Flex>
              )}
            </>
          )}
        </Tabs.Content>
        <Tabs.Content value="rejected">
          {pastLoading && page === 0 ? (
            <Flex justify="center" p={8}><Spinner size="xl" /></Flex>
          ) : (
            <>
              {renderUploads(pastUploads, false)}
              {hasMore && (
                <Flex justify="center" p={4}>
                  <Button onClick={() => fetchPastAdjudications(page + 1, "REJECTED")} isLoading={pastLoading}>
                    Load More
                  </Button>
                </Flex>
              )}
            </>
          )}
        </Tabs.Content>
      </Tabs.Root>

      {previewMedia && (
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
          onClick={() => setPreviewMedia(null)}
        >
          <Box position="relative" maxW="90vw" maxH="90vh" onClick={(e) => e.stopPropagation()}>
            <Button
              position="absolute"
              top={-10}
              right={-10}
              onClick={() => setPreviewMedia(null)}
              colorScheme="red"
              borderRadius="full"
              size="sm"
            >
              X
            </Button>
            {previewMedia.mediaType === "IMAGE" ? (
              <Image src={previewMedia.mediaUrl} maxW="90vw" maxH="90vh" objectFit="contain" />
            ) : (
              <Box as="video" src={previewMedia.mediaUrl} controls maxW="90vw" maxH="90vh" />
            )}
          </Box>
        </Flex>
      )}
    </Box>
  );
}
