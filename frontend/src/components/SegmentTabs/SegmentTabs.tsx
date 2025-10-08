// frontend/src/components/SegmentTabs/SegmentTabs.tsx
import { HStack, Button, Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useThemeColor } from "../../context/ThemeColorContext";

type FilterOption = "active" | "historical" | "all";

interface SegmentTabsProps {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
}

export function SegmentTabs({ value, onChange }: SegmentTabsProps) {
  const { accentColorWithHash } = useThemeColor();
  const items: FilterOption[] = ["active", "historical", "all"];
  
  const getPosition = (val: FilterOption) => {
    switch(val) {
      case "active": return "0%";
      case "historical": return "33.33%";
      case "all": return "66.66%";
    }
  };

  return (
    <Box 
      pos="relative" 
      bg="bg-surface-raised" 
      p="1" 
      rounded="xl" 
      border="1px solid" 
      borderColor="border-primary"
      display="inline-flex"
    >
      <HStack spacing="1" position="relative" zIndex={1}>
        {items.map((k) => (
          <Button
            key={k}
            onClick={() => onChange(k)}
            variant="ghost"
            size="sm"
            px="6"
            py="2"
            color={value === k ? "text-on-accent" : "text-secondary"}
            fontWeight={value === k ? "semibold" : "normal"}
            _hover={{ bg: value === k ? "transparent" : "bg-hover" }}
            aria-pressed={value === k}
            transition="color 0.2s ease"
          >
            {k === "active" ? "Active" : k === "historical" ? "Historical" : "All"}
          </Button>
        ))}
      </HStack>
      <Box
        as={motion.div}
        layout
        position="absolute"
        top="4px"
        left={getPosition(value)}
        width="calc(33.33% - 2px)"
        height="calc(100% - 8px)"
        rounded="md"
        bg={accentColorWithHash}
        opacity="0.8"
        zIndex={0}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      />
    </Box>
  );
}

