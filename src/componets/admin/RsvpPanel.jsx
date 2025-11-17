import { Button, Heading, Table } from "@chakra-ui/react";
import StatusTag from "./StatusTag";

export default function RsvpPanel({ rsvps, rsvpsLoading, viewRsvpDetail, fmt, deleteRsvp }) {
  return (
    <>
      <Heading size="md" mb={4} color="teal.700">
        RSVPs
      </Heading>
      <Table.Root variant="outline" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Message</Table.ColumnHeader>
            <Table.ColumnHeader>Created</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rsvpsLoading ? (
            <Table.Row>
              <Table.Cell colSpan={5}>Loading RSVPs...</Table.Cell>
            </Table.Row>
          ) : (
            rsvps.map((r) => (
              <Table.Row key={r.id} onClick={() => viewRsvpDetail(r.id)} cursor="pointer">
                <Table.Cell>{r.name ? `${r.name.firstName || ""} ${r.name.lastName || ""}`.trim() : "-"}</Table.Cell>
                <Table.Cell>
                  <StatusTag status={r.status} />
                </Table.Cell>
                <Table.Cell>
                  {r.message
                    ? `${String(r.message).slice(0, 48)}${String(r.message).length > 48 ? "..." : ""}`
                    : "-"}
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
            ))
          )}
        </Table.Body>
      </Table.Root>
    </>
  );
}
