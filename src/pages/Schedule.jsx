import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import NavBar from "../componets/NavBar";
import LanguageSlider from "../componets/LanguageSlider";
import TitleWithBrackets from "../componets/TitleWithBrackets";

const weddingFont = '"adobe-jenson-pro", "Adobe Jenson Pro", serif';

// Using the same Box as="svg" pattern as TitleWithBrackets for Chakra v3 compatibility
function CeremonyIcon() {
  return (
    <Box as="svg" viewBox="0 0 24 24" w="22px" h="22px" fill="#b08649">
      {/* Two people side by side */}
      <circle cx="8" cy="5" r="2.5" />
      <circle cx="16" cy="5" r="2.5" />
      <path d="M3 20v-2c0-2.2 2.2-4 5-4h2c2.8 0 5 1.8 5 4v2H3z" />
      <path d="M14 20v-2c0-1.1.5-2.1 1.3-2.8C16 14.4 17 14 18 14c2.8 0 5 1.8 5 4v2h-9z" />
    </Box>
  );
}

function SocialIcon() {
  return (
    <Box as="svg" viewBox="0 0 24 24" w="22px" h="22px" fill="#b08649">
      {/* Wine glass — Material Icons "wine_bar" path, fills the full viewBox cleanly */}
      <path d="M20 3H4v2l8 9v5H8v2h8v-2h-4v-5l8-9V3z" />
      {/* Bubbles inside the bowl */}
      <circle cx="10" cy="6" r="0.8" fill="white" opacity="0.7" />
      <circle cx="13" cy="7.5" r="0.6" fill="white" opacity="0.7" />
    </Box>
  );
}

function DinnerIcon() {
  return (
    <Box as="svg" viewBox="0 0 24 24" w="22px" h="22px" fill="#b08649">
      {/* Fork and knife */}
      <path d="M7 2v5c0 1.1.9 2 2 2v13h-2v-8H5V2H7z" />
      <path d="M5 2v5h2V2H5z" />
      <path d="M9 2v5h-2V2h2z" />
      <path d="M15 2c0 0 3 2.5 3 6s-3 6-3 6v8h-2V2h2z" />
    </Box>
  );
}

function DanceIcon() {
  return (
    <Box as="svg" viewBox="0 0 24 24" w="22px" h="22px" fill="#b08649">
      {/* Musical note */}
      <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
    </Box>
  );
}

const eventIcons = [CeremonyIcon, SocialIcon, DinnerIcon, DanceIcon];

export default function Schedule() {
  const { t } = useTranslation();

  const events = t("schedule.events", { returnObjects: true });
  const eventsList = Array.isArray(events) ? events : [];

  return (
    <Box minH="100vh" bg="transparent">
      <NavBar />
      <Flex direction="column" align="center" pt={24} pb={16} px={4} textAlign="center">
        <TitleWithBrackets fontSize={["3xl", "4xl", "5xl"]}>
          {t("home.nav.schedule")}
        </TitleWithBrackets>

        <LanguageSlider />

        {/* Timeline card */}
        <Box
          mt={10}
          w="100%"
          maxW="460px"
          bg="white"
          border="1px solid"
          borderColor="#e0c89a"
          borderRadius="2xl"
          boxShadow="0 4px 20px rgba(176, 134, 73, 0.10)"
          px={[6, 10]}
          py={8}
        >
          <VStack spacing={0} align="stretch">
            {eventsList.map((event, idx) => {
              const EventIcon = eventIcons[idx] || CeremonyIcon;
              const isLast = idx === eventsList.length - 1;
              return (
                <Flex key={idx} align="flex-start">
                  {/* Left: time label */}
                  <Box
                    w="80px"
                    flexShrink={0}
                    textAlign="right"
                    pr={5}
                    pt="6px"
                  >
                    <Text
                      fontFamily={weddingFont}
                      fontSize={["sm", "md"]}
                      color="#6b4c32"
                      fontWeight="600"
                      whiteSpace="nowrap"
                    >
                      {event.time}
                    </Text>
                  </Box>

                  {/* Center: line + icon circle */}
                  <Flex direction="column" align="center" flexShrink={0} w="40px">
                    <Box w="2px" h="10px" bg={idx === 0 ? "transparent" : "#d4b483"} />
                    <Flex
                      w="40px"
                      h="40px"
                      borderRadius="full"
                      bg="#fdf3e3"
                      border="1.5px solid #c9a96e"
                      align="center"
                      justify="center"
                      flexShrink={0}
                    >
                      <EventIcon />
                    </Flex>
                    <Box flex={1} w="2px" minH="32px" bg={isLast ? "transparent" : "#d4b483"} />
                  </Flex>

                  {/* Right: event label */}
                  <Box pl={5} pb={isLast ? 0 : 4} pt="10px">
                    <Text
                      fontFamily={weddingFont}
                      fontSize={["xl", "2xl"]}
                      fontWeight="bold"
                      color="#1a1a1a"
                      lineHeight="1.2"
                    >
                      {event.label}
                    </Text>
                  </Box>
                </Flex>
              );
            })}
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
