import React, { forwardRef } from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  useColorModeValue,
  SliderProps as ChakraSliderProps,
  Box,
  Flex,
  Text
} from '@chakra-ui/react';

interface FormSliderProps extends Omit<ChakraSliderProps, 'value' | 'onChange'> {
  id: string;
  name: string;
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  isRequired?: boolean;
  showTooltip?: boolean;
  showMarks?: boolean;
  marks?: { value: number; label: string }[];
  formatValue?: (value: number) => string;
  onChange: (value: number) => void;
}

const FormSlider = forwardRef<HTMLDivElement, FormSliderProps>(
  (
    {
      id,
      name,
      label,
      error,
      touched,
      helperText,
      value,
      min = 0,
      max = 100,
      step = 1,
      isRequired = false,
      showTooltip = true,
      showMarks = false,
      marks = [],
      formatValue = (val) => val.toString(),
      onChange,
      ...rest
    },
    ref
  ) => {
    const [showTooltipValue, setShowTooltipValue] = React.useState(false);
    
    // Dark mode support
    const labelColor = useColorModeValue('gray.700', 'gray.300');
    const helperColor = useColorModeValue('gray.600', 'gray.400');
    const markColor = useColorModeValue('gray.500', 'gray.400');
    const thumbBg = useColorModeValue('white', 'gray.200');
    const tooltipBg = useColorModeValue('gray.700', 'gray.200');
    const tooltipColor = useColorModeValue('white', 'gray.800');
    
    const isInvalid = !!error && touched;
    
    // Generate default marks if none provided but showMarks is true
    const displayMarks = showMarks 
      ? marks.length > 0 
        ? marks 
        : Array.from({ length: 5 }, (_, i) => {
            const value = min + (max - min) * (i / 4);
            return { value, label: formatValue(value) };
          })
      : [];
    
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
        
        <Box pt={6} pb={showMarks ? 8 : 2}>
          <Slider
            id={id}
            ref={ref}
            aria-label={label || name}
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={onChange}
            onMouseEnter={() => setShowTooltipValue(true)}
            onMouseLeave={() => setShowTooltipValue(false)}
            {...rest}
          >
            {displayMarks.map((mark) => (
              <SliderMark
                key={mark.value}
                value={mark.value}
                mt={3}
                ml={-2.5}
                fontSize="sm"
                color={markColor}
              >
                {mark.label}
              </SliderMark>
            ))}
            
            <SliderTrack bg={useColorModeValue('gray.200', 'gray.600')}>
              <SliderFilledTrack bg={useColorModeValue('blue.500', 'blue.300')} />
            </SliderTrack>
            
            <Tooltip
              hasArrow
              bg={tooltipBg}
              color={tooltipColor}
              placement="top"
              isOpen={showTooltip && showTooltipValue}
              label={formatValue(value)}
            >
              <SliderThumb 
                boxSize={6} 
                bg={thumbBg}
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                borderWidth={1}
                _focus={{
                  boxShadow: useColorModeValue(
                    '0 0 0 3px rgba(66, 153, 225, 0.6)',
                    '0 0 0 3px rgba(99, 179, 237, 0.6)'
                  )
                }}
              />
            </Tooltip>
          </Slider>
        </Box>
        
        <Flex justify="space-between">
          <Text fontSize="sm" color={labelColor}>
            {formatValue(min)}
          </Text>
          <Text fontSize="sm" color={labelColor}>
            {formatValue(max)}
          </Text>
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

FormSlider.displayName = 'FormSlider';

export default FormSlider;
