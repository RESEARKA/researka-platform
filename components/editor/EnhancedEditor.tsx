import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { 
  Box, 
  VStack, 
  HStack, 
  Button, 
  useToast, 
  Text,
  Flex
} from '@chakra-ui/react';

import { EditorToolbar } from './components/EditorToolbar';
import { CitationPanel } from './components/CitationPanel';
import { PlagiarismIndicator } from './components/PlagiarismIndicator';
import { CitationExtension } from './extensions/citationExtension';
import { useCitations } from './hooks/useCitations';
import { usePlagiarismDetection } from './hooks/usePlagiarismDetection';
import { Citation } from './types/citation';
import { createLogger } from '../../utils/logger';

const logger = createLogger('enhanced-editor');

interface EnhancedEditorProps {
  initialContent?: string;
  initialCitations?: Citation[];
  articleId: string;
  onSave: (content: string, citations: Citation[]) => void;
  placeholder?: string;
  autoSaveInterval?: number; // in milliseconds
  enablePlagiarismCheck?: boolean;
}

export const EnhancedEditor: React.FC<EnhancedEditorProps> = ({ 
  initialContent = '', 
  initialCitations = [],
  articleId,
  onSave,
  placeholder = 'Begin writing your article...',
  autoSaveInterval = 30000, // 30 seconds
  enablePlagiarismCheck = true
}) => {
  const [showCitationPanel, setShowCitationPanel] = useState(false);
  const [wordCount, setWordCount] = useState({ words: 0, characters: 0 });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const toast = useToast();
  
  const { 
    citations, 
    addCitation, 
    removeCitation, 
    fetchCitationByDOI,
    fetchCitationByURL,
    createCitation,
    formatCitation,
    citationFormat,
    setCitationFormat
  } = useCitations(initialCitations);
  
  const {
    isLoading: isPlagiarismLoading,
    isChecked: isPlagiarismChecked,
    overallSimilarity,
    matches: plagiarismMatches,
    status: plagiarismStatus,
    error: plagiarismError,
    checkPlagiarism,
    checkPlagiarismNow
  } = usePlagiarismDetection({
    articleId,
    autoCheck: enablePlagiarismCheck
  });
  
  // Auto-save timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (autoSaveInterval > 0) {
      timer = setInterval(() => {
        handleAutoSave();
      }, autoSaveInterval);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoSaveInterval]);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder
      }),
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank'
        }
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CitationExtension.configure({
        HTMLAttributes: {},
        citations,
        formatCitation,
        defaultFormat: citationFormat
      })
    ],
    content: initialContent,
    autofocus: 'end',
    onUpdate: ({ editor }) => {
      // Update word count
      const text = editor.getText();
      setWordCount({
        words: text.split(/\s+/).filter(word => word.length > 0).length,
        characters: text.length
      });
      
      // Check for plagiarism when content changes
      if (enablePlagiarismCheck) {
        checkPlagiarism(text);
      }
    }
  });
  
  // Update the editor when citations change
  useEffect(() => {
    if (editor) {
      editor.view.dispatch(editor.view.state.tr);
    }
  }, [citations, citationFormat, editor]);
  
  const handleSave = useCallback(() => {
    if (editor) {
      const content = editor.getHTML();
      onSave(content, citations);
      setLastSaved(new Date());
      
      toast({
        title: 'Article saved',
        status: 'success',
        duration: 2000,
      });
    }
  }, [editor, citations, onSave, toast]);
  
  const handleAutoSave = useCallback(() => {
    if (editor && editor.getText().trim().length > 0) {
      const content = editor.getHTML();
      onSave(content, citations);
      setLastSaved(new Date());
      
      logger.info('Article auto-saved', {
        context: { wordCount: wordCount.words }
      });
    }
  }, [editor, citations, onSave, wordCount.words]);
  
  const handleInsertCitation = useCallback((citation: Citation) => {
    if (editor) {
      editor.chain().focus().insertCitation(citation.id, citationFormat).run();
    }
  }, [editor, citationFormat]);

  const handleCheckPlagiarismNow = useCallback(() => {
    if (editor) {
      checkPlagiarismNow(editor.getText());
    }
  }, [editor, checkPlagiarismNow]);

  if (!editor) {
    return null;
  }

  return (
    <VStack spacing={4} align="stretch" w="full">
      <EditorToolbar 
        editor={editor} 
        onCiteClick={() => setShowCitationPanel(!showCitationPanel)}
      />
      
      <HStack align="start" spacing={4} w="full">
        <Box 
          flex={1} 
          borderWidth="1px" 
          borderRadius="md" 
          p={4}
          minH="500px"
          bg="white"
          position="relative"
        >
          <EditorContent editor={editor} />
        </Box>
        
        <VStack align="stretch" spacing={4} w="300px">
          {showCitationPanel && (
            <CitationPanel
              citations={citations}
              onAddCitation={addCitation}
              onRemoveCitation={removeCitation}
              onInsertCitation={handleInsertCitation}
              fetchCitationByDOI={fetchCitationByDOI}
              fetchCitationByURL={fetchCitationByURL}
              createCitation={createCitation}
              citationFormat={citationFormat}
              setCitationFormat={setCitationFormat}
            />
          )}
          
          {enablePlagiarismCheck && (
            <PlagiarismIndicator 
              isLoading={isPlagiarismLoading}
              isChecked={isPlagiarismChecked}
              overallSimilarity={overallSimilarity}
              matches={plagiarismMatches}
              status={plagiarismStatus}
              onCheckNow={handleCheckPlagiarismNow}
            />
          )}
        </VStack>
      </HStack>
      
      <Flex justify="space-between" align="center">
        <HStack spacing={4}>
          <Text fontSize="sm" color="gray.600">
            {wordCount.words} words
          </Text>
          <Text fontSize="sm" color="gray.600">
            {wordCount.characters} characters
          </Text>
          {lastSaved && (
            <Text fontSize="sm" color="gray.600">
              Last saved: {lastSaved.toLocaleTimeString()}
            </Text>
          )}
        </HStack>
        
        <Button colorScheme="blue" onClick={handleSave}>
          Save Article
        </Button>
      </Flex>
    </VStack>
  );
};
