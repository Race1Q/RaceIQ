// frontend/src/pages/CompareDriversPage/components/DriverSelectionPanel.tsx
import { Heading, VStack } from '@chakra-ui/react';
import SearchableSelect from '../../../components/DropDownSearch/SearchableSelect';
import type { SelectOption } from '../../../components/DropDownSearch/SearchableSelect';
import type { DriverDetails } from '../../../hooks/useDriverComparison';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  allDrivers: SelectOption[]; // standardized option type
  selectedDriverData: DriverDetails | null;
  onDriverSelect: (driverId: string) => void;
  isLoading?: boolean;
  extraControl?: ReactNode; // NEW: Optional extra control element
}

export const DriverSelectionPanel: React.FC<Props> = ({ 
  title, 
  allDrivers, 
  selectedDriverData, 
  onDriverSelect, 
  isLoading,
  extraControl 
}) => (
  <VStack spacing="md" bg="bg-surface" p="lg" borderRadius="md" w="100%" align="stretch">
    <Heading size="md" borderBottomWidth="2px" borderColor="border-primary" pb="sm" fontFamily="heading">
      {title}
    </Heading>
    <SearchableSelect
      label=""
      options={allDrivers}
      value={selectedDriverData ? { value: selectedDriverData.id, label: selectedDriverData.fullName } : null}
      onChange={(option) => onDriverSelect(option ? String((option as SelectOption).value) : '')}
      placeholder="Search for a Driver"
      isLoading={!!isLoading}
    />
    
    {/* NEW: Render extra control if provided */}
    {extraControl && (
      <div>{extraControl}</div>
    )}
    
    {/* Driver image and name moved to ComparisonTable header */}
  </VStack>
);