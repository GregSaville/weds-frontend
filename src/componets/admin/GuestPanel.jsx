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
import inputIcon from "../../img/icon/input-icon.png";

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
}) {
  const isMobile = useBreakpointValue({ base: true, md: false });

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
        {renderInviteForm()}
        <Stack spacing={3}>
          {invitees.map((g) => {
            const key = g.id || `${g.firstName}-${g.lastName}`;
            const name = `${g.firstName || ""} ${g.lastName || ""}`.trim() || "Guest";
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
                    <Text color="gray.600">Party Size: {g.allowedPartySize}</Text>
                  </VStack>
                </HStack>
                <Stack mt={3} spacing={2}>
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
                    {g.rsvpId != null ? (
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
          <Button size="sm" colorScheme="yellow" onClick={() => setInviteFormOpen((v) => !v)}>
            {inviteFormOpen ? "Close" : "Invite New Guest"}
          </Button>
        </HStack>
      </HStack>
      {renderInviteForm()}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {invitees.map((g) => {
          const name = `${g.firstName || ""} ${g.lastName || ""}`.trim() || "Guest";
          return (
            <Box key={g.id} p={4} borderWidth="1px" borderRadius="lg" bg="white" boxShadow="sm">
              <VStack align="start" spacing={2}>
                <Heading size="sm">{name}</Heading>
                <Text color="gray.700">Party Size: {g.allowedPartySize}</Text>
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
                  {g.rsvpId != null ? (
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
