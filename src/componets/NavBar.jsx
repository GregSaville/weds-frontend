import { Box, Flex, Button } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NavBar() {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { label: t("home.nav.home"), to: "/" },
    { label: t("home.nav.registry"), to: "/registry" },
    { label: t("home.nav.schedule"), to: "/schedule" },
    { label: t("home.nav.rsvp"), to: "/rsvp" },
    { label: t("home.nav.gallery"), to: "/gallery" },
    { label: t("home.nav.weddingParty"), to: "/wedding-party" },
    { label: t("home.nav.qa"), to: "/qa" },
    { label: t("home.nav.travel"), to: "/travel" },
  ];

  return (
    <>
      <Flex
        as="nav"
        bg="white"
        shadow="md"
        position="sticky"
        top={0}
        left={0}
        w="100%"
        zIndex={100}
        justify="center"
        wrap="wrap"
        py={4}
        px={8}
      >
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Button
              key={item.to}
              as={Link}
              to={item.to}
              variant="ghost"
              color="black"
              mx={2}
              my={1}
              size="lg"
              borderRadius={0}
              _hover={{ bg: "transparent" }}
              _active={{ bg: "transparent" }}
              borderBottomWidth="3px"
              borderBottomStyle="solid"
              borderBottomColor={active ? "black" : "transparent"}
              pb={1}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Button>
          );
        })}
      </Flex>
    </>
  );
}
