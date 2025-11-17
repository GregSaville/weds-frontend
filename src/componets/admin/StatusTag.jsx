import { Badge } from "@chakra-ui/react";

const RSVP_STATUS_META = {
  ACCEPTED: { label: "Accepted", scheme: "green" },
  DECLINED: { label: "Declined", scheme: "red" },
  WAITLISTED: { label: "Waitlisted", scheme: "purple" },
  PENDING: { label: "Pending", scheme: "gray" },
};

const getStatusMeta = (status) => {
  if (!status) return { label: "Pending", scheme: "gray" };
  const key = String(status).toUpperCase();
  if (RSVP_STATUS_META[key]) return RSVP_STATUS_META[key];
  return { label: status, scheme: "blue" };
};

export default function StatusTag({ status, size = "sm" }) {
  const meta = getStatusMeta(status);
  return (
    <Badge
      size={size}
      colorScheme={meta.scheme}
      variant="subtle"
      borderRadius="full"
      px={3}
      py={1}
      textTransform="uppercase"
      letterSpacing="wide"
      fontWeight="600"
    >
      {meta.label}
    </Badge>
  );
}
