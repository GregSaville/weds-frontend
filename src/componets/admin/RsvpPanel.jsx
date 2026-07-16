import { Box, Button, Heading, Stack, Table, Text, useBreakpointValue, HStack, Input } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import StatusTag from "./StatusTag";

export default function RsvpPanel({ rsvps, rsvpsLoading, viewRsvpDetail, fmt, deleteRsvp, selectedRsvpId, detailContent }) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, ACCEPTED, DECLINED
  const [filterApproval, setFilterApproval] = useState("ALL"); // ALL, PENDING_REVIEW, APPROVED, REJECTED

  const filteredRsvps = useMemo(() => {
    return (rsvps || []).filter((r) => {
      // Status Filter
      if (filterStatus !== "ALL" && (r.status || "").toUpperCase() !== filterStatus) return false;
      
      // Approval Filter
      const approval = (r.approvalStatus || "PENDING_REVIEW").toUpperCase();
      if (filterApproval !== "ALL" && approval !== filterApproval) return false;

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const first = r.name?.firstName?.toLowerCase() || "";
        const last = r.name?.lastName?.toLowerCase() || "";
        const name = `${first} ${last}`;
        const email = (r.email || "").toLowerCase();
        const message = (r.message || "").toLowerCase();

        if (!name.includes(q) && !email.includes(q) && !message.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [rsvps, filterStatus, filterApproval, searchQuery]);

  const renderMobile = () => {
    if (rsvpsLoading) {
      return <Text>Loading RSVPs...</Text>;
    }
    if (!rsvps.length) {
      return <Text color="gray.600">No RSVPs have been submitted yet.</Text>;
    }
    if (!filteredRsvps.length && rsvps.length > 0) {
      return <Text color="gray.600">No RSVPs match your filters.</Text>;
    }
    return (
      <Stack spacing={3}>
        {filteredRsvps.map((r) => {
          const approval = r.approvalStatus || "PENDING_REVIEW";
          return (
            <Box
              key={r.id}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              bg={selectedRsvpId === r.id ? "yellow.50" : "white"}
              onClick={() => viewRsvpDetail(r.id)}
              cursor="pointer"
              boxShadow="sm"
            >
              <Stack spacing={2}>
                <Stack direction="row" justify="space-between" align="center">
                  <Text fontWeight="700">{r.name ? `${r.name.firstName || ""} ${r.name.lastName || ""}`.trim() : "-"}</Text>
                  <StatusTag status={r.status} />
                </Stack>
                <StatusTag status={approval} />
                <Text color="gray.700">{r.message ? `${String(r.message).slice(0, 80)}${String(r.message).length > 80 ? "..." : ""}` : "No message"}</Text>
                <Text fontSize="xs" color="gray.500">
                  {fmt(r.createdAt)}
                </Text>
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRsvp(r);
                  }}
                >
                  Delete
                </Button>
                {selectedRsvpId === r.id && detailContent && (
                  <Box mt={2} borderWidth="1px" borderRadius="md" p={3} bg="yellow.50">
                    {detailContent}
                  </Box>
                )}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    );
  };

  const renderRows = () => {
    if (rsvpsLoading) {
      return (
        <Table.Row>
          <Table.Cell colSpan={5}>Loading RSVPs...</Table.Cell>
        </Table.Row>
      );
    }

    if (!rsvps.length) {
      return (
        <Table.Row>
          <Table.Cell colSpan={5}>
            <Text color="gray.600">No RSVPs have been submitted yet.</Text>
          </Table.Cell>
        </Table.Row>
      );
    }

    if (!filteredRsvps.length && rsvps.length > 0) {
      return (
        <Table.Row>
          <Table.Cell colSpan={5}>
            <Text color="gray.600">No RSVPs match your filters.</Text>
          </Table.Cell>
        </Table.Row>
      );
    }

    return filteredRsvps.flatMap((r) => {
      const approval = (r.approvalStatus || "PENDING_REVIEW").toUpperCase();
      const isPendingReview = approval === "PENDING_REVIEW";
      const rowBg = selectedRsvpId === r.id ? "yellow.50" : isPendingReview ? "orange.50" : undefined;
      return [
        <Table.Row
          key={r.id}
          onClick={() => viewRsvpDetail(r.id)}
          cursor="pointer"
          bg={rowBg}
          _hover={{ bg: rowBg || "yellow.50" }}
          borderLeftWidth="4px"
          borderLeftColor={isPendingReview ? "orange.300" : "green.300"}
        >
          <Table.Cell>
            <Stack spacing={0}>
              <Text>{r.name ? `${r.name.firstName || ""} ${r.name.lastName || ""}`.trim() : "-"}</Text>
              <Text fontSize="xs" color={isPendingReview ? "orange.700" : "green.700"}>
                {isPendingReview ? "Pending review" : "Approved"}
              </Text>
            </Stack>
          </Table.Cell>
          <Table.Cell>
            <StatusTag status={r.status} />
          </Table.Cell>
          <Table.Cell>
            <StatusTag status={r.approvalStatus || "PENDING_REVIEW"} />
          </Table.Cell>
          <Table.Cell>
            {r.message ? `${String(r.message).slice(0, 48)}${String(r.message).length > 48 ? "..." : ""}` : "-"}
          </Table.Cell>
          <Table.Cell>{fmt(r.createdAt)}</Table.Cell>
        </Table.Row>,
        selectedRsvpId === r.id && detailContent ? (
          <Table.Row key={`${r.id}-detail`}>
            <Table.Cell colSpan={5} p={0} bg="gray.50">
              <Box p={4}>{detailContent}</Box>
            </Table.Cell>
          </Table.Row>
        ) : null,
      ].filter(Boolean);
    });
  };

  return (
    <Stack spacing={3}>
      <HStack mb={4} wrap="wrap" justify="space-between" spacing={4}>
        <Heading size="md" color="teal.700">
          RSVPs
        </Heading>
        {!isMobile && (
          <HStack spacing={3}>
            <Input 
              placeholder="Search by name, email, or message..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="white"
              w="250px"
              size="sm"
            />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #CBD5E0", fontSize: "14px", height: "32px", backgroundColor: "white" }}
            >
              <option value="ALL">All Responses</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DECLINED">Declined</option>
            </select>
            <select 
              value={filterApproval} 
              onChange={(e) => setFilterApproval(e.target.value)}
              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #CBD5E0", fontSize: "14px", height: "32px", backgroundColor: "white" }}
            >
              <option value="ALL">All Reviews</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </HStack>
        )}
      </HStack>
      {isMobile && (
        <Stack spacing={3} mb={4}>
          <Input 
            placeholder="Search RSVPs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="white"
          />
          <HStack>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #CBD5E0", fontSize: "14px", height: "32px", backgroundColor: "white", flex: 1 }}
            >
              <option value="ALL">All Responses</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DECLINED">Declined</option>
            </select>
            <select 
              value={filterApproval} 
              onChange={(e) => setFilterApproval(e.target.value)}
              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #CBD5E0", fontSize: "14px", height: "32px", backgroundColor: "white", flex: 1 }}
            >
              <option value="ALL">All Reviews</option>
              <option value="PENDING_REVIEW">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </HStack>
        </Stack>
      )}
      {isMobile ? (
        renderMobile()
      ) : (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Table.Root variant="outline" size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Response</Table.ColumnHeader>
                <Table.ColumnHeader>Review Status</Table.ColumnHeader>
              <Table.ColumnHeader>Message</Table.ColumnHeader>
              <Table.ColumnHeader>Created</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
            <Table.Body>{renderRows()}</Table.Body>
          </Table.Root>
        </Box>
      )}
    </Stack>
  );
}
