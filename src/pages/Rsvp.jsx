import { Box, Flex, Heading, VStack, HStack, Input, Textarea, Button, ButtonGroup, Text, Spinner } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import NavBar from "../componets/NavBar";
import LanguageSlider from "../componets/LanguageSlider";
import { useToast } from "../componets/ToastProvider";
import { useSearchParams } from "react-router-dom";
import TitleWithBrackets from "../componets/TitleWithBrackets";

export default function Rsvp() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [guestId, setGuestId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [attendance, setAttendance] = useState("Accepted"); // "Accepted" | "Declined"

  // Shared contact/address
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Accepted-only
  const [specialAccommodations, setSpecialAccommodations] = useState("");
  const [guests, setGuests] = useState([]); // [{firstName,lastName,specialAccommodations}]

  // Declined-only (no separate message box anymore)

  // Extra note for the couple (optional)
  const [notes, setNotes] = useState("");
  const [allowedPartySize, setAllowedPartySize] = useState(null);
  const [metaLoading, setMetaLoading] = useState(false);

  const endpoint = process.env.REACT_APP_RSVP_ENDPOINT || "/api/public/rsvp";
  const metaBase = process.env.REACT_APP_RSVP_META_ENDPOINT || "/api/public/rsvp-meta";

  const addGuest = () => {
    const maxAdditional = allowedPartySize != null ? Math.max(allowedPartySize - 1, 0) : Infinity;
    if (guests.length >= maxAdditional) {
      if (maxAdditional !== Infinity) {
        showToast(t("rsvp.maxGuestsReached", { max: maxAdditional }), "error");
      }
      return;
    }
    setGuests((g) => [...g, { firstName: "", lastName: "", specialAccommodations: "" }]);
  };
  const removeGuest = (idx) => setGuests((g) => g.filter((_, i) => i !== idx));
  const updateGuest = (idx, key, value) =>
    setGuests((g) => g.map((item, i) => (i === idx ? { ...item, [key]: value } : item)));

  const buildAddress = () => {
    const any = address1 || address2 || city || state || postalCode;
    if (!any) return null;
    return {
      line1: address1 || undefined,
      line2: address2 || undefined,
      city: city || undefined,
      state: state || undefined,
      postalCode: postalCode || undefined,
    };
  };

  // Prepopulate from token meta
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setMetaLoading(false);
      return;
    }

    setMetaLoading(true);
    setGuestId(token);
    const url = `${metaBase}/${encodeURIComponent(token)}`;
    axios
      .get(url)
      .then((res) => {
        const data = res.data || {};
        const name = data.name || {};
        if (name.firstName) setFirstName(name.firstName);
        if (name.lastName) setLastName(name.lastName);
        const allowed = Number(data.allowedPartySize);
        if (!Number.isNaN(allowed)) setAllowedPartySize(Math.max(allowed, 1));
        // Do not prepopulate empty guest boxes; user can add up to the allowed amount
      })
      .catch((err) => {
        console.error("Failed to load RSVP meta", err);
        showToast(t("rsvp.toastMetaFail"), "error");
      })
      .finally(() => setMetaLoading(false));
  }, [searchParams, metaBase, showToast, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      showToast(t("rsvp.toastNameRequired"), "error");
      return;
    }

    const base = {
      guestId: guestId || null,
      fullName: { firstName, lastName },
    };

    const contact = {
      phone: phone || null,
      email: email || null,
      address: buildAddress(),
    };

    let payload;
    if (attendance === "Accepted") {
      const combinedSpecial = (specialAccommodations || notes)
        ? [specialAccommodations, notes].filter(Boolean).join("\n\n")
        : null;
      let additionalList = guests;
      if (allowedPartySize != null) {
        const maxAdditional = Math.max(allowedPartySize - 1, 0);
        additionalList = guests.slice(0, maxAdditional);
      }
      payload = {
        ...base,
        attendance: {
          type: "Accepted",
          specialAccommodations: combinedSpecial,
          ...contact,
          additionalGuests: additionalList.length ? additionalList : null,
        },
      };
    } else {
      const combinedMessage = notes ? notes : null;
      payload = {
        ...base,
        attendance: {
          type: "Declined",
          message: combinedMessage,
          ...contact,
        },
      };
    }

    try {
      const body = { rsvpRequestSubmission: payload };
      const res = await axios.post(endpoint, body, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status >= 200 && res.status < 300) {
        showToast(t("rsvp.toastSubmitted"), "success");
        // Optionally clear
        // window.location.reload();
      } else {
        showToast(t("rsvp.toastUnexpected", { status: res.status }), "error");
      }
    } catch (err) {
      showToast(t("rsvp.toastFailed", { message: err.response?.data?.message || err.message }), "error");
    }
  };

  return (
    <Box minH="100vh" bg="transparent">
      <NavBar />
      <Flex direction="column" align="center" pt={24} px={4}>
        <TitleWithBrackets fontSize={["3xl", "4xl", "5xl"]}>{t("home.nav.rsvp")}</TitleWithBrackets>
        <LanguageSlider />

        {metaLoading ? (
          <Flex direction="column" align="center" justify="center" mt={12} mb={16} gap={3}>
            <Spinner thickness="4px" speed="0.7s" color="yellow.400" size="lg" />
            <Text color="gray.700">{t("rsvp.loadingMeta")}</Text>
          </Flex>
        ) : (
        <Box as="form" onSubmit={handleSubmit} mt={8} w="100%" maxW="2xl" bg="rgba(255,255,255,0.7)" p={6} borderRadius="xl" boxShadow="0 4px 10px rgba(0,0,0,0.08)">
          <VStack spacing={4} align="stretch" color="black">
            <HStack>
              <Input placeholder={t("rsvp.firstName")} value={firstName} onChange={(e) => setFirstName(e.target.value)} isRequired />
              <Input placeholder={t("rsvp.lastName")} value={lastName} onChange={(e) => setLastName(e.target.value)} isRequired />
            </HStack>

            {/* Additional Guests just below names (only when accepting) */}
            {attendance === "Accepted" && (
              <>
                <Box my={2} h="1px" bg="blackAlpha.300" />
                <HStack justify="space-between">
                  <Heading size="sm">{t("rsvp.additionalGuests")}</Heading>
                  {((allowedPartySize == null) || (Math.max(allowedPartySize - 1, 0) > 0)) && (
                    <Button onClick={addGuest} type="button" colorScheme="yellow" variant="solid" disabled={allowedPartySize != null && guests.length >= Math.max(allowedPartySize - 1, 0)}>{t("rsvp.addGuest")}</Button>
                  )}
                </HStack>
                {allowedPartySize != null && (
                  <Text fontSize="sm" color="gray.600">
                    {t("rsvp.additionalGuestsLimit", { used: guests.length, max: Math.max(allowedPartySize - 1, 0), remaining: Math.max(Math.max(allowedPartySize - 1, 0) - guests.length, 0) })}
                  </Text>
                )}
                {guests.map((g, idx) => (
                  <VStack key={idx} align="stretch" spacing={2} p={3} borderWidth="1px" borderRadius="md" bg="white">
                    <HStack>
                      <Input placeholder={t("rsvp.firstName")} value={g.firstName} onChange={(e) => updateGuest(idx, "firstName", e.target.value)} />
                      <Input placeholder={t("rsvp.lastName")} value={g.lastName} onChange={(e) => updateGuest(idx, "lastName", e.target.value)} />
                    </HStack>
                    <Textarea placeholder={t("rsvp.specialAccommodationsPlaceholder")} value={g.specialAccommodations} onChange={(e) => updateGuest(idx, "specialAccommodations", e.target.value)} />
                    <HStack justify="flex-end">
                      <Button type="button" size="sm" variant="outline" onClick={() => removeGuest(idx)}>{t("rsvp.remove")}</Button>
                    </HStack>
                  </VStack>
                ))}
              </>
            )}

            <HStack justify="center" w="full" my={2}>
              <ButtonGroup isAttached size="lg">
                <Button
                  onClick={() => setAttendance("Accepted")}
                  variant={attendance === "Accepted" ? "solid" : "outline"}
                  colorScheme="yellow"
                  size="lg"
                >
                  {t("rsvp.accept")}
                </Button>
                <Button
                  onClick={() => setAttendance("Declined")}
                  variant={attendance === "Declined" ? "solid" : "outline"}
                  colorScheme="yellow"
                  size="lg"
                >
                  {t("rsvp.decline")}
                </Button>
              </ButtonGroup>
            </HStack>

            {attendance === "Accepted" ? (
              <VStack align="stretch" spacing={3}>
                <Textarea placeholder={t("rsvp.specialAccommodationsPlaceholder")} value={specialAccommodations} onChange={(e) => setSpecialAccommodations(e.target.value)} />

                {/* Notes for the couple above contact section */}
                <Text fontWeight="semibold">{t("rsvp.notesPrompt")}</Text>
                <Textarea
                  placeholder={t("rsvp.notesPlaceholder")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <HStack>
                  <Input placeholder={t("rsvp.phonePlaceholder")} value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <Input placeholder={t("rsvp.emailPlaceholder")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </HStack>
                <Text fontWeight="semibold">{t("rsvp.addressLabel")}</Text>
                <Input placeholder={t("rsvp.address1")} value={address1} onChange={(e) => setAddress1(e.target.value)} />
                <Input placeholder={t("rsvp.address2")} value={address2} onChange={(e) => setAddress2(e.target.value)} />
                <HStack>
                  <Input placeholder={t("rsvp.city")} value={city} onChange={(e) => setCity(e.target.value)} />
                  <Input placeholder={t("rsvp.state")} value={state} onChange={(e) => setState(e.target.value)} />
                  <Input placeholder={t("rsvp.postalCode")} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                </HStack>
              </VStack>
            ) : (
              <VStack align="stretch" spacing={3}>
                {/* Notes for the couple above contact section */}
                <Text fontWeight="semibold">{t("rsvp.notesPrompt")}</Text>
                <Textarea
                  placeholder={t("rsvp.notesPlaceholder")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <HStack>
                  <Input placeholder={t("rsvp.phonePlaceholder")} value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <Input placeholder={t("rsvp.emailPlaceholder")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </HStack>
                <Text fontWeight="semibold">{t("rsvp.addressLabel")}</Text>
                <Input placeholder={t("rsvp.address1")} value={address1} onChange={(e) => setAddress1(e.target.value)} />
                <Input placeholder={t("rsvp.address2")} value={address2} onChange={(e) => setAddress2(e.target.value)} />
                <HStack>
                  <Input placeholder={t("rsvp.city")} value={city} onChange={(e) => setCity(e.target.value)} />
                  <Input placeholder={t("rsvp.state")} value={state} onChange={(e) => setState(e.target.value)} />
                  <Input placeholder={t("rsvp.postalCode")} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                </HStack>
              </VStack>
            )}

            <Box my={2} h="1px" bg="blackAlpha.300" />
            <Box w={["100%","70%","60%"]} mx="auto">
              <Button w="100%" colorScheme="yellow" type="submit">{t("rsvp.submit")}</Button>
            </Box>
          </VStack>
        </Box>
        )}
      </Flex>
    </Box>
  );
}
