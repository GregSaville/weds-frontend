import { Box, Button, Heading, Stack, Table, Text } from "@chakra-ui/react";
import StatusTag from "./StatusTag";

export default function RsvpPanel({ rsvps, rsvpsLoading, viewRsvpDetail, fmt, deleteRsvp, selectedRsvpId }) {
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

    return rsvps.map((r) => {
      const approval = (r.approvalStatus || "PENDING_REVIEW").toUpperCase();
      const isPendingReview = approval === "PENDING_REVIEW";
      const rowBg = selectedRsvpId === r.id ? "yellow.50" : isPendingReview ? "orange.50" : undefined;
      return (
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
        </Table.Row>
      );
    });
  };

  return (
    <Stack spacing={3}>
      <Heading size="md" color="teal.700">
        RSVPs
      </Heading>
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
    </Stack>
  );
}
