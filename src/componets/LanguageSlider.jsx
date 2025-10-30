import { Box, Flex } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

function LanguageSlider() {
    const { t, i18n } = useTranslation();
    
    const changeLanguage = (lng) => i18n.changeLanguage(lng);

   return (
        <>
        {/* Language Slider */}
          <Flex
            mt={6}
            bg="gray.200"
            borderRadius="full"
            p="2px"
            width="200px"
            justify="space-between"
          >
            <Box
              flex={1}
              textAlign="center"
              py={2}
              borderRadius="full"
              bg={i18n.language === "en" ? "yellow.400" : "transparent"}
              cursor="pointer"
              onClick={() => changeLanguage("en")}
            >
              English
            </Box>
            <Box
              flex={1}
              textAlign="center"
              py={2}
              borderRadius="full"
              bg={i18n.language === "es" ? "yellow.400" : "transparent"}
              cursor="pointer"
              onClick={() => changeLanguage("es")}
            >
              Español
            </Box>
          </Flex>
        </>
   ); 
}

export default LanguageSlider;