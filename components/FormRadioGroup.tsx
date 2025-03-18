import React, { forwardRef } from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  RadioGroup,
  Radio,
  Stack,
  useColorModeValue,
  RadioGroupProps as ChakraRadioGroupProps
} from '@chakra-ui/react';

interface RadioOption {
  value: string;
  label: string;
}

interface FormRadioGroupProps extends Omit<ChakraRadioGroupProps, 'children'> {
  id: string;
  name: string;
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  options: RadioOption[];
  size?: 'sm' | 'md' | 'lg';
  isRequired?: boolean;
  direction?: 'row' | 'column';
  spacing?: number;
}

const FormRadioGroup = forwardRef<HTMLDivElement, FormRadioGroupProps>(
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
      direction = 'column',
      spacing = 2,
      ...rest
    },
    ref
  ) => {
    // Dark mode support
    const labelColor = useColorModeValue('gray.700', 'gray.300');
    const helperColor = useColorModeValue('gray.600', 'gray.400');
    const radioColor = useColorModeValue('blue.500', 'blue.300');
    
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
        
        <RadioGroup
          id={id}
          name={name}
          ref={ref}
          size={size}
          colorScheme="blue"
          sx={{
            '.chakra-radio__control': {
              borderColor: useColorModeValue('gray.300', 'gray.600'),
              _checked: {
                bg: radioColor,
                borderColor: radioColor,
              }
            }
          }}
          {...rest}
        >
          <Stack direction={direction} spacing={spacing}>
            {options.map((option) => (
              <Radio 
                key={option.value} 
                value={option.value}
                size={size}
              >
                {option.label}
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
        
        {isInvalid ? (
          <FormErrorMessage>{error}</FormErrorMessage>
        ) : helperText ? (
          <FormHelperText color={helperColor}>{helperText}</FormHelperText>
        ) : null}
      </FormControl>
    );
  }
);

FormRadioGroup.displayName = 'FormRadioGroup';

export default FormRadioGroup;
