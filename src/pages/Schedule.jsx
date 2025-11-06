import { Box, Flex, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import NavBar from "../componets/NavBar";
import LanguageSlider from "../componets/LanguageSlider";
import TitleWithBrackets from "../componets/TitleWithBrackets";

export default function Schedule() {
  const { t } = useTranslation();
  return (
    <Box minH="100vh" bg="transparent">
      <NavBar />
      <Flex direction="column" align="center" pt={24} px={4}>
        <TitleWithBrackets fontSize={["3xl", "4xl", "5xl"]}>{t("home.nav.schedule")}</TitleWithBrackets>
         <LanguageSlider />
        <Text fontSize={["xl", "2xl"]} textAlign="center" color="black">
          {t("schedule.message")}
        </Text>
      </Flex>
    </Box>
  );
}
