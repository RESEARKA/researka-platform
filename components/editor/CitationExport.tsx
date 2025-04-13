/**
 * Citation Export Component
 * 
 * A React component that provides UI for exporting citations in various formats
 * with support for ORCID identifiers.
 */

import React, { useState } from 'react';
import { 
  Button, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  useClipboard,
  useToast,
  ToastId,
  Box,
  Text
} from '@chakra-ui/react';
import { ChevronDownIcon, CopyIcon, DownloadIcon } from '@chakra-ui/icons';
import { Citation } from './types/citation';
import { 
  exportToBibTeX, 
  exportToRIS, 
  exportToCSLJSON, 
  exportToPlainText 
} from './services/citationExportService';

// Export format type
type ExportFormat = 'bibtex' | 'ris' | 'csl' | 'text';

// Toast configuration
const TOAST_CONFIG = {
  duration: 3000,
  isClosable: true,
};

interface CitationExportProps {
  citation: Citation;
  variant?: 'button' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * CitationExport component for exporting citations in various formats
 */
export const CitationExport: React.FC<CitationExportProps> = ({ 
  citation,
  variant = 'button',
  size = 'md'
}) => {
  const toast = useToast();
  const [toastId, setToastId] = useState<ToastId | null>(null);
  const { onCopy, setValue, hasCopied } = useClipboard('');
  
  // Handle exporting citation in the selected format
  const handleExport = (format: ExportFormat) => {
    try {
      let exportText = '';
      let formatName = '';
      let fileExtension = '';
      
      // Generate the citation in the selected format
      switch (format) {
        case 'bibtex':
          exportText = exportToBibTeX(citation);
          formatName = 'BibTeX';
          fileExtension = 'bib';
          break;
        case 'ris':
          exportText = exportToRIS(citation);
          formatName = 'RIS';
          fileExtension = 'ris';
          break;
        case 'csl':
          exportText = exportToCSLJSON(citation);
          formatName = 'CSL-JSON';
          fileExtension = 'json';
          break;
        case 'text':
          exportText = exportToPlainText(citation);
          formatName = 'Plain Text';
          fileExtension = 'txt';
          break;
      }
      
      // Set the clipboard value and trigger copy
      setValue(exportText);
      onCopy();
      
      // Close previous toast if exists
      if (toastId) {
        toast.close(toastId);
      }
      
      // Show success toast
      const id = toast({
        title: 'Citation copied',
        description: `${formatName} format copied to clipboard`,
        status: 'success',
        ...TOAST_CONFIG
      });
      
      setToastId(id);
    } catch (error) {
      // Show error toast
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        ...TOAST_CONFIG
      });
    }
  };
  
  // Handle downloading the citation as a file
  const handleDownload = (format: ExportFormat) => {
    try {
      let exportText = '';
      let formatName = '';
      let fileExtension = '';
      let mimeType = 'text/plain';
      
      // Generate the citation in the selected format
      switch (format) {
        case 'bibtex':
          exportText = exportToBibTeX(citation);
          formatName = 'BibTeX';
          fileExtension = 'bib';
          break;
        case 'ris':
          exportText = exportToRIS(citation);
          formatName = 'RIS';
          fileExtension = 'ris';
          break;
        case 'csl':
          exportText = exportToCSLJSON(citation);
          formatName = 'CSL-JSON';
          fileExtension = 'json';
          mimeType = 'application/json';
          break;
        case 'text':
          exportText = exportToPlainText(citation);
          formatName = 'Plain Text';
          fileExtension = 'txt';
          break;
      }
      
      // Create a blob and download link
      const blob = new Blob([exportText], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `citation-${citation.id}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      // Show success toast
      toast({
        title: 'Citation downloaded',
        description: `${formatName} file has been downloaded`,
        status: 'success',
        ...TOAST_CONFIG
      });
    } catch (error) {
      // Show error toast
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        ...TOAST_CONFIG
      });
    }
  };
  
  // Render as button or inline variant
  if (variant === 'inline') {
    return (
      <Box>
        <Text fontWeight="bold" mb={2}>Export as:</Text>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <Button size={size} leftIcon={<CopyIcon />} onClick={() => handleExport('bibtex')}>BibTeX</Button>
          <Button size={size} leftIcon={<CopyIcon />} onClick={() => handleExport('ris')}>RIS</Button>
          <Button size={size} leftIcon={<CopyIcon />} onClick={() => handleExport('csl')}>CSL-JSON</Button>
          <Button size={size} leftIcon={<CopyIcon />} onClick={() => handleExport('text')}>Plain Text</Button>
        </Box>
      </Box>
    );
  }
  
  // Default button variant with dropdown menu
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size={size}>
        Export Citation
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => handleExport('bibtex')} icon={<CopyIcon />}>
          Copy as BibTeX
        </MenuItem>
        <MenuItem onClick={() => handleExport('ris')} icon={<CopyIcon />}>
          Copy as RIS
        </MenuItem>
        <MenuItem onClick={() => handleExport('csl')} icon={<CopyIcon />}>
          Copy as CSL-JSON
        </MenuItem>
        <MenuItem onClick={() => handleExport('text')} icon={<CopyIcon />}>
          Copy as Plain Text
        </MenuItem>
        <MenuItem onClick={() => handleDownload('bibtex')} icon={<DownloadIcon />}>
          Download BibTeX
        </MenuItem>
        <MenuItem onClick={() => handleDownload('ris')} icon={<DownloadIcon />}>
          Download RIS
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
