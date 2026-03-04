import { Box, Flex, Heading, Text, VStack, Button } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import NavBar from "../componets/NavBar";
import LanguageSlider from "../componets/LanguageSlider";
import TitleWithBrackets from "../componets/TitleWithBrackets";

export default function Travel() {
  const { t } = useTranslation();

  const hotelBlocks = [
    {
      title: "Fairfield By Marriott Inn & Suites Fargo",
      addressLine1: "3902 9th Ave S, Fargo, ND 58103, USA",
      addressLine2: "(701) 281-0494",
      websiteUrl: "https://www.marriott.com/event-reservations/reservation-link.mi?id=1769028295009&key=GRP&app=resvlink&_branch_match_id=1456415138653324822&_branch_referrer=H4sIAAAAAAAAA8soKSkottLXTywo0MtNLCrKzC8p0UvOz9UvSi3OyczLtgdK2ALZZSCOWmaKraG5maWBkYWRpamBgaVadmqlrXtQgFpdUWpaKlB3Xnp8UlF%2BeXFqka1zRlF%2BbioAHWsfN2AAAAA%3D",
    },
    {
      title: "Best Western Plus Kelly Inn & Suites",
      addressLine1: "1767 44th St S, Fargo, ND 58103, USA",
      addressLine2: "(701) 282-2143",
      websiteUrl: "",
    },
    {
      title: "Four Points By Sheraton Fargo Medical Center",
      addressLine1: "5064 23rd Ave S Fargo, ND 58104, USA",
      addressLine2: "(701) 364-0000",
      websiteUrl: "https://www.marriott.com/event-reservations/reservation-link.mi?id=1771362680855&key=GRP&app=resvlink&_branch_match_id=1456415138653324822&_branch_referrer=H4sIAAAAAAAAA8soKSkottLXTywo0MtNLCrKzC8p0UvOz9UvSi3OyczLtgdK2ALZZSCOWmaKraG5uaGxmZGZhYGFqaladmqlrXtQgFpdUWpaKlB3Xnp8UlF%2BeXFqka1zRlF%2BbioAfaS3Y2AAAAA%3D&inventoryMissing=true",
    },
    {
      title: "Delta Hotels Fargo",
      addressLine1: "1635 42nd St Sw, Fargo, ND 58103, USA",
      addressLine2: "(701) 277-9000",
      websiteUrl: "https://www.marriott.com/event-reservations/reservation-link.mi?id=1771445986200&key=GRP&app=resvlink&_branch_match_id=1456415138653324822&_branch_referrer=H4sIAAAAAAAAA8soKSkottLXTywo0MtNLCrKzC8p0UvOz9UvSi3OyczLtgdK2ALZZSCOWmaKraG5uaGJiamlhZmRgYFadmqlrXtQgFpdUWpaKlB3Xnp8UlF%2BeXFqka1zRlF%2BbioA66vH9mAAAAA%3D",
    },
  ];

  return (
    <Box minH="100vh" bg="transparent">
      <NavBar />
      <Flex direction="column" align="center" pt={24} px={8} pb={16} textAlign="center">
        <TitleWithBrackets fontSize={["3xl", "4xl", "5xl"]}>{t("travel.title")}</TitleWithBrackets>
        <LanguageSlider />
        <Text mt={4} color="gray.700" maxW="2xl">{t("travel.intro")}</Text>

        <VStack spacing={8} mt={12} w="full" maxW="6xl" align="stretch">
          {hotelBlocks.map((hotel, index) => (
            <Flex
              key={index}
              p={{ base: 6, md: 10 }}
              bg="blackAlpha.40"
              borderRadius="2xl"
              shadow="none"
              textAlign="center"
              border="2px solid"
              borderColor="transparent"
              direction="column"
              justify="center"
              align="center"
              w="full"
              gap={3}
              backdropFilter="blur(4px)"
              transition="border-color 0.2s ease, background-color 0.2s ease"
              _hover={{ borderColor: "teal.900", bg: "blackAlpha.45" }}
            >
              <VStack spacing={2} maxW="3xl">
                <Heading fontSize={{ base: "2xl", md: "4xl" }} color="teal.900" lineHeight="1.1">
                  {hotel.title}
                </Heading>
                <VStack spacing={0.5}>
                  <Text color="gray.700" fontSize={{ base: "md", md: "lg" }} lineHeight="1.2">
                    {hotel.addressLine1}
                  </Text>
                  <Text color="gray.700" fontSize={{ base: "md", md: "lg" }} lineHeight="1.2">
                    {hotel.addressLine2}
                  </Text>
                </VStack>
                <Text color="gray.600" fontSize={{ base: "md", md: "lg" }}>
                  {t(`travel.hotels.${index}.details`)}
                </Text>
                <Text color="gray.700" fontSize={{ base: "md", md: "lg" }} fontWeight="semibold">
                  {t(`travel.hotels.${index}.reserveBy`)}
                </Text>
                {hotel.websiteUrl && (
                  <Button
                    as="a"
                    href={hotel.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    colorScheme="teal"
                    variant="solid"
                    _hover={{ bg: "teal.700" }}
                    size="lg"
                    w={{ base: "full", sm: "auto" }}
                    mt={2}
                  >
                    Visit Website
                  </Button>
                )}
              </VStack>
            </Flex>
          ))}
        </VStack>
      </Flex>
    </Box>
  );
}
