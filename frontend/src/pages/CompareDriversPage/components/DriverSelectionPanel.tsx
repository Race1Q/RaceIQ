// frontend/src/pages/CompareDriversPage/components/DriverSelectionPanel.tsx
import { Heading, VStack, Image, Text } from '@chakra-ui/react';
import SearchableSelect from '../../../components/DropDownSearch/SearchableSelect';
import type { SelectOption } from '../../../components/DropDownSearch/SearchableSelect';
import type { DriverDetails } from '../../../hooks/useDriverComparison';
import type { ReactNode } from 'react';
import { driverHeadshots } from '../../../lib/driverHeadshots';

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
    
    {selectedDriverData && (
      <VStack spacing="sm" bg="bg-surface-raised" p="md" borderRadius="md" borderTopWidth="5px" borderColor={selectedDriverData.teamColorToken}>
        <Image
          src={driverHeadshots[selectedDriverData.fullName] || selectedDriverData.imageUrl || 'https://media.formula1.com/content/dam/fom-website/drivers/placeholder.png.transform/2col-retina/image.png'}
          alt={selectedDriverData.fullName}
          boxSize={{ base: "120px", md: "150px" }} 
          objectFit="cover" 
          borderRadius="full"
          borderWidth="4px" 
          borderColor="bg-surface"
          boxShadow="lg"
          maxW="100%"
        />
        <Heading size="md" color="text-primary">{selectedDriverData.fullName}</Heading>
        <Text color="text-secondary">{selectedDriverData.teamName}</Text>
      </VStack>
    )}
  </VStack>
);