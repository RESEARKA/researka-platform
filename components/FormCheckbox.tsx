import React, { forwardRef } from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Checkbox,
  useColorModeValue,
  CheckboxProps as ChakraCheckboxProps,
  Box
} from '@chakra-ui/react';

interface FormCheckboxProps extends Omit<ChakraCheckboxProps, 'size'> {
  id: string;
  name: string;
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  isRequired?: boolean;
  checkboxLabel: string;
}

const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
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
      checkboxLabel,
      ...rest
    },
    ref
  ) => {
    // Dark mode support
    const labelColor = useColorModeValue('gray.700', 'gray.300');
    const helperColor = useColorModeValue('gray.600', 'gray.400');
    const checkboxColor = useColorModeValue('blue.500', 'blue.300');
    
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
        
        <Box pl={1}>
          <Checkbox
            id={id}
            name={name}
            ref={ref}
            size={size}
            colorScheme="blue"
            iconColor="white"
            sx={{
              '.chakra-checkbox__control': {
                borderColor: useColorModeValue('gray.300', 'gray.600'),
                _checked: {
                  bg: checkboxColor,
                  borderColor: checkboxColor,
                },
              }
            }}
            {...rest}
          >
            {checkboxLabel}
          </Checkbox>
        </Box>
        
        {isInvalid ? (
          <FormErrorMessage>{error}</FormErrorMessage>
        ) : helperText ? (
          <FormHelperText color={helperColor}>{helperText}</FormHelperText>
        ) : null}
      </FormControl>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';

export default FormCheckbox;
