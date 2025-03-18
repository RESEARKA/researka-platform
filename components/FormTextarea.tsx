import React, { forwardRef } from 'react';
import {
  FormControl,
  FormLabel,
  Textarea,
  FormErrorMessage,
  FormHelperText,
  useColorModeValue,
  TextareaProps as ChakraTextareaProps,
  Text
} from '@chakra-ui/react';

interface FormTextareaProps extends Omit<ChakraTextareaProps, 'size'> {
  id: string;
  name: string;
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isRequired?: boolean;
  rows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
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
      rows = 4,
      maxLength,
      showCharacterCount = false,
      value = '',
      ...rest
    },
    ref
  ) => {
    // Dark mode support
    const labelColor = useColorModeValue('gray.700', 'gray.300');
    const helperColor = useColorModeValue('gray.600', 'gray.400');
    const borderColor = useColorModeValue('gray.300', 'gray.600');
    const inputBg = useColorModeValue('white', 'gray.700');
    const countColor = useColorModeValue('gray.500', 'gray.400');
    
    const isInvalid = !!error && touched;
    const currentLength = typeof value === 'string' ? value.length : 0;
    const isNearLimit = maxLength && currentLength >= maxLength * 0.9;
    
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
        
        <Textarea
          id={id}
          name={name}
          ref={ref}
          size={size}
          rows={rows}
          borderColor={borderColor}
          focusBorderColor={useColorModeValue('blue.500', 'blue.300')}
          bg={inputBg}
          maxLength={maxLength}
          value={value}
          resize="vertical"
          transition="all 0.2s"
          _hover={{
            borderColor: useColorModeValue('gray.400', 'gray.500')
          }}
          {...rest}
        />
        
        {showCharacterCount && maxLength && (
          <Text 
            mt={1} 
            fontSize="sm" 
            textAlign="right"
            color={isNearLimit ? (isInvalid ? 'red.500' : 'orange.500') : countColor}
          >
            {currentLength} / {maxLength}
          </Text>
        )}
        
        {isInvalid ? (
          <FormErrorMessage>{error}</FormErrorMessage>
        ) : helperText ? (
          <FormHelperText color={helperColor}>{helperText}</FormHelperText>
        ) : null}
      </FormControl>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea;
