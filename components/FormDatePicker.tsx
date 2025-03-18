import React, { forwardRef, useState } from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  InputGroup,
  InputRightElement,
  Icon,
  useColorModeValue,
  InputProps as ChakraInputProps,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Box,
  Grid,
  Center,
  Flex,
  Text,
  IconButton
} from '@chakra-ui/react';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface FormDatePickerProps extends Omit<ChakraInputProps, 'size' | 'value' | 'onChange'> {
  id: string;
  name: string;
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isRequired?: boolean;
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const FormDatePicker = forwardRef<HTMLInputElement, FormDatePickerProps>(
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
      value,
      onChange,
      minDate,
      maxDate,
      dateFormat = 'MM/DD/YYYY',
      ...rest
    },
    ref
  ) => {
    const [currentMonth, setCurrentMonth] = useState(value || new Date());
    
    // Dark mode support
    const labelColor = useColorModeValue('gray.700', 'gray.300');
    const helperColor = useColorModeValue('gray.600', 'gray.400');
    const borderColor = useColorModeValue('gray.300', 'gray.600');
    const inputBg = useColorModeValue('white', 'gray.700');
    const calendarBg = useColorModeValue('white', 'gray.800');
    const dayHoverBg = useColorModeValue('gray.100', 'gray.700');
    const selectedDayBg = useColorModeValue('blue.500', 'blue.400');
    const selectedDayColor = useColorModeValue('white', 'white');
    const disabledDayColor = useColorModeValue('gray.300', 'gray.500');
    const dayColor = useColorModeValue('gray.800', 'gray.200');
    const monthNavBg = useColorModeValue('gray.100', 'gray.700');
    
    const isInvalid = !!error && touched;
    
    // Format date for display in input
    const formatDate = (date: Date | null): string => {
      if (!date) return '';
      
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      
      if (dateFormat === 'MM/DD/YYYY') {
        return `${month}/${day}/${year}`;
      } else if (dateFormat === 'DD/MM/YYYY') {
        return `${day}/${month}/${year}`;
      } else if (dateFormat === 'YYYY-MM-DD') {
        return `${year}-${month}-${day}`;
      }
      
      return `${month}/${day}/${year}`;
    };
    
    // Parse date from input string
    const parseDate = (dateStr: string): Date | null => {
      if (!dateStr) return null;
      
      const parts = dateStr.split(/[-/]/);
      
      if (parts.length !== 3) return null;
      
      let year: number, month: number, day: number;
      
      if (dateFormat === 'MM/DD/YYYY') {
        month = parseInt(parts[0], 10) - 1;
        day = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      } else if (dateFormat === 'DD/MM/YYYY') {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      } else if (dateFormat === 'YYYY-MM-DD') {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else {
        month = parseInt(parts[0], 10) - 1;
        day = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      }
      
      if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
      
      const date = new Date(year, month, day);
      
      // Check if date is valid
      if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
        return null;
      }
      
      return date;
    };
    
    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const dateStr = e.target.value;
      const parsedDate = parseDate(dateStr);
      
      if (parsedDate) {
        setCurrentMonth(parsedDate);
      }
      
      onChange(parsedDate);
    };
    
    // Navigate to previous month
    const prevMonth = () => {
      setCurrentMonth(new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      ));
    };
    
    // Navigate to next month
    const nextMonth = () => {
      setCurrentMonth(new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      ));
    };
    
    // Check if date is the same day
    const isSameDay = (date1: Date, date2: Date): boolean => {
      return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      );
    };
    
    // Check if date is disabled
    const isDisabled = (date: Date): boolean => {
      if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) {
        return true;
      }
      
      if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999))) {
        return true;
      }
      
      return false;
    };
    
    // Generate calendar days for current month view
    const getDaysInMonth = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // First day of the month
      const firstDay = new Date(year, month, 1);
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0);
      
      // Get the day of the week for the first day (0-6, where 0 is Sunday)
      const firstDayOfWeek = firstDay.getDay();
      
      // Total number of days in the month
      const daysInMonth = lastDay.getDate();
      
      // Array to hold all days to display
      const days = [];
      
      // Add empty slots for days before the first day of the month
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add days of the month
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
      }
      
      return days;
    };
    
    // Handle day selection
    const handleDayClick = (day: Date) => {
      onChange(day);
    };
    
    const days = getDaysInMonth();
    
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
        
        <Popover placement="bottom-start">
          <PopoverTrigger>
            <InputGroup>
              <Input
                id={id}
                name={name}
                ref={ref}
                value={formatDate(value)}
                onChange={handleInputChange}
                placeholder={dateFormat.toLowerCase()}
                size={size}
                borderColor={borderColor}
                focusBorderColor={useColorModeValue('blue.500', 'blue.300')}
                bg={inputBg}
                isInvalid={isInvalid}
                {...rest}
              />
              <InputRightElement>
                <Icon as={FiCalendar} color={labelColor} />
              </InputRightElement>
            </InputGroup>
          </PopoverTrigger>
          
          <PopoverContent 
            width="280px" 
            bg={calendarBg}
            borderColor={borderColor}
            shadow="lg"
          >
            <PopoverBody p={3}>
              {/* Month navigation */}
              <Flex justify="space-between" align="center" mb={4}>
                <IconButton
                  aria-label="Previous month"
                  icon={<FiChevronLeft />}
                  size="sm"
                  variant="ghost"
                  onClick={prevMonth}
                  _hover={{ bg: monthNavBg }}
                />
                
                <Text fontWeight="medium">
                  {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>
                
                <IconButton
                  aria-label="Next month"
                  icon={<FiChevronRight />}
                  size="sm"
                  variant="ghost"
                  onClick={nextMonth}
                  _hover={{ bg: monthNavBg }}
                />
              </Flex>
              
              {/* Day headers */}
              <Grid templateColumns="repeat(7, 1fr)" mb={2}>
                {DAYS.map((day) => (
                  <Center key={day} py={1}>
                    <Text fontSize="xs" fontWeight="bold" color={labelColor}>
                      {day}
                    </Text>
                  </Center>
                ))}
              </Grid>
              
              {/* Calendar days */}
              <Grid templateColumns="repeat(7, 1fr)" gap={1}>
                {days.map((day, index) => (
                  <Box key={index} textAlign="center">
                    {day ? (
                      <Center
                        as="button"
                        height="36px"
                        width="36px"
                        borderRadius="full"
                        disabled={isDisabled(day)}
                        onClick={() => !isDisabled(day) && handleDayClick(day)}
                        bg={value && isSameDay(day, value) ? selectedDayBg : 'transparent'}
                        color={
                          isDisabled(day)
                            ? disabledDayColor
                            : value && isSameDay(day, value)
                            ? selectedDayColor
                            : dayColor
                        }
                        _hover={
                          !isDisabled(day) && (!value || !isSameDay(day, value))
                            ? { bg: dayHoverBg }
                            : {}
                        }
                        cursor={isDisabled(day) ? 'not-allowed' : 'pointer'}
                      >
                        {day.getDate()}
                      </Center>
                    ) : (
                      <Box height="36px" width="36px" />
                    )}
                  </Box>
                ))}
              </Grid>
            </PopoverBody>
          </PopoverContent>
        </Popover>
        
        {isInvalid ? (
          <FormErrorMessage>{error}</FormErrorMessage>
        ) : helperText ? (
          <FormHelperText color={helperColor}>{helperText}</FormHelperText>
        ) : null}
      </FormControl>
    );
  }
);

FormDatePicker.displayName = 'FormDatePicker';

export default FormDatePicker;
