import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Spacer,
  Stack,
  Separator,
  Table,
  Tag,
  TagLabel,
  Text,
  Textarea,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuth, clearAuth, getAuthHeader } from "../utils/auth";
import axios from "axios";
import { useToast } from "../componets/ToastProvider";

const RSVP_STATUS_META = {
  ACCEPTED: { label: "Accepted", scheme: "green" },
  DECLINED: { label: "Declined", scheme: "red" },
  WAITLISTED: { label: "Waitlisted", scheme: "purple" },
  PENDING: { label: "Pending", scheme: "gray" },
};

const RSVP_STATUS_ORDER = ["ACCEPTED", "PENDING", "DECLINED", "WAITLISTED"];

const getStatusMeta = (status) => {
  if (!status) return { label: "Pending", scheme: "gray" };
  const key = String(status).toUpperCase();
  if (RSVP_STATUS_META[key]) return RSVP_STATUS_META[key];
  return { label: status, scheme: "blue" };
};

const StatusTag = ({ status, size = "sm" }) => {
  const meta = getStatusMeta(status);
  return (
    <Tag
      size={size}
      colorScheme={meta.scheme}
      variant="subtle"
      borderRadius="full"
      px={3}
      py={1}
      textTransform="uppercase"
      letterSpacing="wide"
      fontWeight="600"
    >
      <TagLabel>{meta.label}</TagLabel>
    </Tag>
  );
};

const InfoStat = ({ label, value }) => {
  const displayValue = value === undefined || value === null || value === "" ? "-" : value;
  return (
    <Box>
      <Text fontSize="xs" textTransform="uppercase" color="gray.500" letterSpacing="wide" mb={1}>
        {label}
      </Text>
      <Text fontWeight="600">{displayValue}</Text>
    </Box>
  );
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [invitees, setInvitees] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [rsvpsLoading, setRsvpsLoading] = useState(false);
  const [selectedRsvp, setSelectedRsvp] = useState(null);
  const [rsvpDetailLoading, setRsvpDetailLoading] = useState(false);
  const [rsvpSaving, setRsvpSaving] = useState(false);
  const [view, setView] = useState("guests"); // 'guests' | 'rsvps'
  const [inviteFormOpen, setInviteFormOpen] = useState(false);
  const [inviteFirst, setInviteFirst] = useState("");
  const [inviteLast, setInviteLast] = useState("");
  const [inviteSize, setInviteSize] = useState("1");
  const [inviteForce, setInviteForce] = useState(false);
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isOpen: isRsvpModalOpen, onOpen: openRsvpModal, onClose: closeRsvpModal } = useDisclosure();
  const [isEditingRsvp, setIsEditingRsvp] = useState(false);

  const [expected, setExpected] = useState([]);
  const [expectedLoading, setExpectedLoading] = useState(false);
  const [turnoutCount, setTurnoutCount] = useState(0);

  const totals = useMemo(() => {
    const total = invitees.length;
    const rsvpsCount = rsvps.length;
    const computed = expected.reduce((acc, a) => acc + 1 + (Array.isArray(a.additionalGuests) ? a.additionalGuests.length : 0), 0);
    const expectedCount = turnoutCount || computed;
    return { total, rsvpsCount, expectedCount };
  }, [invitees, rsvps, expected, turnoutCount]);

  useEffect(() => {
    const bootstrap = async () => {
      const authorized = await checkAuth();
      if (!authorized) {
        showToast("Unauthorized - redirecting to login", "error");
        navigate("/admin/login");
        return;
      }

      await reloadInvitees();
      setLoading(false);
    };

    bootstrap();
  }, [navigate, showToast]);

  const adminBase = process.env.REACT_APP_ADMIN_BASE || "/api/admin";

  const reloadInvitees = async () => {
    try {
      const res = await axios.get(`${adminBase}/invitees`, {
        headers: { Authorization: getAuthHeader() },
      });
      setInvitees(res.data || []);
    } catch (err) {
      showToast(`Error fetching invitees: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  // Load RSVPs when the RSVPs tab is selected
  useEffect(() => {
    const loadRsvps = async () => {
      if (view !== "rsvps") return;
      setRsvpsLoading(true);
      try {
        const base = process.env.REACT_APP_ADMIN_BASE || "/api/admin";
        const res = await axios.get(`${base}/rsvps`, {
          headers: { Authorization: getAuthHeader() },
        });
        setRsvps(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        showToast(`Error fetching RSVPs: ${err.response?.data?.message || err.message}`, "error");
      } finally {
        setRsvpsLoading(false);
      }
    };
    loadRsvps();
  }, [view, showToast]);

  // Load Expected Turnout when selected
  useEffect(() => {
    const loadExpected = async () => {
      if (view !== "expected") return;
      setExpectedLoading(true);
      try {
        const res = await axios.get(`${adminBase}/expected-turnout`, {
          headers: { Authorization: getAuthHeader() },
        });
        if (res.data && Array.isArray(res.data.attendees)) {
          setExpected(res.data.attendees);
          setTurnoutCount(Number(res.data.count) || 0);
        } else if (Array.isArray(res.data)) {
          // backward compatibility: API returned a plain list
          setExpected(res.data);
          setTurnoutCount(0);
        } else {
          setExpected([]);
          setTurnoutCount(0);
        }
      } catch (err) {
        showToast(`Error fetching expected turnout: ${err.response?.data?.message || err.message}`, "error");
      } finally {
        setExpectedLoading(false);
      }
    };
    loadExpected();
  }, [view, showToast]);

  const fmt = (ts) => {
    if (!ts) return "-";
    try {
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return String(ts);
      return d.toLocaleString();
    } catch { return String(ts); }
  };

  const formatName = (name) => {
    if (!name) return "-";
    return `${name.firstName || ""} ${name.lastName || ""}`.trim() || "-";
  };

  const formatAddress = (address) => {
    if (!address) return "-";
    const parts = [
      address.line1,
      address.line2,
      [address.city, address.state].filter(Boolean).join(", "),
      address.postalCode || address.zip,
    ].filter((part) => part && String(part).trim().length > 0);
    return parts.length ? parts.join(", ") : "-";
  };

  const handleLogout = () => {
    clearAuth();
    showToast("Logged out successfully", "info");
    navigate("/admin/login");
  };

  const inviteGuest = async (guest) => {
    const origin = window.location?.origin || '';
    const link = `${origin}/rsvp?token=${guest.id}`;
    try { await navigator.clipboard.writeText(link); } catch {}
    showToast(`Invite link:\n${link}\n(click to dismiss)`, "info", 0);
  };

  const inviteNewGuest = async () => {
    const firstName = inviteFirst.trim();
    const lastName = inviteLast.trim();
    const allowedPartySize = Math.max(parseInt(inviteSize || '1', 10) || 1, 1);
    if (!firstName || !lastName) {
      showToast("Provide first and last name", "error");
      return;
    }
    setInviteSubmitting(true);
    try {
      const body = { name: { firstName, lastName }, allowedPartySize, force: !!inviteForce };
      const res = await axios.post(`${adminBase}/invite`, body, {
        headers: { Authorization: getAuthHeader(), "Content-Type": "application/json" },
      });
      const link = res.data?.link || res.data?.inviteLink || res.data || "";
      if (link) {
        try { await navigator.clipboard.writeText(String(link)); } catch {}
        showToast(`Invite created:\n${String(link)}\n(click to dismiss)`, "success", 0);
      } else {
        showToast("Invite created", "success");
      }
      setInviteFirst("");
      setInviteLast("");
      setInviteSize("1");
      setInviteForce(false);
      setInviteFormOpen(false);
      await reloadInvitees();
    } catch (err) {
      showToast(`Invite failed: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setInviteSubmitting(false);
    }
  };

  const deleteInvitee = async (guest) => {
    if (!guest?.id) return;
    try {
      await axios.delete(`${adminBase}/invitees/${guest.id}`, {
        headers: { Authorization: getAuthHeader() },
      });
      showToast("Guest deleted", "info");
      setInvitees((prev) => prev.filter((g) => g.id !== guest.id));
    } catch (err) {
      showToast(`Delete failed: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  const viewRsvpDetail = (id) => {
    if (!id) return;
    setSelectedRsvp(null);
    setIsEditingRsvp(false);
    openRsvpModal();
    loadRsvpDetail(id);
  };

  const openRsvpFromGuest = (rsvpId) => {
    if (!rsvpId) return;
    setView("rsvps");
    viewRsvpDetail(rsvpId);
  };

  const loadRsvpDetail = async (id) => {
    setRsvpDetailLoading(true);
    try {
      const res = await axios.get(`${adminBase}/rsvps/${id}`, {
        headers: { Authorization: getAuthHeader() },
      });
      setSelectedRsvp(res.data);
      setIsEditingRsvp(false);
    } catch (err) {
      showToast(`Failed to load RSVP: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setRsvpDetailLoading(false);
    }
  };

  const updateRsvpField = (field, value) => {
    setSelectedRsvp((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const updateAddressField = (field, value) => {
    setSelectedRsvp((prev) => {
      if (!prev) return prev;
      const nextAddress = { ...(prev.address || {}), [field]: value };
      return { ...prev, address: nextAddress };
    });
  };

  const handleStatusChange = (status) => {
    if (!status) return;
    setSelectedRsvp((prev) => (prev ? { ...prev, status } : prev));
  };

  const handleCloseRsvpModal = () => {
    closeRsvpModal();
    setSelectedRsvp(null);
    setIsEditingRsvp(false);
  };

  const handleCancelEdit = () => {
    if (!selectedRsvp?.id) {
      setIsEditingRsvp(false);
      return;
    }
    setIsEditingRsvp(false);
    loadRsvpDetail(selectedRsvp.id);
  };

  const additionalGuestCount = Array.isArray(selectedRsvp?.additionalGuests) ? selectedRsvp.additionalGuests.length : 0;
  const totalGuestsResponding = selectedRsvp ? 1 + additionalGuestCount : 0;

  useEffect(() => {
    if (view !== "rsvps" && isRsvpModalOpen) {
      closeRsvpModal();
      setSelectedRsvp(null);
      setIsEditingRsvp(false);
    }
  }, [view, isRsvpModalOpen, closeRsvpModal]);

  const saveRsvpDetail = async () => {
    if (!selectedRsvp?.id) return;
    setRsvpSaving(true);
    try {
      const body = {
        status: selectedRsvp.status,
        email: selectedRsvp.email || null,
        phone: selectedRsvp.phone || null,
        address: selectedRsvp.address || null,
        additionalGuests: selectedRsvp.additionalGuests || null,
        message: selectedRsvp.message || null,
      };
      const res = await axios.post(`${adminBase}/rsvps/${selectedRsvp.id}`, body, {
        headers: { Authorization: getAuthHeader(), "Content-Type": "application/json" },
      });
      setSelectedRsvp(res.data);
      setIsEditingRsvp(false);
      // refresh list lightly
      setRsvps((list) => list.map((r) => (r.id === res.data.id ? { ...r, status: res.data.status, message: res.data.message, name: res.data.name, createdAt: res.data.createdAt } : r)));
      showToast("RSVP updated", "success");
    } catch (err) {
      showToast(`Update failed: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setRsvpSaving(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text>Loading...</Text>
      </Flex>
    );
  }

  return (
    <VStack spacing={6} p={6} align="stretch">
      <HStack>
        <Heading color="teal.600" size="lg">
          Admin Dashboard
        </Heading>
        <Spacer />
        <Button colorScheme="red" variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Box
          onClick={() => setView("guests")}
          cursor="pointer"
          bg={view === "guests" ? "yellow.100" : "whiteAlpha.700"}
          backdropFilter="blur(10px)"
          border="1px solid rgba(255,255,255,0.4)"
          boxShadow="0 4px 10px rgba(0,0,0,0.08)"
          borderRadius="xl"
          p={6}
        >
          <Heading size="md" color="#b08649">
            Guest List
          </Heading>
          <Text mt={2} color="gray.600">
            Total Guests: <b>{totals.total}</b>
          </Text>
        </Box>

        <Box
          onClick={() => setView("rsvps")}
          cursor="pointer"
          bg={view === "rsvps" ? "yellow.100" : "whiteAlpha.700"}
          backdropFilter="blur(10px)"
          border="1px solid rgba(255,255,255,0.4)"
          boxShadow="0 4px 10px rgba(0,0,0,0.08)"
          borderRadius="xl"
          p={6}
        >
          <Heading size="md" color="#b08649">
            RSVPs
          </Heading>
          <Text mt={2} color="gray.600">
            Responded: <b>{totals.rsvpsCount}</b>
          </Text>
        </Box>

        <Box
          onClick={() => setView("expected")}
          cursor="pointer"
          bg={view === "expected" ? "yellow.100" : "whiteAlpha.700"}
          backdropFilter="blur(10px)"
          border="1px solid rgba(255,255,255,0.4)"
          boxShadow="0 4px 10px rgba(0,0,0,0.08)"
          borderRadius="xl"
          p={6}
        >
          <Heading size="md" color="#b08649">
            Expected Turnout
          </Heading>
          <Text mt={2} color="gray.600">
            Count: <b>{totals.expectedCount}</b>
          </Text>
        </Box>
      </SimpleGrid>

      <Box
        bg="rgba(255,255,255,0.7)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(255,255,255,0.4)"
        boxShadow="0 4px 10px rgba(0,0,0,0.1)"
        borderRadius="xl"
        p={4}
      >
        {view === "guests" && (
          <>
            <HStack mb={4}>
              <Heading size="md" color="teal.700">Guest List</Heading>
              <Spacer />
              <Button size="sm" colorScheme="yellow" onClick={() => setInviteFormOpen((v) => !v)}>
                {inviteFormOpen ? 'Close' : 'Invite New Guest'}
              </Button>
            </HStack>

            {inviteFormOpen && (
              <Box mb={4} p={3} borderWidth="1px" borderRadius="md" bg="whiteAlpha.800">
                <HStack spacing={3} mb={2} align="flex-end">
                  <Input placeholder="First Name" value={inviteFirst} onChange={(e) => setInviteFirst(e.target.value)} />
                  <Input placeholder="Last Name" value={inviteLast} onChange={(e) => setInviteLast(e.target.value)} />
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>Party Size</Text>
                    <Input type="number" min={1} placeholder="Party Size" value={inviteSize} onChange={(e) => setInviteSize(e.target.value)} w="140px" />
                  </Box>
                  <Box>
                    <HStack>
                      <input type="checkbox" checked={inviteForce} onChange={(e) => setInviteForce(e.target.checked)} />
                      <Text>Force</Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.600">If two guests have the same name, allow it.</Text>
                  </Box>
                  <Button colorScheme="yellow" onClick={inviteNewGuest} isLoading={inviteSubmitting}>Create Invite</Button>
                </HStack>
                <Text fontSize="sm" color="gray.600">Creates a new invite and returns a shareable RSVP link.</Text>
              </Box>
            )}
            <Table.Root variant="outline" size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>First Name</Table.ColumnHeader>
                  <Table.ColumnHeader>Last Name</Table.ColumnHeader>
                  <Table.ColumnHeader>Allowed Party Size</Table.ColumnHeader>
                  <Table.ColumnHeader>RSVP</Table.ColumnHeader>
                  <Table.ColumnHeader>Actions</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {invitees.map((g) => (
                  <Table.Row key={g.id}>
                    <Table.Cell>{g.firstName}</Table.Cell>
                    <Table.Cell>{g.lastName}</Table.Cell>
                    <Table.Cell>{g.allowedPartySize}</Table.Cell>
                    <Table.Cell>
                      {g.rsvpId != null ? (
                        <Badge
                          colorScheme="green"
                          as="button"
                          onClick={() => openRsvpFromGuest(g.rsvpId)}
                          cursor="pointer"
                          title="View RSVP details"
                        >
                          Responded
                        </Badge>
                      ) : (
                        <Badge colorScheme="gray">Pending</Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <HStack>
                        <Button size="sm" colorScheme="yellow" variant="solid" onClick={() => inviteGuest(g)}>
                          Invite Link
                        </Button>
                        <Button size="sm" colorScheme="red" variant="outline" onClick={() => deleteInvitee(g)}>
                          Delete
                        </Button>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </>
        )}

        {view === "rsvps" && (
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
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rsvpsLoading ? (
                  <Table.Row>
                    <Table.Cell colSpan={4}>Loading RSVPs...</Table.Cell>
                  </Table.Row>
                ) : (
                  rsvps.map((r) => (
                    <Table.Row
                      key={r.id}
                      onClick={() => viewRsvpDetail(r.id)}
                      cursor="pointer"
                    >
                      <Table.Cell>{r.name ? `${r.name.firstName || ""} ${r.name.lastName || ""}`.trim() : "-"}</Table.Cell>
                      <Table.Cell>
                        <StatusTag status={r.status} />
                      </Table.Cell>
                      <Table.Cell>
                        {r.message
                          ? `${String(r.message).slice(0, 48)}${
                              String(r.message).length > 48 ? "..." : ""
                            }`
                          : "-"}
                      </Table.Cell>
                      <Table.Cell>{fmt(r.createdAt)}</Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </>
        )}

        {view === "expected" && (
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
                  expected.flatMap((a) => {
                    const rows = [];
                    const mainName = a?.guestName ? `${a.guestName.firstName || ''} ${a.guestName.lastName || ''}`.trim() : '-';
                    rows.push({ name: mainName, type: 'Main', note: a?.message || '-' });
                    if (Array.isArray(a.additionalGuests)) {
                      a.additionalGuests.forEach((ag) => {
                        const gname = `${ag.firstName || ''} ${ag.lastName || ''}`.trim();
                        rows.push({ name: gname, type: 'Guest', note: ag.specialAccommodations || '-' });
                      });
                    }
                    return rows;
                  }).map((row, idx) => (
                    <Table.Row key={idx}>
                      <Table.Cell>{row.name}</Table.Cell>
                      <Table.Cell>
                        <Badge colorScheme={row.type === 'Main' ? 'blue' : 'purple'}>{row.type}</Badge>
                      </Table.Cell>
                      <Table.Cell>{row.note}</Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </>
        )}
      </Box>

      <Dialog.Root
        open={isRsvpModalOpen}
        onOpenChange={({ open }) => {
          if (!open) handleCloseRsvpModal();
        }}
      >
        <Dialog.Backdrop bg="blackAlpha.500" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content maxW="920px" w="full" bg="white" borderRadius="lg" boxShadow="xl">
            <Dialog.CloseTrigger position="absolute" top={4} right={4} rounded="full" />
            <Dialog.Header>
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="sm" color="gray.500">
                  RSVP Detail
                </Text>
                <HStack spacing={3} flexWrap="wrap">
                  <Heading size="md">{selectedRsvp ? formatName(selectedRsvp.name) : "RSVP"}</Heading>
                  {selectedRsvp && <StatusTag status={selectedRsvp.status} size="md" />}
                </HStack>
                {selectedRsvp?.createdAt && (
                  <Text fontSize="xs" color="gray.500">
                    Submitted {fmt(selectedRsvp.createdAt)}
                  </Text>
                )}
              </VStack>
            </Dialog.Header>
            <Dialog.Body>
              {rsvpDetailLoading ? (
                <Flex minH="220px" align="center" justify="center">
                  <Text>Loading RSVP...</Text>
                </Flex>
              ) : selectedRsvp ? (
                <VStack align="stretch" spacing={6}>
                  <Box>
                    <Heading size="sm" color="teal.700">
                      Guest Overview
                    </Heading>
                    <Separator mt={1} />
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                      <InfoStat label="Primary Guest" value={formatName(selectedRsvp.name)} />
                      <InfoStat label="Guests Responding" value={totalGuestsResponding ? totalGuestsResponding.toString() : "-"} />
                      <InfoStat label="Email" value={selectedRsvp.email || "-"} />
                      <InfoStat label="Phone" value={selectedRsvp.phone || "-"} />
                    </SimpleGrid>
                  </Box>

                  <Box>
                    <Heading size="sm" color="teal.700">
                      Message
                    </Heading>
                    <Separator mt={1} />
                    <Text mt={3} color={selectedRsvp.message ? "gray.800" : "gray.500"}>
                      {selectedRsvp.message || "No personal message was included."}
                    </Text>
                  </Box>

                  <Box>
                    <Heading size="sm" color="teal.700">
                      Address
                    </Heading>
                    <Separator mt={1} />
                    <Text mt={3} color={selectedRsvp.address ? "gray.800" : "gray.500"}>
                      {formatAddress(selectedRsvp.address)}
                    </Text>
                  </Box>

                  {selectedRsvp.specialAccommodations && (
                    <Box>
                      <Heading size="sm" color="teal.700">
                        Special Accommodations
                      </Heading>
                      <Separator mt={1} />
                      <Text mt={3}>{selectedRsvp.specialAccommodations}</Text>
                    </Box>
                  )}

                  {additionalGuestCount > 0 && (
                    <Box>
                      <Heading size="sm" color="teal.700">
                        Additional Guests ({additionalGuestCount})
                      </Heading>
                      <Separator mt={1} />
                      <Stack mt={4} spacing={3}>
                        {selectedRsvp.additionalGuests.map((guest, idx) => (
                          <Box key={idx} p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
                            <Text fontWeight="600">
                              {`${guest.firstName || ""} ${guest.lastName || ""}`.trim() || `Guest ${idx + 1}`}
                            </Text>
                            {guest.specialAccommodations && (
                              <Text fontSize="sm" color="gray.600">
                                {guest.specialAccommodations}
                              </Text>
                            )}
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {isEditingRsvp && (
                    <Box>
                      <Heading size="sm" color="teal.700">
                        Update RSVP
                      </Heading>
                      <Separator mt={1} />
                      <VStack align="stretch" spacing={4} mt={4}>
                        <FormControl>
                          <FormLabel fontSize="sm">Response Status</FormLabel>
                          <Stack direction="row" flexWrap="wrap" spacing={2}>
                            {RSVP_STATUS_ORDER.map((statusKey) => (
                              <Button
                                key={statusKey}
                                size="sm"
                                variant={String(selectedRsvp.status || "").toUpperCase() === statusKey ? "solid" : "outline"}
                                colorScheme={getStatusMeta(statusKey).scheme}
                                onClick={() => handleStatusChange(statusKey)}
                              >
                                {getStatusMeta(statusKey).label}
                              </Button>
                            ))}
                          </Stack>
                        </FormControl>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel fontSize="sm">Email</FormLabel>
                            <Input value={selectedRsvp.email || ""} onChange={(e) => updateRsvpField("email", e.target.value)} placeholder="Email address" />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm">Phone</FormLabel>
                            <Input value={selectedRsvp.phone || ""} onChange={(e) => updateRsvpField("phone", e.target.value)} placeholder="Phone number" />
                          </FormControl>
                        </SimpleGrid>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel fontSize="sm">Address Line 1</FormLabel>
                            <Input value={selectedRsvp.address?.line1 || ""} onChange={(e) => updateAddressField("line1", e.target.value)} placeholder="Street address" />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm">Address Line 2</FormLabel>
                            <Input value={selectedRsvp.address?.line2 || ""} onChange={(e) => updateAddressField("line2", e.target.value)} placeholder="Apartment, suite, etc." />
                          </FormControl>
                        </SimpleGrid>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <FormControl>
                            <FormLabel fontSize="sm">City</FormLabel>
                            <Input value={selectedRsvp.address?.city || ""} onChange={(e) => updateAddressField("city", e.target.value)} placeholder="City" />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm">State / Province</FormLabel>
                            <Input value={selectedRsvp.address?.state || ""} onChange={(e) => updateAddressField("state", e.target.value)} placeholder="State" />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm">Postal Code</FormLabel>
                            <Input value={selectedRsvp.address?.postalCode || ""} onChange={(e) => updateAddressField("postalCode", e.target.value)} placeholder="Postal code" />
                          </FormControl>
                        </SimpleGrid>
                        <FormControl>
                          <FormLabel fontSize="sm">Message</FormLabel>
                          <Textarea value={selectedRsvp.message || ""} onChange={(e) => updateRsvpField("message", e.target.value)} placeholder="Add an internal note" rows={4} />
                        </FormControl>
                      </VStack>
                    </Box>
                  )}
                </VStack>
              ) : (
                <Text color="gray.500">Select an RSVP to view its details.</Text>
              )}
            </Dialog.Body>
            <Dialog.Footer justifyContent="space-between" flexWrap="wrap" gap={3}>
              <Button variant="ghost" onClick={handleCloseRsvpModal}>
                Close
              </Button>
              {selectedRsvp && !rsvpDetailLoading && (
                isEditingRsvp ? (
                  <HStack spacing={3}>
                    <Button variant="ghost" onClick={handleCancelEdit} isDisabled={rsvpSaving}>
                      Cancel
                    </Button>
                    <Button colorScheme="yellow" onClick={saveRsvpDetail} isLoading={rsvpSaving}>
                      Save Changes
                    </Button>
                  </HStack>
                ) : (
                  <Button colorScheme="yellow" onClick={() => setIsEditingRsvp(true)}>
                    Edit RSVP
                  </Button>
                )
              )}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </VStack>
  );
}
