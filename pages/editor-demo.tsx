import React, { useState } from 'react';
import { Container, Box, Heading, Text, VStack, useToast } from '@chakra-ui/react';
import { EnhancedEditor } from '../components/editor/EnhancedEditor';
import { Citation } from '../components/editor/types/citation';

const EditorDemo: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const toast = useToast();

  // Sample article ID for demo purposes
  const demoArticleId = 'demo-article-123';

  const handleSave = (newContent: string, newCitations: Citation[]) => {
    setContent(newContent);
    setCitations(newCitations);
    
    // In a real application, you would save this to your database
    console.log('Content saved:', newContent);
    console.log('Citations:', newCitations);
    
    // For demo purposes, we're just showing a toast
    toast({
      title: 'Content saved',
      description: `${newCitations.length} citations included`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Enhanced Article Editor
          </Heading>
          <Text color="gray.600">
            Write your article with academic-grade citation tools
          </Text>
        </Box>

        <EnhancedEditor
          initialContent=""
          initialCitations={[]}
          articleId={demoArticleId}
          onSave={handleSave}
          placeholder="Start writing your article here..."
          autoSaveInterval={60000} // Auto-save every minute
          enablePlagiarismCheck={true}
        />
      </VStack>
    </Container>
  );
};

export default EditorDemo;
