import React, { forwardRef } from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  NumberInputProps as ChakraNumberInputProps
} from '@chakra-ui/react';

interface FormNumberInputProps extends Omit<ChakraNumberInputProps, 'size'> {
  id: string;
  name: string;
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isRequired?: boolean;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  format?: (value: string) => string;
  parse?: (value: string) => string;
}

const FormNumberInput = forwardRef<HTMLInputElement, FormNumberInputProps>(
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
      min,
      max,
      step = 1,
      precision,
      format,
      parse,
      ...rest
    },
    ref
  ) => {
    // Dark mode support
    const labelColor = useColorModeValue('gray.700', 'gray.300');
    const helperColor = useColorModeValue('gray.600', 'gray.400');
    const borderColor = useColorModeValue('gray.300', 'gray.600');
    const inputBg = useColorModeValue('white', 'gray.700');
    const stepperBg = useColorModeValue('gray.100', 'gray.600');
    const stepperActiveBg = useColorModeValue('gray.200', 'gray.500');
    
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
        
        <NumberInput
          id={id}
          name={name}
          size={size}
          min={min}
          max={max}
          step={step}
          precision={precision}
          format={format}
          parse={parse}
          borderColor={borderColor}
          focusBorderColor={useColorModeValue('blue.500', 'blue.300')}
          errorBorderColor="red.500"
          isInvalid={isInvalid}
          {...rest}
        >
          <NumberInputField 
            ref={ref}
            bg={inputBg}
          />
          <NumberInputStepper>
            <NumberIncrementStepper 
              bg={stepperBg}
              _active={{ bg: stepperActiveBg }}
              borderColor={borderColor}
            />
            <NumberDecrementStepper 
              bg={stepperBg}
              _active={{ bg: stepperActiveBg }}
              borderColor={borderColor}
            />
          </NumberInputStepper>
        </NumberInput>
        
        {isInvalid ? (
          <FormErrorMessage>{error}</FormErrorMessage>
        ) : helperText ? (
          <FormHelperText color={helperColor}>{helperText}</FormHelperText>
        ) : null}
      </FormControl>
    );
  }
);

FormNumberInput.displayName = 'FormNumberInput';

export default FormNumberInput;
