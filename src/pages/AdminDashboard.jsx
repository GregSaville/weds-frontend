import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Spacer,
  Stack,
  Separator,
  Text,
  Textarea,
  VStack,
  FieldRoot as FormControl,
  FieldLabel as FormLabel,
  SwitchRoot,
  SwitchControl,
  SwitchThumb,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { checkAuth, clearAuth, getAuthHeader } from "../utils/auth";
import axios from "axios";
import { useToast } from "../componets/ToastProvider";
import GuestPanel from "../componets/admin/GuestPanel";
import RsvpPanel from "../componets/admin/RsvpPanel";
import ExpectedPanel from "../componets/admin/ExpectedPanel";
import StatusTag from "../componets/admin/StatusTag";

const getStatusMeta = (status) => {
  if (!status) return { label: "Pending", scheme: "gray" };
  const key = String(status).toUpperCase();
  const map = {
    ACCEPTED: { label: "Accepted", scheme: "green" },
    DECLINED: { label: "Declined", scheme: "red" },
    WAITLISTED: { label: "Waitlisted", scheme: "purple" },
    PENDING: { label: "Pending", scheme: "gray" },
    PENDING_REVIEW: { label: "Pending Review", scheme: "yellow" },
    APPROVED: { label: "Approved", scheme: "blue" },
    OPEN: { label: "Open", scheme: "green" },
    CLOSED: { label: "Closed", scheme: "red" },
    ANYONE: { label: "Anyone", scheme: "green" },
    INVITE: { label: "Invite Only", scheme: "blue" },
  };
  return map[key] || { label: status, scheme: "blue" };
};

const RSVP_STATUS_ORDER = ["ACCEPTED", "DECLINED"];
const APPROVAL_STATUS_ORDER = ["PENDING_REVIEW", "APPROVED"];

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

const SettingsHamburgerIcon = (props) => (
  <Icon viewBox="0 0 24 24" boxSize="22px" {...props}>
    <rect x="4" y="6" width="16" height="2.4" rx="1.2" fill="currentColor" />
    <rect x="4" y="10.8" width="16" height="2.4" rx="1.2" fill="currentColor" />
    <rect x="4" y="15.6" width="16" height="2.4" rx="1.2" fill="currentColor" />
  </Icon>
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [invitees, setInvitees] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [rsvpsLoading, setRsvpsLoading] = useState(false);
  const [selectedRsvp, setSelectedRsvp] = useState(null);
  const [rsvpDetailLoading, setRsvpDetailLoading] = useState(false);
  const [rsvpSaving, setRsvpSaving] = useState(false);
  const [inviteFormOpen, setInviteFormOpen] = useState(false);
  const [inviteFirst, setInviteFirst] = useState("");
  const [inviteLast, setInviteLast] = useState("");
  const [inviteSize, setInviteSize] = useState("1");
  const [inviteForce, setInviteForce] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = (() => {
    const tab = (searchParams.get("tab") || "").toLowerCase();
    if (tab === "rsvps" || tab === "expected" || tab === "guests") return tab;
    return "guests";
  })();
  const initialRsvpId = searchParams.get("rsvp") || null;
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [isEditingRsvp, setIsEditingRsvp] = useState(false);
  const [activeRsvpId, setActiveRsvpId] = useState(initialRsvpId);

  const [view, setView] = useState(initialView);
  const [expected, setExpected] = useState([]);
  const [expectedLoading, setExpectedLoading] = useState(false);
  const [turnoutCount, setTurnoutCount] = useState(0);
  const [settings, setSettings] = useState({ rsvpOpenToStrangers: false, rsvpClosed: false });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  const totals = useMemo(() => {
    const total = invitees.length;
    const rsvpsCount = rsvps.length;
    const computed = expected.reduce((acc, a) => acc + 1 + (Array.isArray(a.additionalGuests) ? a.additionalGuests.length : 0), 0);
    const expectedCount = turnoutCount || computed;
    return { total, rsvpsCount, expectedCount };
  }, [invitees, rsvps, expected, turnoutCount]);

  const adminBase = process.env.REACT_APP_ADMIN_BASE || "/api/admin";

  const reloadInvitees = useCallback(async () => {
    try {
      const res = await axios.get(`${adminBase}/invitees`, {
        headers: { Authorization: getAuthHeader() },
      });
      setInvitees(res.data || []);
    } catch (err) {
      showToast(`Error fetching invitees: ${err.response?.data?.message || err.message}`, "error");
    }
  }, [adminBase, showToast]);

  const reloadRsvps = useCallback(async () => {
    setRsvpsLoading(true);
    try {
      const res = await axios.get(`${adminBase}/rsvps`, {
        headers: { Authorization: getAuthHeader() },
      });
      setRsvps(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast(`Error fetching RSVPs: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setRsvpsLoading(false);
    }
  }, [adminBase, showToast]);

  const loadExpected = useCallback(async () => {
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
  }, [adminBase, showToast]);

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await axios.get(`${adminBase}/settings`, {
        headers: { Authorization: getAuthHeader() },
      });
      if (res.data) {
        setSettings({
          rsvpOpenToStrangers: !!res.data.rsvpOpenToStrangers,
          rsvpClosed: !!res.data.rsvpClosed,
        });
      }
    } catch (err) {
      showToast(`Error fetching settings: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setSettingsLoading(false);
      setIsEditingSettings(false);
    }
  }, [adminBase, showToast]);

  useEffect(() => {
    const bootstrap = async () => {
      const authorized = await checkAuth();
      if (!authorized) {
        showToast("Unauthorized - redirecting to login", "error");
        navigate("/admin/login");
        return;
      }

      await reloadInvitees();
      await reloadRsvps();
      await loadExpected();
      await loadSettings();
      setLoading(false);
    };

    bootstrap();
  }, [navigate, showToast, reloadInvitees, loadSettings, reloadRsvps, loadExpected]);

  // Refresh list data when switching tabs to keep counts fresh
  useEffect(() => {
    if (view === "rsvps") {
      reloadRsvps();
    } else if (view === "expected") {
      loadExpected();
    }
  }, [view, reloadRsvps, loadExpected]);

  const saveSettings = async (nextSettings, fallbackSettings) => {
    setSettingsSaving(true);
    try {
      const res = await axios.post(`${adminBase}/settings`, nextSettings, {
        headers: { Authorization: getAuthHeader(), "Content-Type": "application/json" },
      });
      setSettings(res.data || nextSettings);
      showToast("Settings updated", "success");
    } catch (err) {
      if (fallbackSettings) {
        setSettings(fallbackSettings);
      }
      showToast(`Failed to update settings: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setSettingsSaving(false);
    }
  };

  const setSettingValue = (key, value) => {
    setSettings((prev) => {
      const prevSettings = prev;
      const nextSettings = { ...prev, [key]: value };
      saveSettings(nextSettings, prevSettings);
      return nextSettings;
    });
  };

  const toggleSetting = (key, checkedValue) => {
    const next =
      typeof checkedValue === "boolean"
        ? checkedValue
        : typeof checkedValue === "object" && checkedValue !== null
          ? checkedValue.checked ?? checkedValue.target?.checked ?? !settings[key]
          : !settings[key];
    setSettingValue(key, next);
  };

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
      address.streetLine1 || address.line1,
      address.streetLine2 || address.line2,
      [address.city, address.state].filter(Boolean).join(", "),
      address.postalCode || address.zip,
    ].filter((part) => part && String(part).trim().length > 0);
    return parts.length ? parts.join(", ") : "-";
  };

  const normalizeAddress = (raw) => {
    if (!raw) return null;
    return {
      streetLine1: raw.streetLine1 ?? raw.line1 ?? raw.addressLine1 ?? "",
      streetLine2: raw.streetLine2 ?? raw.line2 ?? raw.addressLine2 ?? "",
      city: raw.city ?? "",
      state: raw.state ?? "",
      postalCode: raw.postalCode ?? raw.zip ?? "",
    };
  };

  const cleanAddressForSave = (address) => {
    if (!address) return null;
    const normalized = normalizeAddress(address);
    const hasValue = Object.values(normalized).some((v) => v && String(v).trim().length > 0);
    if (!hasValue) return null;
    return {
      streetLine1: normalized.streetLine1 || null,
      streetLine2: normalized.streetLine2 || null,
      city: normalized.city || null,
      state: normalized.state || null,
      postalCode: normalized.postalCode || null,
    };
  };

  const handleLogout = () => {
    clearAuth();
    showToast("Logged out successfully", "info");
    navigate("/admin/login");
  };

  const copyInviteCode = async (code) => {
    if (!code) {
      showToast("No invite code available", "info");
      return;
    }
    try {
      await navigator.clipboard.writeText(String(code));
      showToast("Invite code copied", "success");
    } catch (err) {
      showToast("Could not copy invite code", "error");
    }
  };

  const inviteGuest = async (guest) => {
    const origin = window.location?.origin || '';
    const link = `${origin}/rsvp?token=${guest.guestCode}`;
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
    const confirmed = window.confirm(`Are you sure you want to remove ${guest.firstName || ""} ${guest.lastName || ""} from the guest list?`);
    if (!confirmed) return;
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

  const deleteRsvp = async (rsvp) => {
    if (!rsvp?.id) return;
    const name = rsvp.name ? `${rsvp.name.firstName || ""} ${rsvp.name.lastName || ""}`.trim() : "this RSVP";
    const confirmed = window.confirm(`Delete ${name}? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await axios.delete(`${adminBase}/rsvps/${rsvp.id}`, {
        headers: { Authorization: getAuthHeader() },
      });
      showToast("RSVP deleted", "info");
      setRsvps((prev) => prev.filter((r) => r.id !== rsvp.id));
      if (selectedRsvp?.id === rsvp.id) {
        setSelectedRsvp(null);
        setActiveRsvpId(null);
        setIsEditingRsvp(false);
      }
    } catch (err) {
      showToast(`Delete failed: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  const viewRsvpDetail = (id) => {
    if (!id) return;
    setView("rsvps");
    setActiveRsvpId(id);
    setSelectedRsvp(null);
    setIsEditingRsvp(false);
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
      setSelectedRsvp(res.data ? { ...res.data, address: normalizeAddress(res.data.address) } : res.data);
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

  const handleApprovalChange = (approvalStatus) => {
    if (!approvalStatus) return;
    setSelectedRsvp((prev) => (prev ? { ...prev, approvalStatus } : prev));
  };

  const updateStatusAndSave = async (status) => {
    if (!status || !selectedRsvp?.id) return;
    handleStatusChange(status);
    await saveRsvpDetail({ status });
  };

  const updateApprovalAndSave = async (approvalStatus) => {
    if (!approvalStatus || !selectedRsvp?.id) return;
    handleApprovalChange(approvalStatus);
    await saveRsvpDetail({ approvalStatus });
  };

  const handleClearRsvpSelection = () => {
    setSelectedRsvp(null);
    setActiveRsvpId(null);
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
  const approvalState = (selectedRsvp?.approvalStatus || "PENDING_REVIEW").toUpperCase();

  const rsvpDetailContent =
    selectedRsvp || rsvpDetailLoading || activeRsvpId
      ? (
          <Box borderWidth="1px" borderRadius="lg" p={5} pr={{ base: 5, md: 12 }} bg="white" position="relative">
            {selectedRsvp && (
              <Box position="absolute" top={{ base: 1, md: 2 }} left={{ base: 3, md: 4 }} fontSize="xs" color="gray.500">
                {(selectedRsvp.approvalStatus || "PENDING_REVIEW").toUpperCase()}
              </Box>
            )}
            <Button
              size="xs"
              aria-label="Clear selection"
              variant="ghost"
              position="absolute"
              top={{ base: 2, md: 3 }}
              right={{ base: 2, md: 3 }}
              minW="28px"
              px={3}
              py={2}
              fontWeight="700"
              bg="white"
              boxShadow="sm"
              borderRadius="full"
              zIndex={2}
              _hover={{ bg: "gray.100" }}
              onClick={(e) => {
                e.stopPropagation();
                handleClearRsvpSelection();
              }}
              isDisabled={!selectedRsvp && !rsvpDetailLoading}
            >
              X
            </Button>
            <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="sm" color="gray.500">
                  RSVP Detail
                </Text>
                <HStack spacing={3} flexWrap="wrap">
                  <Heading size="md">{selectedRsvp ? formatName(selectedRsvp.name) : "Loading RSVP..."}</Heading>
                  {selectedRsvp && <StatusTag status={selectedRsvp.status} size="md" />}
                  {selectedRsvp?.approvalStatus && <StatusTag status={selectedRsvp.approvalStatus} size="md" />}
                </HStack>
                {selectedRsvp?.createdAt && (
                  <Text fontSize="xs" color="gray.500">
                    Submitted {fmt(selectedRsvp.createdAt)}
                  </Text>
                )}
              </VStack>
              <Stack direction={{ base: "column", md: "row" }} spacing={2} align="flex-start">
                {selectedRsvp && approvalState !== "APPROVED" && (
                  <Button
                    colorScheme="green"
                    variant="solid"
                    onClick={() => updateApprovalAndSave("APPROVED")}
                    isDisabled={!selectedRsvp || isEditingRsvp}
                    isLoading={rsvpSaving}
                  >
                    Mark Approved
                  </Button>
                )}
                {selectedRsvp && approvalState === "APPROVED" && (
                  <Button
                    colorScheme="yellow"
                    variant="outline"
                    onClick={() => updateApprovalAndSave("PENDING_REVIEW")}
                    isDisabled={!selectedRsvp || isEditingRsvp}
                    isLoading={rsvpSaving}
                  >
                    Mark Pending Review
                  </Button>
                )}
              </Stack>
            </HStack>
            <Separator mt={3} />
            {selectedRsvp && (selectedRsvp.approvalStatus || "PENDING_REVIEW").toUpperCase() === "PENDING_REVIEW" && (
              <Box mt={3} p={3} borderWidth="1px" borderRadius="md" bg="orange.50" borderColor="orange.200">
                <Text fontWeight="600" color="orange.800">
                  Pending Review
                </Text>
                <Text fontSize="sm" color="orange.700">
                  This RSVP is waiting for approval. Approve it to include in accepted counts.
                </Text>
              </Box>
            )}
            {rsvpDetailLoading ? (
              <Flex minH="200px" align="center" justify="center">
                <Text>Loading RSVP...</Text>
              </Flex>
            ) : selectedRsvp ? (
              <VStack align="stretch" spacing={6} mt={4}>
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
                    <InfoStat label="Approval" value={selectedRsvp.approvalStatus || "Pending Review"} />
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
                            <Input value={selectedRsvp.address?.streetLine1 || ""} onChange={(e) => updateAddressField("streetLine1", e.target.value)} placeholder="Street address" />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm">Address Line 2</FormLabel>
                            <Input value={selectedRsvp.address?.streetLine2 || ""} onChange={(e) => updateAddressField("streetLine2", e.target.value)} placeholder="Apartment, suite, etc." />
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
            ) : null}
            {selectedRsvp && !rsvpDetailLoading && (
              <Flex justify="flex-end" gap={3} flexWrap="wrap" mt={4}>
                {isEditingRsvp ? (
                  <>
                    <Button variant="ghost" onClick={handleCancelEdit} isDisabled={rsvpSaving}>
                      Cancel
                    </Button>
                    <Button colorScheme="yellow" onClick={() => saveRsvpDetail()} isLoading={rsvpSaving}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button colorScheme="yellow" onClick={() => setIsEditingRsvp(true)}>
                      Edit RSVP
                    </Button>
                    <Button
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => selectedRsvp && deleteRsvp(selectedRsvp)}
                      isDisabled={!selectedRsvp || rsvpDetailLoading}
                    >
                      Delete RSVP
                    </Button>
                  </>
                )}
              </Flex>
            )}
          </Box>
        )
      : null;

  useEffect(() => {
    if (view !== "rsvps") {
      setSelectedRsvp(null);
      setActiveRsvpId(null);
      setIsEditingRsvp(false);
    }
  }, [view]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("tab", view);
    if (view === "rsvps" && activeRsvpId) {
      params.set("rsvp", activeRsvpId);
    }
    setSearchParams(params);
  }, [view, activeRsvpId, setSearchParams]);

  useEffect(() => {
    if (view === "rsvps" && activeRsvpId) {
      if (!selectedRsvp || String(selectedRsvp.id) !== String(activeRsvpId)) {
        loadRsvpDetail(activeRsvpId);
      }
    }
  }, [view, activeRsvpId, selectedRsvp]);

  const saveRsvpDetail = async (overrides = {}) => {
    if (!selectedRsvp?.id) return;
    setRsvpSaving(true);
    try {
      const body = {
        status: overrides.status ?? selectedRsvp.status,
        approvalStatus: overrides.approvalStatus ?? selectedRsvp.approvalStatus ?? null,
        email: overrides.email ?? selectedRsvp.email ?? null,
        phone: overrides.phone ?? selectedRsvp.phone ?? null,
        address: cleanAddressForSave(overrides.address ?? selectedRsvp.address),
        additionalGuests: overrides.additionalGuests ?? selectedRsvp.additionalGuests ?? null,
        message: overrides.message ?? selectedRsvp.message ?? null,
      };
      const res = await axios.post(`${adminBase}/rsvps/${selectedRsvp.id}`, body, {
        headers: { Authorization: getAuthHeader(), "Content-Type": "application/json" },
      });
      setSelectedRsvp(res.data ? { ...res.data, address: normalizeAddress(res.data.address) } : res.data);
      setActiveRsvpId(res.data?.id ?? selectedRsvp.id);
      setIsEditingRsvp(false);
      // refresh list lightly
      setRsvps((list) =>
        list.map((r) =>
          r.id === res.data.id
            ? { ...r, status: res.data.status, message: res.data.message, name: res.data.name, createdAt: res.data.createdAt }
            : r
        )
      );
      showToast("RSVP updated", "success");
      if (typeof window !== "undefined") {
        window.location.reload();
      }
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
        <IconButton
          aria-label="Open settings"
          icon={<SettingsHamburgerIcon />}
          variant="outline"
          colorScheme="yellow"
          onClick={() => {
            const next = !showSettings;
            setShowSettings(next);
            if (next) loadSettings();
          }}
          isDisabled={settingsLoading}
        />
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
          <GuestPanel
            invitees={invitees}
            inviteFormOpen={inviteFormOpen}
            setInviteFormOpen={setInviteFormOpen}
            inviteFirst={inviteFirst}
            inviteLast={inviteLast}
            inviteSize={inviteSize}
            inviteForce={inviteForce}
            setInviteFirst={setInviteFirst}
            setInviteLast={setInviteLast}
            setInviteSize={setInviteSize}
            setInviteForce={setInviteForce}
            inviteSubmitting={inviteSubmitting}
            inviteNewGuest={inviteNewGuest}
            inviteGuest={inviteGuest}
            copyInviteCode={copyInviteCode}
            openRsvpFromGuest={openRsvpFromGuest}
            deleteInvitee={deleteInvitee}
          />
        )}

        {view === "rsvps" && (
          <Stack spacing={6}>
            <RsvpPanel
              rsvps={rsvps}
              rsvpsLoading={rsvpsLoading}
              viewRsvpDetail={viewRsvpDetail}
              fmt={fmt}
              deleteRsvp={deleteRsvp}
              selectedRsvpId={activeRsvpId}
              detailContent={rsvpDetailContent}
            />
          </Stack>
        )}

        {view === "expected" && (
          <ExpectedPanel expected={expected} expectedLoading={expectedLoading} totals={totals} />
        )}
      </Box>

      <Box
        position="fixed"
        top="0"
        right="0"
        h="100vh"
        maxW="380px"
        w={{ base: "90vw", sm: "360px" }}
        bg="white"
        borderLeftWidth="1px"
        boxShadow="xl"
        p={4}
        overflowY="auto"
        zIndex={20}
        transition="transform 0.2s ease, opacity 0.2s ease"
        transform={showSettings ? "translateX(0)" : "translateX(110%)"}
        opacity={showSettings ? 1 : 0}
        pointerEvents={showSettings ? "auto" : "none"}
      >
        <HStack justify="space-between" align="center" mb={4}>
          <Heading size="sm">Settings</Heading>
          <HStack spacing={2}>
            {!settingsLoading && (
              <Button
                size="sm"
                variant={isEditingSettings ? "solid" : "ghost"}
                colorScheme="yellow"
                onClick={() => setIsEditingSettings((v) => !v)}
              >
                {isEditingSettings ? "Done" : "Edit"}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setShowSettings(false)}>
              Close
            </Button>
          </HStack>
        </HStack>
        {settingsLoading ? (
          <Text color="gray.600">Loading settings...</Text>
        ) : (
          <VStack align="stretch" spacing={4}>
            <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
              <VStack align="stretch" spacing={3}>
                <Heading size="sm" color="teal.700">
                  Close RSVPs
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Prevent all new submissions.
                </Text>
                {isEditingSettings ? (
                  <SwitchRoot
                    size="lg"
                    checked={settings.rsvpClosed}
                    onCheckedChange={(details) => toggleSetting("rsvpClosed", details)}
                    disabled={settingsSaving}
                    colorPalette="yellow"
                  >
                    <SwitchControl>
                      <SwitchThumb />
                    </SwitchControl>
                  </SwitchRoot>
                ) : (
                  <StatusTag status={settings.rsvpClosed ? "CLOSED" : "OPEN"} />
                )}
                <Text mt={1} fontSize="sm" color="gray.600">
                  Currently: <b>{settings.rsvpClosed ? "Closed" : "Open"}</b>
                </Text>
              </VStack>
            </Box>

            <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
              <VStack align="stretch" spacing={3}>
                <Heading size="sm" color="teal.700">
                  Allow Strangers
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  Let anyone RSVP without an invite token.
                </Text>
                {isEditingSettings ? (
                  <SwitchRoot
                    size="lg"
                    checked={settings.rsvpOpenToStrangers}
                    onCheckedChange={(details) => toggleSetting("rsvpOpenToStrangers", details)}
                    disabled={settingsSaving}
                    colorPalette="yellow"
                  >
                    <SwitchControl>
                      <SwitchThumb />
                    </SwitchControl>
                  </SwitchRoot>
                ) : (
                  <StatusTag status={settings.rsvpOpenToStrangers ? "ANYONE" : "INVITE"} />
                )}
                <Text mt={1} fontSize="sm" color="gray.600">
                  Currently: <b>{settings.rsvpOpenToStrangers ? "Anyone can RSVP" : "Invite required"}</b>
                </Text>
              </VStack>
            </Box>
          </VStack>
        )}
      </Box>

    </VStack>
  );
}
