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

interface FormFileUploadProps extends Omit<ChakraInputProps, 'size' | 'type'> {
  id: string;
  name: string;
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  isRequired?: boolean;
  accept?: string;
  multiple?: boolean;
  buttonText?: string;
  showPreview?: boolean;
  maxFileSizeInMB?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileSelect?: (files: File[]) => void;
}

const FormFileUpload = forwardRef<HTMLInputElement, FormFileUploadProps>(
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
      accept = '*/*',
      multiple = false,
      buttonText = 'Choose File',
      showPreview = true,
      maxFileSizeInMB = 5,
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
          file => file.size > maxFileSizeInMB * 1024 * 1024
        );
        
        if (oversizedFiles.length > 0) {
          const fileNames = oversizedFiles.map(f => f.name).join(', ');
          alert(`Files exceeding ${maxFileSizeInMB}MB: ${fileNames}`);
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
          file => file.size > maxFileSizeInMB * 1024 * 1024
        );
        
        if (oversizedFiles.length > 0) {
          const fileNames = oversizedFiles.map(f => f.name).join(', ');
          alert(`Files exceeding ${maxFileSizeInMB}MB: ${fileNames}`);
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
          borderStyle="dashed"
          borderColor={dragActive ? 'blue.400' : borderColor}
          borderRadius="md"
          bg={dragActive ? dropzoneActiveBg : dropzoneBg}
          p={4}
          textAlign="center"
          transition="all 0.2s"
        >
          <Input
            id={id}
            name={name}
            ref={(node) => {
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              inputRef.current = node;
            }}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            display="none"
            {...rest}
          />
          
          <Flex direction="column" align="center" justify="center">
            <Icon as={FiUpload} boxSize={8} color="blue.500" mb={2} />
            <Text mb={2} fontWeight="medium">
              Drag & drop files here, or
            </Text>
            <Button
              size={size}
              onClick={() => inputRef.current?.click()}
              colorScheme="blue"
              variant="outline"
            >
              {buttonText}
            </Button>
            <Text fontSize="sm" color={helperColor} mt={2}>
              Max file size: {maxFileSizeInMB}MB
            </Text>
          </Flex>
          
          {uploadProgress !== null && (
            <Progress 
              value={uploadProgress} 
              size="sm" 
              colorScheme="blue" 
              mt={4} 
              borderRadius="full"
            />
          )}
        </Box>
        
        {showPreview && files.length > 0 && (
          <Box mt={4}>
            <Text fontWeight="medium" mb={2}>
              {files.length} {files.length === 1 ? 'file' : 'files'} selected
            </Text>
            <Box maxH="200px" overflowY="auto">
              {files.map((file, index) => (
                <Flex
                  key={index}
                  align="center"
                  bg={fileItemBg}
                  p={2}
                  borderRadius="md"
                  mb={2}
                >
                  <Icon as={FiFile} mr={2} />
                  <Text flex="1" fontSize="sm" isTruncated>
                    {file.name}
                  </Text>
                  <Text fontSize="xs" color={helperColor} mr={2}>
                    {formatFileSize(file.size)}
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => removeFile(index)}
                    aria-label="Remove file"
                  >
                    <Icon as={FiX} />
                  </Button>
                </Flex>
              ))}
            </Box>
          </Box>
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

FormFileUpload.displayName = 'FormFileUpload';

export default FormFileUpload;
