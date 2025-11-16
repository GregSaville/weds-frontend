import { Box, Flex, Heading, Text, Stack, Button, Image } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import LanguageSlider from "../componets/LanguageSlider";
import NavBar from "../componets/NavBar";
import TitleWithBrackets from "../componets/TitleWithBrackets";
import amazonLogo from "../img/registry/amazon-logo.png";
import targetLogo from "../img/registry/target-logo.png";

export default function Registry() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  let registries = [];
  try {
    const raw = process.env.REACT_APP_REGISTRIES;
    registries = raw ? JSON.parse(raw) : [];
  } catch (e) {
    registries = [];
  }

  const items = Array.isArray(registries)
    ? registries.filter((r) => r && r.title && r.link)
    : [];

  const brandStyle = (url) => {
    try {
      const host = new URL(url).hostname.toLowerCase();
      if (host.includes("amazon")) return { bg: "#FFF0D6", border: "#ff9900", logo: amazonLogo };
      if (host.includes("target")) return { bg: "#FDE8E8", border: "#cc0000", logo: targetLogo };
      if (host.includes("walmart")) return { bg: "#F1F7FF", border: "#0071ce" };
      if (host.includes("etsy")) return { bg: "#FFF1E6", border: "#f1641e" };
      if (host.includes("zola")) return { bg: "#E6F3F1", border: "#0c6" };
      if (host.includes("crateandbarrel") || host.includes("crateandbarrel")) return { bg: "#F5F5F5", border: "#000" };
    } catch (e) {}
    return { bg: "#FFFFFF", border: "#e2e8f0" };
  };

  return (
    <Box minH="100vh" bg="transparent">
      <NavBar />
      <Flex direction="column" align="center" textAlign="center" pt={20} px={4}>
        <TitleWithBrackets fontSize={["3xl", "4xl", "5xl"]}>
          {t("registry.title")}
        </TitleWithBrackets>
        <Text mt={3} color="black">
          {t("registry.intro")}
        </Text>

        <LanguageSlider />
        <Box minH={"1vh"}/>
   
        <Stack spacing={6} mt={10} width="full" maxW="lg">
          {items.length === 0 ? (
            <Text color="gray.700">{t("registry.empty")}</Text>
          ) : (
            items.map((r) => (
              (() => {
                const s = brandStyle(r.link);
                return (
                  <Button
                    key={r.title + r.link}
                    as="a"
                    href={r.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="solid"
                    bg={s.bg}
                    color="black"
                    height="150px"
                    width="100%"
                    borderRadius="2xl"
                    borderWidth="1px"
                    borderColor={s.border}
                    _hover={{ filter: "brightness(0.97)" }}
                    boxShadow="0 10px 24px rgba(0,0,0,0.08)"
                    fontSize="xl"
                    fontWeight="extrabold"
                    whiteSpace="normal"
                    textAlign="center"
                    px={6}
                    lineHeight="1.4"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Image
                      src={s.logo}
                      alt={r.title}
                      maxH="80%"
                      maxW="80%"
                      objectFit="contain"
                      fallback={
                        <Text fontSize="xl" fontWeight="extrabold" color="black">
                          {r.title}
                        </Text>
                      }
                    />
                  </Button>
                );
              })()
            ))
          )}
        </Stack>
      </Flex>
    </Box>
  );
}
