import { Box, Flex, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import NavBar from "../componets/NavBar";
import LanguageSlider from "../componets/LanguageSlider";
import TitleWithBrackets from "../componets/TitleWithBrackets";

export default function WeddingParty() {
  const { t } = useTranslation();
  const weddingFont = '"adobe-jenson-pro", "Adobe Jenson Pro", serif';
  const members = t("weddingParty.members", { returnObjects: true });
  const membersList = Array.isArray(members) ? members : [];

  return (
    <Box minH="100vh" bg="transparent">
      <NavBar />
      <Flex direction="column" align="center" pt={24} px={4} textAlign="center">
        <TitleWithBrackets fontSize={["3xl", "4xl", "5xl"]}>
          {t("weddingParty.title")}
        </TitleWithBrackets>
        <LanguageSlider />
        <Text mt={4} color="gray.700" fontFamily={weddingFont}>
          {t("weddingParty.intro")}
        </Text>
      </Flex>
      <Box maxW="6xl" mx="auto" mt={10} px={6} pb={16}>
        <SimpleGrid columns={{ base: 2, md: 2 }} spacing={4}>
          {membersList.map((person, index) => (
            <VStack
              key={person.name || index}
              align="center"
              spacing={1}
              px={[3, 4]}
              py={[3, 4]}
              borderBottom="1px dashed"
              borderColor="gray.300"
              textAlign="center"
              fontFamily={weddingFont}
            >
              <Text fontSize="xl" fontWeight="bold">
                {person.name}
              </Text>
              <Text fontWeight="medium" color="gray.700">
                {person.role}
              </Text>
              <Text color="gray.600">{person.relation}</Text>
            </VStack>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
}
