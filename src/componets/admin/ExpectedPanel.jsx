import { Badge, Box, Heading, Table, Text } from "@chakra-ui/react";

export default function ExpectedPanel({ expected, expectedLoading, totals }) {
  const groups = expected.map((a, idx) => {
    const mainName = a?.guestName ? `${a.guestName.firstName || ""} ${a.guestName.lastName || ""}`.trim() : "-";
    const guests = Array.isArray(a.additionalGuests) ? a.additionalGuests : [];
    const partySize = 1 + guests.length;
    const rows = [
      {
        name: mainName,
        type: "Primary",
        note: a?.message || "-",
      },
      ...guests.map((ag) => ({
        name: `${ag.firstName || ""} ${ag.lastName || ""}`.trim() || "Guest",
        type: "Guest",
        note: ag.specialAccommodations || "-",
      })),
    ];
    return { id: a.id || idx, partySize, rows };
  });

  return (
    <>
      <Heading size="md" mb={4} color="teal.700">
        Expected Turnout ({totals.expectedCount})
      </Heading>
      <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Table.Root variant="outline" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Type</Table.ColumnHeader>
              <Table.ColumnHeader>Accommodations / Message</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {expectedLoading ? (
              <Table.Row>
                <Table.Cell colSpan={3}>Loading...</Table.Cell>
              </Table.Row>
            ) : groups.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={3}>
                  <Text color="gray.600">No expected attendees yet.</Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              groups.flatMap((group, gIdx) => {
                const isLastGroup = gIdx === groups.length - 1;
                return [
                  <Table.Row key={`group-${group.id}`} bg="gray.50">
                    <Table.Cell colSpan={3}>
                      <Text fontWeight="700" color="teal.700">
                        Group {gIdx + 1} · Party of {group.partySize}
                      </Text>
                    </Table.Cell>
                  </Table.Row>,
                  ...group.rows.map((row, rIdx) => (
                    <Table.Row key={`row-${group.id}-${rIdx}`}>
                      <Table.Cell>{row.name}</Table.Cell>
                      <Table.Cell>
                        <Badge colorScheme={row.type === "Primary" ? "blue" : "purple"}>{row.type}</Badge>
                      </Table.Cell>
                      <Table.Cell>{row.note}</Table.Cell>
                    </Table.Row>
                  )),
                  !isLastGroup ? (
                    <Table.Row key={`separator-${group.id}`}>
                      <Table.Cell colSpan={3} p={0} bg="gray.100" />
                    </Table.Row>
                  ) : null,
                ].filter(Boolean);
              })
            )}
          </Table.Body>
        </Table.Root>
      </Box>
    </>
  );
}
