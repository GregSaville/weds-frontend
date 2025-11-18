import { Badge } from "@chakra-ui/react";

const STATUS_META = {
  ACCEPTED: { label: "Accepted", palette: "green" },
  DECLINED: { label: "Declined", palette: "red" },
  PENDING: { label: "Pending", palette: "gray" },
  PENDING_REVIEW: { label: "Pending Review", palette: "yellow" },
  APPROVED: { label: "Approved", palette: "blue" },
  OPEN: { label: "Open", palette: "green" },
  CLOSED: { label: "Closed", palette: "red" },
  ANYONE: { label: "Anyone", palette: "green" },
  INVITE: { label: "Invite Only", palette: "blue" },
};

const getStatusMeta = (status) => {
  const key = status ? String(status).toUpperCase() : "PENDING";
  return STATUS_META[key] || { label: String(status || "Pending"), palette: "blue" };
};

export default function StatusTag({ status, size = "sm" }) {
  const meta = getStatusMeta(status);
  const palette = meta.palette || "gray";
  return (
    <Badge
      size={size}
      colorPalette={palette}
      borderRadius="full"
      px={3}
      py={1}
      textTransform="uppercase"
      letterSpacing="wide"
      fontWeight="600"
      bgColor={`${palette}.100`}
      color={`${palette}.800`}
      borderWidth="1px"
      borderColor={`${palette}.200`}
    >
      {meta.label}
    </Badge>
  );
}
