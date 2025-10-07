// frontend/src/components/DropDownSearch/SearchableSelect.tsx
import { FormControl, FormLabel } from '@chakra-ui/react';
import { Select } from 'chakra-react-select';
import type { GroupBase, Props as SelectProps } from 'chakra-react-select';

// Define a standard option type for reusability
export interface SelectOption {
  value: string | number;
  label: string;
}

// Define the custom styles object inside the component file to keep it self-contained
const customSelectStyles = {
  control: (provided: any) => ({
    ...provided,
    bg: 'bg-surface-raised',
    borderColor: 'border-primary',
    '&:hover': {
      borderColor: 'border-primary',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    bg: 'bg-surface-raised',
    zIndex: 10,
  }),
  option: (provided: any, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...provided,
    bg: state.isFocused ? 'bg-surface' : 'transparent',
    color: state.isSelected ? 'brand.red' : 'text-primary',
    '&:active': {
      bg: 'bg-surface',
    },
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: 'text-muted',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'text-primary',
  }),
};

// Define the props for our reusable component
interface SearchableSelectProps extends SelectProps<SelectOption, false, GroupBase<SelectOption>> {
  label: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Search and select...",
  isLoading = false,
  isClearable = false,
  isDisabled = false,
  ...rest
}) => {
  return (
    <FormControl>
      <FormLabel color="text-primary">{label}</FormLabel>
      <Select
        options={options}
        value={value}
        onChange={onChange}
        onClear={() => {
          // Ensure clearing propagates to parent when user clicks the X
          if (onChange) (onChange as any)(null);
        }}
        placeholder={placeholder}
        isClearable={isClearable}
        isLoading={isLoading}
        isDisabled={isDisabled || isLoading}
        chakraStyles={customSelectStyles}
        focusBorderColor="brand.red"
        // Avoid focusing the search input immediately on open; require user tap in input first
        openMenuOnFocus={false}
        backspaceRemovesValue={true}
        {...rest}
      />
    </FormControl>
  );
};

export default SearchableSelect;

