import React, { forwardRef } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage,
  FormHelperText,
  InputGroup,
  InputRightElement,
  Button,
  useColorModeValue,
  InputProps as ChakraInputProps
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface FormInputProps extends Omit<ChakraInputProps, 'size'> {
  id: string;
  name: string;
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  type?: string;
  isTextarea?: boolean;
  rows?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isRequired?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      name,
      label,
      error,
      touched,
      helperText,
      type = 'text',
      isTextarea = false,
      rows = 3,
      size = 'md',
      isRequired = false,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const handleTogglePassword = () => setShowPassword(!showPassword);
    
    const inputType = type === 'password' && showPassword ? 'text' : type;
    
    // Dark mode support
    const borderColor = useColorModeValue('gray.300', 'gray.600');
    const focusBorderColor = useColorModeValue('blue.500', 'blue.300');
    const labelColor = useColorModeValue('gray.700', 'gray.300');
    const helperColor = useColorModeValue('gray.600', 'gray.400');
    const inputBg = useColorModeValue('white', 'gray.700');
    
    const isInvalid = !!error && touched;
    
    const inputProps = {
      id,
      name,
      ref,
      borderColor,
      focusBorderColor,
      bg: inputBg,
      size,
      isInvalid,
      isRequired,
      ...rest
    };
    
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
        
        {isTextarea ? (
          <Textarea 
            {...inputProps} 
            rows={rows} 
            as="textarea"
          />
        ) : type === 'password' ? (
          <InputGroup size={size}>
            <Input 
              {...inputProps} 
              type={inputType} 
              pr="4.5rem"
            />
            <InputRightElement width="4.5rem">
              <Button 
                h="1.75rem" 
                size="sm" 
                onClick={handleTogglePassword}
                variant="ghost"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </Button>
            </InputRightElement>
          </InputGroup>
        ) : (
          <Input {...inputProps} type={inputType} />
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

FormInput.displayName = 'FormInput';

export default FormInput;
