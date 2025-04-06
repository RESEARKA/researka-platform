import React, { forwardRef, useState, useRef } from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Button,
  Flex,
  Text,
  Box,
  Icon,
  useColorModeValue,
  InputProps as ChakraInputProps,
  Progress
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

export interface FormFileUploadProps extends Omit<ChakraInputProps, 'size' | 'type'> {
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  isRequired?: boolean;
  accept?: string;
  acceptedFileTypes?: string;
  multiple?: boolean;
  buttonText?: string;
  showPreview?: boolean;
  maxFileSizeInMB?: number;
  maxFileSizeMB?: number;
  isDisabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileSelect?: (files: File[]) => void;
}

const FormFileUpload = forwardRef<HTMLInputElement, FormFileUploadProps>(
  (
    {
      id = 'file-upload',
      name = 'file',
      label,
      error,
      touched,
      helperText,
      size = 'md',
      isRequired = false,
      accept,
      acceptedFileTypes,
      multiple = false,
      buttonText = 'Choose File',
      showPreview = true,
      maxFileSizeInMB,
      maxFileSizeMB = 5,
      isDisabled = false,
      onChange,
      onFileSelect,
      ...rest
    },
    ref
  ) => {
    const [files, setFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Use either acceptedFileTypes or accept prop
    const fileAccept = acceptedFileTypes || accept || '*/*';
    
    // Use either maxFileSizeMB or maxFileSizeInMB prop
    const maxSize = maxFileSizeMB || maxFileSizeInMB || 5;
    
    // Dark mode support
    const labelColor = useColorModeValue('gray.700', 'gray.300');
    const helperColor = useColorModeValue('gray.600', 'gray.400');
    const borderColor = useColorModeValue('gray.300', 'gray.600');
    const dropzoneBg = useColorModeValue('gray.50', 'gray.800');
    const dropzoneActiveBg = useColorModeValue('blue.50', 'blue.900');
    const fileItemBg = useColorModeValue('gray.100', 'gray.700');
    
    const isInvalid = !!error && touched;
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const fileList = Array.from(e.target.files);
        
        // Check file size
        const oversizedFiles = fileList.filter(
          file => file.size > maxSize * 1024 * 1024
        );
        
        if (oversizedFiles.length > 0) {
          const fileNames = oversizedFiles.map(f => f.name).join(', ');
          alert(`Files exceeding ${maxSize}MB: ${fileNames}`);
          return;
        }
        
        setFiles(multiple ? fileList : [fileList[0]]);
        
        if (onFileSelect) {
          onFileSelect(multiple ? fileList : [fileList[0]]);
        }
        
        // Simulate upload progress
        simulateUploadProgress();
      }
      
      if (onChange) {
        onChange(e);
      }
    };
    
    const simulateUploadProgress = () => {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return null;
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => setUploadProgress(null), 500);
            return 100;
          }
          return newProgress;
        });
      }, 100);
    };
    
    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    };
    
    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
    };
    
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const fileList = Array.from(e.dataTransfer.files);
        
        // Check file size
        const oversizedFiles = fileList.filter(
          file => file.size > maxSize * 1024 * 1024
        );
        
        if (oversizedFiles.length > 0) {
          const fileNames = oversizedFiles.map(f => f.name).join(', ');
          alert(`Files exceeding ${maxSize}MB: ${fileNames}`);
          return;
        }
        
        setFiles(multiple ? fileList : [fileList[0]]);
        
        if (onFileSelect) {
          onFileSelect(multiple ? fileList : [fileList[0]]);
        }
        
        // Simulate upload progress
        simulateUploadProgress();
      }
    };
    
    const removeFile = (index: number) => {
      setFiles(prev => prev.filter((_, i) => i !== index));
      
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      
      if (onFileSelect) {
        onFileSelect(files.filter((_, i) => i !== index));
      }
    };
    
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return bytes + ' B';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      else return (bytes / 1048576).toFixed(1) + ' MB';
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
        
        <Box
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          borderWidth={2}
          borderRadius="md"
          borderColor={dragActive ? 'blue.500' : borderColor}
          borderStyle="dashed"
          bg={dragActive ? dropzoneActiveBg : dropzoneBg}
          p={4}
          textAlign="center"
          transition="all 0.2s"
          cursor={isDisabled ? 'not-allowed' : 'pointer'}
          opacity={isDisabled ? 0.6 : 1}
          position="relative"
          onClick={() => !isDisabled && inputRef.current?.click()}
        >
          <Input
            ref={inputRef}
            id={id}
            name={name}
            type="file"
            accept={fileAccept}
            multiple={multiple}
            onChange={handleFileChange}
            hidden
            disabled={isDisabled}
            {...rest}
          />
          
          {files.length === 0 ? (
            <Flex direction="column" align="center" justify="center" py={4}>
              <Icon as={FiUpload} boxSize={8} color="blue.500" mb={2} />
              <Text fontWeight="medium" mb={1}>{buttonText}</Text>
              <Text fontSize="sm" color={helperColor}>
                {helperText || `Drag and drop or click to select a file (Max: ${maxSize}MB)`}
              </Text>
            </Flex>
          ) : (
            showPreview && (
              <Box>
                {files.map((file, index) => (
                  <Flex
                    key={`${file.name}-${index}`}
                    bg={fileItemBg}
                    p={2}
                    borderRadius="md"
                    mb={2}
                    alignItems="center"
                  >
                    <Icon as={FiFile} mr={2} />
                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                        {file.name}
                      </Text>
                      <Text fontSize="xs" color={helperColor}>
                        {formatFileSize(file.size)}
                      </Text>
                    </Box>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      isDisabled={isDisabled}
                    >
                      <Icon as={FiX} />
                    </Button>
                  </Flex>
                ))}
              </Box>
            )
          )}
          
          {uploadProgress !== null && (
            <Progress
              value={uploadProgress}
              size="xs"
              colorScheme="blue"
              mt={2}
              borderRadius="full"
              isAnimated
              hasStripe
            />
          )}
        </Box>
        
        {error && touched && (
          <FormErrorMessage>{error}</FormErrorMessage>
        )}
      </FormControl>
    );
  }
);

FormFileUpload.displayName = 'FormFileUpload';

export default FormFileUpload;
