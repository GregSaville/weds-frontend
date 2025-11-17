import { Badge, Heading, Table } from "@chakra-ui/react";

export default function ExpectedPanel({ expected, expectedLoading, totals }) {
  const rows = expected.flatMap((a) => {
    const list = [];
    const mainName = a?.guestName ? `${a.guestName.firstName || ""} ${a.guestName.lastName || ""}`.trim() : "-";
    list.push({ name: mainName, type: "Main", note: a?.message || "-" });
    if (Array.isArray(a.additionalGuests)) {
      a.additionalGuests.forEach((ag) => {
        const gname = `${ag.firstName || ""} ${ag.lastName || ""}`.trim();
        list.push({ name: gname, type: "Guest", note: ag.specialAccommodations || "-" });
      });
    }
    return list;
  });

  return (
    <>
      <Heading size="md" mb={4} color="teal.700">
        Expected Turnout ({totals.expectedCount})
      </Heading>
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
          ) : (
            rows.map((row, idx) => (
              <Table.Row key={idx}>
                <Table.Cell>{row.name}</Table.Cell>
                <Table.Cell>
                  <Badge colorScheme={row.type === "Main" ? "blue" : "purple"}>{row.type}</Badge>
                </Table.Cell>
                <Table.Cell>{row.note}</Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
    </>
  );
}
