import { Box, Heading } from "@chakra-ui/react";

export default function TitleWithBrackets({ children, fontSize = ["3xl", "4xl", "5xl"] }) {
  return (
    <Box position="relative" display="inline-block">
      <Heading
        fontSize={fontSize}
        fontWeight="extrabold"
        color="black"
        fontFamily='"adobe-jenson-pro", "Adobe Jenson Pro", serif'
        textTransform="uppercase"
        letterSpacing="wider"
        className="couple-names"
      >
        {children}
      </Heading>

      <Box
        as="svg"
        viewBox="0 0 50 50"
        position="absolute"
        top={["-22px", "-28px", "-34px"]}
        right={["-26px", "-32px", "-40px"]}
        w={["36px", "46px", "58px"]}
        h={["36px", "46px", "58px"]}
        opacity={0.85}
        pointerEvents="none"
      >
        <defs>
          <linearGradient id="goldMiniTR" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7e7a3" />
            <stop offset="60%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#b08649" />
          </linearGradient>
        </defs>
        <path
          d="M40 8 L40 26 Q40 30 36 30 L18 30"
          fill="none"
          stroke="url(#goldMiniTR)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Box>

      <Box
        as="svg"
        viewBox="0 0 50 50"
        position="absolute"
        bottom={["-22px", "-28px", "-34px"]}
        left={["-26px", "-32px", "-40px"]}
        w={["36px", "46px", "58px"]}
        h={["36px", "46px", "58px"]}
        opacity={0.85}
        pointerEvents="none"
      >
        <defs>
          <linearGradient id="goldMiniBL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7e7a3" />
            <stop offset="60%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#b08649" />
          </linearGradient>
        </defs>
        <path
          d="M10 42 L10 24 Q10 20 14 20 L32 20"
          fill="none"
          stroke="url(#goldMiniBL)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Box>
    </Box>
  );
}

