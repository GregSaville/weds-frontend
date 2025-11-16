import { Box, Flex, Heading, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import NavBar from "../componets/NavBar";
import LanguageSlider from "../componets/LanguageSlider";
import TitleWithBrackets from "../componets/TitleWithBrackets";

export default function Qa() {
  const { t } = useTranslation();
  const faqs = t("qa.faqs", { returnObjects: true });
  const faqList = Array.isArray(faqs) ? faqs : [];
  return (
    <Box minH="100vh" bg="transparent">
      <NavBar />
      <Flex direction="column" align="center" pt={24} px={4} textAlign="center">
        <TitleWithBrackets fontSize={["3xl", "4xl", "5xl"]}>{t("qa.title")}</TitleWithBrackets>
        <LanguageSlider />
        <Text mt={4} color="gray.700">{t("qa.intro")}</Text>
      </Flex>
      <Box maxW="6xl" mx="auto" mt={10} px={[4, 6]} pb={16}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {faqList.map((item, idx) => (
            <Box
              key={idx}
              bg="whiteAlpha.800"
              borderRadius="lg"
              boxShadow="md"
              p={[4, 5]}
              borderWidth="1px"
              borderColor="gray.200"
            >
              <VStack align="start" spacing={3}>
                <Heading as="h3" size="md" color="gray.800">
                  {item.question}
                </Heading>
                <Text color="gray.700" lineHeight="1.6">
                  {item.answer}
                </Text>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
}
