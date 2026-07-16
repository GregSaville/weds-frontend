import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Text,
  useBreakpointValue,
  VStack,
  Image,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import inputIcon from "../../img/icon/input-icon.png";

function PartySizeEditor({ guest, updateInviteePartySize }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(guest.allowedPartySize ?? 1));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateInviteePartySize(guest, draft);
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(String(guest.allowedPartySize ?? 1));
    setEditing(false);
  };

  if (!editing) {
    return (
      <HStack spacing={2}>
        <Text color="gray.700">Party Size: <b>{guest.allowedPartySize}</b></Text>
        <Button
          size="xs"
          variant="outline"
          colorScheme="yellow"
          onClick={() => {
            setDraft(String(guest.allowedPartySize ?? 1));
            setEditing(true);
          }}
        >
          Edit
        </Button>
      </HStack>
    );
  }

  return (
    <HStack spacing={2} align="center">
      <Text fontSize="sm" color="gray.600" flexShrink={0}>Party Size:</Text>
      <Input
        type="number"
        min={1}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        w="70px"
        size="sm"
        autoFocus
      />
      <Button size="xs" colorScheme="green" onClick={handleSave} isLoading={saving}>
        Save
      </Button>
      <Button size="xs" variant="ghost" onClick={handleCancel} isDisabled={saving}>
        Cancel
      </Button>
    </HStack>
  );
}

export default function GuestPanel({
  invitees,
  inviteFormOpen,
  setInviteFormOpen,
  inviteFirst,
  inviteLast,
  inviteSize,
  inviteForce,
  setInviteFirst,
  setInviteLast,
  setInviteSize,
  setInviteForce,
  inviteSubmitting,
  inviteNewGuest,
  inviteGuest,
  copyInviteCode,
  openRsvpFromGuest,
  deleteInvitee,
  updateInviteePartySize,
}) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, PENDING, RESPONDED

  const filteredInvitees = useMemo(() => {
    return (invitees || []).filter((g) => {
      // Status Filter
      const hasResponded = g.rsvpId != null;
      if (filterStatus === "PENDING" && hasResponded) return false;
      if (filterStatus === "RESPONDED" && !hasResponded) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const first = (g.firstName || "").toLowerCase();
        const last = (g.lastName || "").toLowerCase();
        const name = `${first} ${last}`;
        const code = String(g.guestCode || "").toLowerCase();
        
        if (!name.includes(q) && !code.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [invitees, filterStatus, searchQuery]);

  const renderInviteForm = () => (
    inviteFormOpen && (
      <Box mb={4} p={3} borderWidth="1px" borderRadius="md" bg="whiteAlpha.800">
        <HStack spacing={3} mb={2} align="flex-end" wrap="wrap">
          <Input placeholder="First Name" value={inviteFirst} onChange={(e) => setInviteFirst(e.target.value)} />
          <Input placeholder="Last Name" value={inviteLast} onChange={(e) => setInviteLast(e.target.value)} />
          <Box>
            <Text fontSize="sm" color="gray.600" mb={1}>
              Party Size
            </Text>
            <Input
              type="number"
              min={1}
              placeholder="Party Size"
              value={inviteSize}
              onChange={(e) => setInviteSize(e.target.value)}
              w="140px"
            />
          </Box>
          <Box>
            <HStack>
              <input type="checkbox" checked={inviteForce} onChange={(e) => setInviteForce(e.target.checked)} />
              <Text>Force</Text>
            </HStack>
            <Text fontSize="xs" color="gray.600">
              If two guests have the same name, allow it.
            </Text>
          </Box>
          <Button colorScheme="yellow" onClick={inviteNewGuest} isLoading={inviteSubmitting}>
            Create Invite
          </Button>
        </HStack>
        <Text fontSize="sm" color="gray.600">
          Creates a new invite and returns a shareable RSVP link.
        </Text>
      </Box>
    )
  );

  if (isMobile) {
    return (
      <>
        <HStack mb={4}>
          <Heading size="md" color="teal.700">
            Guest List
          </Heading>
          <Button size="sm" colorScheme="yellow" ml="auto" onClick={() => setInviteFormOpen((v) => !v)}>
            {inviteFormOpen ? "Close" : "Invite New Guest"}
          </Button>
        </HStack>
        <Stack spacing={3} mb={4}>
          <Input 
            placeholder="Search by name or invite code..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="white"
          />
          <HStack>
            <Button size="sm" variant={filterStatus === "ALL" ? "solid" : "outline"} colorScheme="yellow" onClick={() => setFilterStatus("ALL")}>All</Button>
            <Button size="sm" variant={filterStatus === "PENDING" ? "solid" : "outline"} colorScheme="yellow" onClick={() => setFilterStatus("PENDING")}>Pending</Button>
            <Button size="sm" variant={filterStatus === "RESPONDED" ? "solid" : "outline"} colorScheme="yellow" onClick={() => setFilterStatus("RESPONDED")}>Responded</Button>
          </HStack>
        </Stack>
        {renderInviteForm()}
        <Stack spacing={3}>
          {filteredInvitees.map((g) => {
            const key = g.id || `${g.firstName}-${g.lastName}`;
            const name = `${g.firstName || ""} ${g.lastName || ""}`.trim() || "Guest";
            const hasResponded = g.rsvpId != null;
            return (
              <Box
                key={key}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                bg="white"
                boxShadow="sm"
              >
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{name}</Text>
                  </VStack>
                </HStack>
                <Stack mt={3} spacing={2}>
                  {/* Party size — editable always */}
                  <PartySizeEditor guest={g} updateInviteePartySize={updateInviteePartySize} />
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Invite Code</Text>
                    <HStack spacing={2}>
                      <Text fontFamily="mono">{g.guestCode || "-"}</Text>
                      {g.guestCode && (
                        <Button size="xs" variant="outline" onClick={() => copyInviteCode(g.guestCode)}>
                          Copy
                        </Button>
                      )}
                    </HStack>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">RSVP</Text>
                    {hasResponded ? (
                      <Badge
                        as="button"
                        colorPalette="blue"
                        variant="solid"
                        onClick={() => openRsvpFromGuest(g.rsvpId)}
                        cursor="pointer"
                        boxShadow="sm"
                        px={3}
                        py={2}
                        fontSize="sm"
                        display="inline-flex"
                        alignItems="center"
                        gap={2}
                      >
                        <Image src={inputIcon} alt="Open" boxSize="12px" objectFit="contain" />
                        Responded
                      </Badge>
                    ) : (
                      <Badge colorPalette="yellow" variant="solid" boxShadow="sm" px={3} py={2} fontSize="sm">
                        Pending
                      </Badge>
                    )}
                  </HStack>
                  <HStack spacing={3}>
                    <Button size="sm" colorScheme="yellow" variant="solid" onClick={() => inviteGuest(g)}>
                      Invite Link
                    </Button>
                    <Button size="sm" colorScheme="red" variant="outline" onClick={() => deleteInvitee(g)}>
                      Delete
                    </Button>
                  </HStack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </>
    );
  }

  return (
    <>
      <HStack mb={4}>
        <Heading size="md" color="teal.700">
          Guest List
        </Heading>
        <HStack ml="auto" spacing={3}>
          <Input 
            placeholder="Search by name or invite code..." 
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
            <option value="ALL">All Guests</option>
            <option value="PENDING">Pending</option>
            <option value="RESPONDED">Responded</option>
          </select>
          <Button size="sm" colorScheme="yellow" onClick={() => setInviteFormOpen((v) => !v)}>
            {inviteFormOpen ? "Close" : "Invite New Guest"}
          </Button>
        </HStack>
      </HStack>
      {renderInviteForm()}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {filteredInvitees.map((g) => {
          const name = `${g.firstName || ""} ${g.lastName || ""}`.trim() || "Guest";
          const hasResponded = g.rsvpId != null;
          return (
            <Box key={g.id} p={4} borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm">
              <VStack align="start" spacing={2}>
                <Heading size="sm">{name}</Heading>

                {/* Party size — editable always */}
                <PartySizeEditor guest={g} updateInviteePartySize={updateInviteePartySize} />

                <HStack spacing={2}>
                  <Text fontWeight="semibold">Invite Code:</Text>
                  <Text fontFamily="mono">{g.guestCode || "-"}</Text>
                  {g.guestCode && (
                    <Button size="xs" variant="outline" onClick={() => copyInviteCode(g.guestCode)}>
                      Copy
                    </Button>
                  )}
                </HStack>
                <HStack spacing={2}>
                  <Text fontWeight="semibold">RSVP:</Text>
                  {hasResponded ? (
                    <Badge
                      colorPalette="blue"
                      variant="solid"
                      as="button"
                      onClick={() => openRsvpFromGuest(g.rsvpId)}
                      cursor="pointer"
                      boxShadow="sm"
                      title="View RSVP details"
                      px={3}
                      py={2}
                      fontSize="sm"
                      display="inline-flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Image src={inputIcon} alt="Open" boxSize="12px" objectFit="contain" />
                      Responded
                    </Badge>
                  ) : (
                    <Badge colorPalette="yellow" variant="solid" boxShadow="sm" px={3} py={2} fontSize="sm">
                      Pending
                    </Badge>
                  )}
                </HStack>
                <HStack spacing={3}>
                  <Button size="sm" colorScheme="yellow" variant="solid" onClick={() => inviteGuest(g)}>
                    Invite Link
                  </Button>
                  <Button size="sm" colorScheme="red" variant="outline" onClick={() => deleteInvitee(g)}>
                    Delete
                  </Button>
                </HStack>
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    </>
  );
}
