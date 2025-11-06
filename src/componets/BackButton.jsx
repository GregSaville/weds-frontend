import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function BackButton() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Button
      position="fixed"
      top={4}
      left={4}
      zIndex={1000}
      colorScheme="yellow"
      variant="solid"
      size="md"
      onClick={() => navigate(-1)}
    >
      {t("common.back", "Back")}
    </Button>
  );
}

