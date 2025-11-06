import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import NavBar from "../componets/NavBar";
import LanguageSlider from "../componets/LanguageSlider";
import TitleWithBrackets from "../componets/TitleWithBrackets";

export default function Gallery() {
  const { t } = useTranslation();
  return (
    <Box minH="100vh" bg="transparent">
      <NavBar />
      <Flex direction="column" align="center" pt={24} px={4}>
        <TitleWithBrackets fontSize={["3xl", "4xl", "5xl"]}>
          {t("home.nav.gallery")}
        </TitleWithBrackets>
        <LanguageSlider />
        <Text mt={6} maxW="3xl" textAlign="center" color="black">
          {t("gallery.uploadInfo")}
        </Text>
      </Flex>
    </Box>
  );
}
