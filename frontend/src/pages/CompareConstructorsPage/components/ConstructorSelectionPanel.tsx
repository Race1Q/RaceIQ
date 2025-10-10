// frontend/src/pages/CompareConstructorsPage/components/ConstructorSelectionPanel.tsx
import { Heading, VStack } from '@chakra-ui/react';
import SearchableSelect from '../../../components/DropDownSearch/SearchableSelect';
import type { SelectOption } from '../../../components/DropDownSearch/SearchableSelect';
import type { ConstructorDetails } from '../../../hooks/useConstructorComparison';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  allConstructors: SelectOption[]; // standardized option type
  selectedConstructorData: ConstructorDetails | null;
  onConstructorSelect: (constructorId: string) => void;
  isLoading?: boolean;
  extraControl?: ReactNode; // Optional extra control element
}

export const ConstructorSelectionPanel: React.FC<Props> = ({ 
  title, 
  allConstructors, 
  selectedConstructorData, 
  onConstructorSelect, 
  isLoading,
  extraControl 
}) => (
  <VStack spacing="md" bg="bg-surface" p="lg" borderRadius="md" w="100%" align="stretch">
    <Heading size="md" borderBottomWidth="2px" borderColor="border-primary" pb="sm" fontFamily="heading">
      {title}
    </Heading>
    <SearchableSelect
      label=""
      options={allConstructors}
      value={selectedConstructorData ? { value: selectedConstructorData.id, label: selectedConstructorData.name } : null}
      onChange={(option) => onConstructorSelect(option ? String((option as SelectOption).value) : '')}
      placeholder="Search for a Constructor"
      isLoading={!!isLoading}
    />
    
    {/* Render extra control if provided */}
    {extraControl && (
      <div>{extraControl}</div>
    )}
    
    {/* Constructor details moved to ComparisonTable header */}
  </VStack>
);
