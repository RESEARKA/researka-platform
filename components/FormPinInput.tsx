import React, { forwardRef } from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  PinInput,
  PinInputField,
  HStack,
  useColorModeValue
} from '@chakra-ui/react';

interface FormPinInputProps {
  id: string;
  name: string;
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isRequired?: boolean;
  length?: number;
  type?: 'alphanumeric' | 'number';
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  mask?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  isDisabled?: boolean;
}

const FormPinInput = forwardRef<HTMLInputElement, FormPinInputProps>(
  (
    {
      id,
      name,
      label,
      error,
      touched,
      helperText,
      size = 'md',
      isRequired = false,
      length = 4,
      type = 'number',
      value,
      onChange,
      onComplete,
      mask = false,
      autoFocus = false,
      placeholder = '○',
      isDisabled = false,
    },
    ref
  ) => {
    // Dark mode support
    const labelColor = useColorModeValue('gray.700', 'gray.300');
    const helperColor = useColorModeValue('gray.600', 'gray.400');
    const borderColor = useColorModeValue('gray.300', 'gray.600');
    const inputBg = useColorModeValue('white', 'gray.700');
    
    const isInvalid = !!error && touched;
    
    // Create an array of length elements
    const pinFields = Array.from({ length }, (_, index) => index);
    
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
        
        <HStack spacing={4} justify="center">
          <PinInput
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            onComplete={onComplete}
            mask={mask}
            autoFocus={autoFocus}
            placeholder={placeholder}
            isDisabled={isDisabled}
            size={size}
          >
            {pinFields.map((_, index) => (
              <PinInputField
                key={index}
                ref={index === 0 ? ref : undefined}
                borderColor={borderColor}
                focusBorderColor={useColorModeValue('blue.500', 'blue.300')}
                bg={inputBg}
                _hover={{
                  borderColor: useColorModeValue('gray.400', 'gray.500')
                }}
              />
            ))}
          </PinInput>
        </HStack>
        
        {isInvalid ? (
          <FormErrorMessage>{error}</FormErrorMessage>
        ) : helperText ? (
          <FormHelperText color={helperColor}>{helperText}</FormHelperText>
        ) : null}
      </FormControl>
    );
  }
);

FormPinInput.displayName = 'FormPinInput';

export default FormPinInput;
