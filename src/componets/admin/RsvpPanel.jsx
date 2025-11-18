import { Box, Button, Heading, Stack, Table, Text, useBreakpointValue } from "@chakra-ui/react";
import StatusTag from "./StatusTag";

export default function RsvpPanel({ rsvps, rsvpsLoading, viewRsvpDetail, fmt, deleteRsvp, selectedRsvpId, detailContent }) {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const renderMobile = () => {
    if (rsvpsLoading) {
      return <Text>Loading RSVPs...</Text>;
    }
    if (!rsvps.length) {
      return <Text color="gray.600">No RSVPs have been submitted yet.</Text>;
    }
    return (
      <Stack spacing={3}>
        {rsvps.map((r) => {
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
          <Table.Cell colSpan={6}>Loading RSVPs...</Table.Cell>
        </Table.Row>
      );
    }

    if (!rsvps.length) {
      return (
        <Table.Row>
          <Table.Cell colSpan={6}>
            <Text color="gray.600">No RSVPs have been submitted yet.</Text>
          </Table.Cell>
        </Table.Row>
      );
    }

    return rsvps.flatMap((r) => {
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
          <Table.Cell>
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
          </Table.Cell>
        </Table.Row>,
        selectedRsvpId === r.id && detailContent ? (
          <Table.Row key={`${r.id}-detail`}>
            <Table.Cell colSpan={6} p={0} bg="gray.50">
              <Box p={4}>{detailContent}</Box>
            </Table.Cell>
          </Table.Row>
        ) : null,
      ].filter(Boolean);
    });
  };

  return (
    <Stack spacing={3}>
      <Heading size="md" color="teal.700">
        RSVPs
      </Heading>
      {isMobile ? (
        renderMobile()
      ) : (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Table.Root variant="outline" size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Name</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Review Status</Table.ColumnHeader>
                <Table.ColumnHeader>Message</Table.ColumnHeader>
                <Table.ColumnHeader>Created</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>{renderRows()}</Table.Body>
          </Table.Root>
        </Box>
      )}
    </Stack>
  );
}
