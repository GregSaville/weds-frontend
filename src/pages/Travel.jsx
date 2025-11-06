import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import NavBar from "../componets/NavBar";
import LanguageSlider from "../componets/LanguageSlider";
import TitleWithBrackets from "../componets/TitleWithBrackets";

export default function Travel() {
  const { t } = useTranslation();
  return (
    <Box minH="100vh" bg="transparent">
      <NavBar />
      <Flex direction="column" align="center" pt={24} px={4} textAlign="center">
        <TitleWithBrackets fontSize={["3xl", "4xl", "5xl"]}>{t("travel.title")}</TitleWithBrackets>
        <LanguageSlider />
        <Text mt={4} color="gray.700">{t("travel.intro")}</Text>
      </Flex>
    </Box>
  );
}
