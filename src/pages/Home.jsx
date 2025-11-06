import { Box, Flex, Heading, Text, Stack, SimpleGrid, Image } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import LanguageSlider from "../componets/LanguageSlider";
import NavBar from "../componets/NavBar";
import TitleWithBrackets from "../componets/TitleWithBrackets";
import ringImg from "../img/home/d&r-ring.png";
import wizardsImg from "../img/home/d&r-wizards.png";
import atotImg from "../img/home/d&r-atot.png";
import banffImg from "../img/home/d&r-banff.png";

export default function Home() {
  const { t, i18n } = useTranslation();

  const partnerOne = process.env.REACT_APP_PARTNER_ONE || "So";
  const partnerTwo = process.env.REACT_APP_PARTNER_TWO || "So";

  const weddingDateStr = process.env.REACT_APP_WEDDING_DATE || "";
  const weddingCity = process.env.REACT_APP_WEDDING_CITY || "";
  const weddingState = process.env.REACT_APP_WEDDING_STATE || "";

  let daysToGo = null;
  let formattedWeddingDate = "";
  if (weddingDateStr) {
    const weddingDate = new Date(`${weddingDateStr}T00:00:00`);
    if (!isNaN(weddingDate.getTime())) {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfWedding = new Date(weddingDate.getFullYear(), weddingDate.getMonth(), weddingDate.getDate());
      const oneDay = 24 * 60 * 60 * 1000;
      const diff = Math.floor((startOfWedding - startOfToday) / oneDay);
      daysToGo = Math.max(0, diff);
      const locale = (typeof i18n?.language === 'string' && i18n.language) || undefined;
      formattedWeddingDate = weddingDate.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  return (
    <Box minH="100vh" bg="transparent">
      {/* Hero Section */}
      <Box
        position="relative"
        bgGradient="linear(to-b, white, #fff9f0)"
        overflow="hidden"
      >

        {/* Header Content */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          position="relative"
          pt={28}
          pb={20}
          px={4}
        >
          <TitleWithBrackets fontSize={["3xl", "5xl", "6xl"]}>
            {partnerTwo} & {partnerOne}
          </TitleWithBrackets>

          <LanguageSlider/>

          {/* Wedding info and countdown */}
          {(formattedWeddingDate || weddingCity || weddingState || daysToGo !== null) && (
            <Stack spacing={1} mt={4} align="center">
              {(formattedWeddingDate || weddingCity || weddingState) && (
                <Text fontSize="lg" color="#6b4c32">
                  {formattedWeddingDate}
                  {(weddingCity || weddingState) && (
                    <> {" • "}{[weddingCity, weddingState].filter(Boolean).join(", ")} </>
                  )}
                </Text>
              )}
              {daysToGo !== null && (
                <Heading fontSize={["lg", "xl"]} color="#b08649">
                  {t("home.daysToGo", { count: daysToGo })}
                </Heading>
              )}
            </Stack>
          )}
        </Flex>
      </Box>

      <NavBar />

      {/* Home Gallery */}
      <Box p={8}>
        {/* Placeholders row: Venue | Date, Time */}
        <Flex maxW="800px" mx="auto" justify="space-between" align="center" mb={6} px={1}>
          <Text fontSize={["md","lg"]} color="black" fontWeight="semibold">
            Venue Information
          </Text>
          <Text fontSize={["md","lg"]} color="black" fontWeight="semibold" textAlign="right">
            Date, Time
          </Text>
        </Flex>
        <SimpleGrid columns={{ base: 1, sm: 1, lg: 1 }} spacing={8} maxW="800px" mx="auto">
          {[ringImg, wizardsImg, atotImg, banffImg].map((src, idx) => (
            <Box key={idx} overflow="hidden" borderRadius="lg" boxShadow="md" bg="white" p={4}>
              <Image src={src} alt={`Gallery ${idx + 1}`} w="100%" objectFit="cover" />
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
}
