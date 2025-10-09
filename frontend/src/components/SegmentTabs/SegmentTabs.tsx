// src/components/SegmentTabs.tsx
import { HStack, Button, Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

type Opt = "active" | "historical" | "all";

export function SegmentTabs({ value, onChange }: { value: Opt; onChange: (v: Opt) => void }) {
  const items: Opt[] = ["active", "historical", "all"];
  
  return (
    <Box pos="relative" bg="blackAlpha.400" p="1" rounded="xl" border="1px solid" borderColor="whiteAlpha.200">
      <HStack spacing="1" position="relative">
        {items.map((k) => (
          <Button
            key={k}
            onClick={() => onChange(k)}
            variant="ghost"
            size="sm"
            px="4"
            colorScheme="teal"
            _hover={{ bg: "whiteAlpha.100" }}
            aria-pressed={value === k}
          >
            {k === "active" ? "Active" : k === "historical" ? "Historical" : "All"}
          </Button>
        ))}
      </HStack>
      <Box
        as={motion.div}
        layout
        position="absolute"
        top="2px"
        left={`${({ active: "0%", historical: "33.4%", all: "66.8%" } as any)[value]}`}
        width="33%"
        height="calc(100% - 4px)"
        rounded="md"
        bgGradient="linear(to-r, teal.500, cyan.500)"
        opacity="0.25"
        transition={{ type: "spring", stiffness: 260, damping: 30 } as any}
      />
    </Box>
  );
}