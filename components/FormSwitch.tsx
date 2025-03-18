import React, { forwardRef } from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Switch,
  useColorModeValue,
  SwitchProps as ChakraSwitchProps,
  Flex,
  Text
} from '@chakra-ui/react';

interface FormSwitchProps extends Omit<ChakraSwitchProps, 'size'> {
  id: string;
  name: string;
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  isRequired?: boolean;
  switchLabel?: string;
  labelPosition?: 'top' | 'left';
}

const FormSwitch = forwardRef<HTMLInputElement, FormSwitchProps>(
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
      switchLabel,
      labelPosition = 'top',
      ...rest
    },
    ref
  ) => {
    // Dark mode support
    const labelColor = useColorModeValue('gray.700', 'gray.300');
    const helperColor = useColorModeValue('gray.600', 'gray.400');
    const switchLabelColor = useColorModeValue('gray.800', 'gray.200');
    
    const isInvalid = !!error && touched;
    
    return (
      <FormControl 
        isInvalid={isInvalid} 
        mb={4} 
        isRequired={isRequired}
        display={labelPosition === 'left' ? 'flex' : 'block'}
        alignItems={labelPosition === 'left' ? 'center' : 'flex-start'}
      >
        {label && (
          <FormLabel 
            htmlFor={id} 
            color={labelColor}
            fontWeight="medium"
            mb={labelPosition === 'top' ? 2 : 0}
            mr={labelPosition === 'left' ? 4 : 0}
            flex={labelPosition === 'left' ? '1' : undefined}
          >
            {label}
          </FormLabel>
        )}
        
        <Flex align="center">
          <Switch
            id={id}
            name={name}
            ref={ref}
            size={size}
            colorScheme="blue"
            sx={{
              '.chakra-switch__track': {
                bg: useColorModeValue('gray.300', 'gray.600'),
              },
              '.chakra-switch__thumb': {
                bg: useColorModeValue('white', 'gray.200'),
              }
            }}
            {...rest}
          />
          
          {switchLabel && (
            <Text 
              ml={2} 
              fontSize={size} 
              color={switchLabelColor}
            >
              {switchLabel}
            </Text>
          )}
        </Flex>
        
        {isInvalid ? (
          <FormErrorMessage>{error}</FormErrorMessage>
        ) : helperText ? (
          <FormHelperText color={helperColor}>{helperText}</FormHelperText>
        ) : null}
      </FormControl>
    );
  }
);

FormSwitch.displayName = 'FormSwitch';

export default FormSwitch;
