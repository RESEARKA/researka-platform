import React, { forwardRef } from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Select,
  useColorModeValue,
  SelectProps as ChakraSelectProps
} from '@chakra-ui/react';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends Omit<ChakraSelectProps, 'size'> {
  id: string;
  name: string;
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  options: SelectOption[];
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isRequired?: boolean;
  placeholder?: string;
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      id,
      name,
      label,
      error,
      touched,
      helperText,
      options,
      size = 'md',
      isRequired = false,
      placeholder = 'Select an option',
      ...rest
    },
    ref
  ) => {
    // Dark mode support
    const borderColor = useColorModeValue('gray.300', 'gray.600');
    const focusBorderColor = useColorModeValue('blue.500', 'blue.300');
    const labelColor = useColorModeValue('gray.700', 'gray.300');
    const helperColor = useColorModeValue('gray.600', 'gray.400');
    const inputBg = useColorModeValue('white', 'gray.700');
    const iconColor = useColorModeValue('gray.600', 'gray.400');
    
    const isInvalid = !!error && touched;
    
    return (
      <FormControl isInvalid={isInvalid} mb={4} isRequired={isRequired}>
        {label && (
          <FormLabel 
            htmlFor={id} 
            color={labelColor}
            fontWeight="medium"
            mb={2}
          >
            {label}
          </FormLabel>
        )}
        
        <Select
          id={id}
          name={name}
          ref={ref}
          placeholder={placeholder}
          size={size}
          borderColor={borderColor}
          focusBorderColor={focusBorderColor}
          bg={inputBg}
          isInvalid={isInvalid}
          icon={<ChevronDownIcon color={iconColor} />}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        
        {isInvalid ? (
          <FormErrorMessage>{error}</FormErrorMessage>
        ) : helperText ? (
          <FormHelperText color={helperColor}>{helperText}</FormHelperText>
        ) : null}
      </FormControl>
    );
  }
);

// Custom ChevronDown icon for better dark mode support
const ChevronDownIcon = ({ color }: { color: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9L12 15L18 9"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

FormSelect.displayName = 'FormSelect';

export default FormSelect;
