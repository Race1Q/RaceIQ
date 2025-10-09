// frontend/src/pages/CompareConstructorsPage/components/ConstructorSelectionPanel.tsx
import { Box, Text, VStack } from '@chakra-ui/react';
import { SearchableSelect } from '../../../components/DropDownSearch/SearchableSelect';

interface ConstructorSelectionPanelProps {
  title: string;
  allConstructors: Array<{ value: string | number; label: string }>;
  onChange: (option: { value: string | number; label: string } | null) => void;
  isLoading: boolean;
  extraControl?: React.ReactNode;
}

export const ConstructorSelectionPanel: React.FC<ConstructorSelectionPanelProps> = ({
  title,
  allConstructors,
  onChange,
  isLoading,
  extraControl,
}) => {

  return (
    <VStack spacing="md" align="stretch" w="full">
      <Text fontSize="lg" fontWeight="bold" textAlign="center" color="text-primary">
        {title}
      </Text>
      
      <SearchableSelect
        label={title}
        options={allConstructors}
        onChange={onChange}
        placeholder="Search constructors..."
        isLoading={isLoading}
      />

      {extraControl && (
        <Box>
          {extraControl}
        </Box>
      )}

    </VStack>
  );
};
