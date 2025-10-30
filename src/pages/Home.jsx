import { Box, Flex, Heading, Text, Stack, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSlider from "../componets/LanguageSlider";

export default function Home() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  const navItems = [
    { label: t("home.nav.home"), to: "/" },
    { label: t("home.nav.registry"), to: "/registry" },
    { label: t("home.nav.schedule"), to: "/schedule" },
    { label: t("home.nav.rsvp"), to: "/rsvp" },
    { label: t("home.nav.gallery"), to: "/gallery" },
  ];

  return (
    <Box minH="100vh" bg="white">
      {/* Hero Section */}
      <Box
        position="relative"
        bgGradient="linear(to-b, white, #fff9f0)"
        overflow="hidden"
      >
        {/* Decorative flowers */}
        <Box
          position="absolute"
          top={-10}
          left={-10}
          w={40}
          h={40}
          bg="url('https://em-content.zobj.net/thumbs/120/apple/354/rose_1f339.png')"
          bgSize="cover"
          opacity={0.15}
          transform="rotate(-20deg)"
        />
        <Box
          position="absolute"
          top={10}
          right={-10}
          w={60}
          h={60}
          bg="url('https://em-content.zobj.net/thumbs/120/apple/354/bouquet_1f490.png')"
          bgSize="cover"
          opacity={0.12}
          transform="rotate(10deg)"
        />

        {/* Header Content */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          pt={28}
          pb={20}
          px={4}
        >
          <Heading
            fontSize={["3xl", "5xl", "6xl"]}
            fontWeight="extrabold"
            color="#b08649"
            textShadow="1px 1px 2px #fff"
          >
            So & So
          </Heading>
          <Heading
            fontSize={["xl", "2xl"]}
            fontWeight="medium"
            mt={4}
            color="#6b4c32"
          >
            {t("home.subtitle")}
          </Heading>

          <LanguageSlider/>
        </Flex>
      </Box>

      {/* Navigation Bar */}
      <Flex
        as="nav"
        bg="white"
        shadow="md"
        justify="center"
        wrap="wrap"
        py={4}
        px={8}
      >
        {navItems.map((item) => (
          <Button
            key={item.to}
            as={Link}
            to={item.to}
            variant="outline"
            colorScheme="yellow"
            mx={2}
            my={1}
            size="lg"
          >
            {item.label}
          </Button>
        ))}
      </Flex>

      {/* Welcome Content */}
      <Box p={8} textAlign="center">
        <Heading fontSize="2xl" mb={4}>
          {t("home.welcome")}
        </Heading>
        <Text maxW="3xl" mx="auto" fontSize="lg" color="gray.700">
          {t("home.description")}
        </Text>
      </Box>
    </Box>
  );
}
