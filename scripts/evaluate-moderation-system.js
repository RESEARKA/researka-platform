// Script to evaluate the proposed content moderation system
require('dotenv').config();
const { OpenAI } = require('openai');

// Check for API key
const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

if (!apiKey) {
  console.error('ERROR: DeepSeek API key not found in environment variables');
  process.exit(1);
}

// Initialize OpenAI client with DeepSeek base URL
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey,
  timeout: 60000,
  maxRetries: 3,
});

// Proposed moderation system design
const proposedSystem = `
# Content Moderation System for DecentraJournal

## Database Schema

\`\`\`typescript
// Firestore collections and document structure

// New collection for flags
interface Flag {
  id: string;
  articleId: string;
  reportedBy: string; // userId
  reason: string;
  category: string; // e.g., 'misinformation', 'offensive', 'plagiarism'
  timestamp: Date;
  status: 'pending' | 'reviewed' | 'dismissed';
  reviewedBy?: string; // adminId
  reviewNotes?: string;
}

// Extended article interface with moderation fields
interface Article {
  // ...existing fields
  flagCount: number;
  flaggedBy: string[]; // array of userIds
  moderationStatus: 'active' | 'under_review' | 'reinstated' | 'removed';
  lastFlaggedAt?: Date;
}
\`\`\`

## API Endpoints

\`\`\`typescript
// New API endpoints for moderation

// User-facing endpoint to flag content
// POST /api/articles/:id/flag
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { category, reason } = req.body;
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const userId = session.user.id;
    const db = getFirestore();
    
    // Check if user has already flagged this article
    const articleRef = doc(db, 'articles', id as string);
    const articleSnap = await getDoc(articleRef);
    
    if (!articleSnap.exists()) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    const articleData = articleSnap.data();
    const flaggedBy = articleData.flaggedBy || [];
    
    if (flaggedBy.includes(userId)) {
      return res.status(400).json({ error: 'You have already flagged this article' });
    }
    
    // Create a new flag
    const flagRef = doc(collection(db, 'flags'));
    await setDoc(flagRef, {
      id: flagRef.id,
      articleId: id,
      reportedBy: userId,
      reason,
      category,
      timestamp: serverTimestamp(),
      status: 'pending'
    });
    
    // Update article with flag information
    const newFlagCount = (articleData.flagCount || 0) + 1;
    await updateDoc(articleRef, {
      flagCount: newFlagCount,
      flaggedBy: [...flaggedBy, userId],
      lastFlaggedAt: serverTimestamp(),
      // If this is the second flag, change status to under_review
      ...(newFlagCount >= 2 ? { moderationStatus: 'under_review' } : {})
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error flagging article:', error);
    return res.status(500).json({ error: 'Failed to flag article' });
  }
}

// Admin endpoint to get moderation queue
// GET /api/admin/moderation/queue
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session || !['Admin', 'JuniorAdmin'].includes(session.user.role)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const db = getFirestore();
    const articlesRef = collection(db, 'articles');
    const q = query(
      articlesRef,
      where('moderationStatus', '==', 'under_review'),
      orderBy('lastFlaggedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const articles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return res.status(200).json({ articles });
  } catch (error) {
    console.error('Error fetching moderation queue:', error);
    return res.status(500).json({ error: 'Failed to fetch moderation queue' });
  }
}

// Admin endpoint to resolve flags
// POST /api/admin/moderation/:id/resolve
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { action, notes } = req.body;
  const session = await getSession({ req });
  
  if (!session || !['Admin', 'JuniorAdmin'].includes(session.user.role)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const db = getFirestore();
    const articleRef = doc(db, 'articles', id as string);
    
    // Update all pending flags for this article
    const flagsRef = collection(db, 'flags');
    const q = query(
      flagsRef,
      where('articleId', '==', id),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        status: 'reviewed',
        reviewedBy: session.user.id,
        reviewNotes: notes
      });
    });
    
    // Update article status based on action
    if (action === 'reinstate') {
      batch.update(articleRef, {
        moderationStatus: 'reinstated'
      });
    } else if (action === 'remove') {
      batch.update(articleRef, {
        moderationStatus: 'removed',
        isDeleted: true
      });
    }
    
    await batch.commit();
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error resolving flags:', error);
    return res.status(500).json({ error: 'Failed to resolve flags' });
  }
}
\`\`\`

## React Components

\`\`\`tsx
// FlagArticleButton.tsx - Component for the flag button on article pages
import { useState } from 'react';
import {
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { FiFlag } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

interface FlagArticleButtonProps {
  articleId: string;
}

export const FlagArticleButton: React.FC<FlagArticleButtonProps> = ({ articleId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentUser } = useAuth();
  const toast = useToast();
  
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!category) {
      toast({
        title: 'Error',
        description: 'Please select a category',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(\`/api/articles/\${articleId}/flag\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category, reason })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to flag article');
      }
      
      toast({
        title: 'Article Reported',
        description: 'Thank you for helping us maintain quality content',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!currentUser) {
    return null; // Don't show flag button to non-logged in users
  }
  
  return (
    <>
      <IconButton
        aria-label="Report article"
        icon={<FiFlag />}
        variant="ghost"
        size="sm"
        onClick={onOpen}
      />
      
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Report Content</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired mb={4}>
              <FormLabel>Category</FormLabel>
              <Select
                placeholder="Select reason"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="misinformation">Misinformation</option>
                <option value="offensive">Offensive Content</option>
                <option value="plagiarism">Plagiarism</option>
                <option value="spam">Spam</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Additional Details</FormLabel>
              <Textarea
                placeholder="Please provide details about your report"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Submit Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

// ModerationQueue.tsx - Admin component for the moderation queue
import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Flex,
  Spinner,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  useDisclosure
} from '@chakra-ui/react';
import { FiCheck, FiX, FiEye } from 'react-icons/fi';
import { AdminLayout } from '../AdminLayout';
import Link from 'next/link';

interface FlaggedArticle {
  id: string;
  title: string;
  author: string;
  flagCount: number;
  lastFlaggedAt: Date;
}

export default function ModerationQueue() {
  const [articles, setArticles] = useState<FlaggedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<FlaggedArticle | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  useEffect(() => {
    fetchModerationQueue();
  }, []);
  
  const fetchModerationQueue = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/moderation/queue');
      
      if (!response.ok) {
        throw new Error('Failed to fetch moderation queue');
      }
      
      const data = await response.json();
      setArticles(data.articles);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResolve = async (action: 'reinstate' | 'remove') => {
    if (!selectedArticle) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(\`/api/admin/moderation/\${selectedArticle.id}/resolve\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          notes: resolutionNotes
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || \`Failed to \${action} article\`);
      }
      
      toast({
        title: 'Success',
        description: \`Article has been \${action === 'reinstate' ? 'reinstated' : 'removed'}\`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      // Refresh the queue
      fetchModerationQueue();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openResolveModal = (article: FlaggedArticle) => {
    setSelectedArticle(article);
    setResolutionNotes('');
    onOpen();
  };
  
  return (
    <AdminLayout title="Content Moderation">
      <Box mb={6}>
        <Heading size="md" mb={4}>Flagged Content Queue</Heading>
        
        {isLoading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner size="xl" />
          </Flex>
        ) : articles.length === 0 ? (
          <Text>No content currently flagged for review</Text>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>TITLE</Th>
                <Th>AUTHOR</Th>
                <Th>FLAGS</Th>
                <Th>LAST FLAGGED</Th>
                <Th>ACTIONS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {articles.map(article => (
                <Tr key={article.id}>
                  <Td>{article.title}</Td>
                  <Td>{article.author}</Td>
                  <Td>
                    <Badge colorScheme="red">{article.flagCount}</Badge>
                  </Td>
                  <Td>
                    {new Date(article.lastFlaggedAt).toLocaleDateString()}
                  </Td>
                  <Td>
                    <Flex>
                      <Link href={\`/articles/\${article.id}\`} passHref>
                        <Button
                          as="a"
                          size="sm"
                          leftIcon={<FiEye />}
                          mr={2}
                          target="_blank"
                        >
                          View
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        leftIcon={<FiCheck />}
                        onClick={() => openResolveModal(article)}
                      >
                        Resolve
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
      
      {/* Resolution Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Resolve Flagged Content</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              How would you like to resolve the flags for "{selectedArticle?.title}"?
            </Text>
            
            <Textarea
              placeholder="Resolution notes (optional)"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              mb={4}
            />
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              mr={3}
              onClick={() => handleResolve('reinstate')}
              isLoading={isSubmitting}
            >
              Reinstate Content
            </Button>
            <Button
              colorScheme="red"
              onClick={() => handleResolve('remove')}
              isLoading={isSubmitting}
            >
              Remove Content
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
}
\`\`\`

## Integration with Admin Dashboard

\`\`\`tsx
// Add to AdminLayout.tsx
const navItems = [
  { name: 'Dashboard', icon: FiHome, href: '/admin' },
  { name: 'Users', icon: FiUsers, href: '/admin/users' },
  { name: 'Articles', icon: FiFileText, href: '/admin/articles' },
  { 
    name: 'Moderation', 
    icon: FiFlag, 
    href: '/admin/moderation',
    badge: flaggedContentCount > 0 ? flaggedContentCount : undefined
  },
  // ... other items
];
\`\`\`
`;

// Evaluation criteria
const evaluationCriteria = `
Please evaluate the proposed content moderation system for DecentraJournal against these criteria:

1. Code Quality & Best Practices:
   - Does the implementation follow TypeScript/React best practices?
   - Is the code well-structured and maintainable?
   - Are there any potential performance issues?

2. Security Considerations:
   - Are there any security vulnerabilities in the implementation?
   - Is user authentication properly handled?
   - Are there proper permission checks for admin actions?

3. User Experience:
   - Is the flagging process user-friendly?
   - Is the admin moderation queue intuitive?
   - Are there any UX improvements that could be made?

4. Integration with Existing Codebase:
   - Does the implementation align with the existing architecture?
   - Are there any conflicts with existing components or patterns?
   - Does it leverage existing utilities and hooks appropriately?

5. Scalability:
   - Will this solution scale well with thousands of articles?
   - Are there any database or performance optimizations needed?
   - How might this impact system resources?

Please provide a detailed analysis with specific recommendations for improvements.
`;

async function evaluateProposal() {
  try {
    console.log('Evaluating proposed content moderation system...');
    
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: 'You are a senior software architect specializing in React, TypeScript, and Next.js applications. You have extensive experience with content moderation systems and security best practices.' 
        },
        { 
          role: 'user', 
          content: `${proposedSystem}\n\n${evaluationCriteria}` 
        }
      ],
      max_tokens: 2000
    });

    console.log('Evaluation completed successfully!');
    console.log('\n--- EVALUATION RESULTS ---\n');
    console.log(completion.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('Evaluation failed:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    return false;
  }
}

// Run the evaluation
evaluateProposal()
  .then(success => {
    console.log(`\nEvaluation process completed. Success: ${success}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
