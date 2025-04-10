"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  Text,
  Badge,
  Stack,
  HStack,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  SkeletonText,
  useToast,
  useDisclosure
} from '@chakra-ui/react';
import { FiArrowLeft, FiFlag, FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import AdminLayout from '../../../../components/admin/AdminLayout';
import { getFirebaseFirestore } from '../../../../config/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { Flag, ModerationStatus, FlaggedArticle } from '../../../../types/moderation';
import ModerationActionModal from '../../../../components/moderation/ModerationActionModal';
import { useAuth } from '../../../../hooks/useAuth';

const ArticleModeration = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const { user } = useAuth();
  const [article, setArticle] = useState<FlaggedArticle | null>(null);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchArticleData(id);
    }
  }, [id]);

  const fetchArticleData = async (articleId: string) => {
    try {
      setIsLoading(true);
      const db = getFirebaseFirestore();
      
      if (!db) {
        throw new Error('Firestore is not initialized');
      }

      // Get article data
      const articleRef = doc(db, 'articles', articleId);
      const articleSnap = await getDoc(articleRef);
      
      if (!articleSnap.exists()) {
        toast({
          title: 'Article not found',
          description: 'The requested article could not be found',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        router.push('/admin/moderation');
        return;
      }
      
      const articleData = articleSnap.data();
      setArticle({
        id: articleSnap.id,
        title: articleData.title || 'Untitled Article',
        author: articleData.authorId || 'Unknown',
        authorId: articleData.authorId || 'Unknown',
        abstract: articleData.abstract,
        content: articleData.content,
        category: articleData.category,
        keywords: articleData.keywords,
        views: articleData.views,
        date: articleData.date,
        authorName: articleData.authorName,
        flagCount: flags.length || 0,
        moderationStatus: articleData.moderationStatus || 'active',
        lastFlaggedAt: articleData.lastFlaggedAt || new Date(),
        createdAt: articleData.createdAt,
        moderatedBy: articleData.moderatedBy,
        moderatedAt: articleData.moderatedAt,
        moderationNotes: articleData.moderationNotes
      });
      
      // Get flags for this article
      const flagsRef = collection(db, 'flags');
      const flagsQuery = query(
        flagsRef,
        where('articleId', '==', articleId),
        orderBy('timestamp', 'desc')
      );
      
      const flagsSnapshot = await getDocs(flagsQuery);
      const flagsData = flagsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Flag[];
      
      setFlags(flagsData);
    } catch (error) {
      console.error('Error fetching article data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load article data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerationAction = async (action: 'approve' | 'reject', notes: string) => {
    if (!article) return;
    
    try {
      const db = getFirebaseFirestore();
      
      if (!db) {
        throw new Error('Firestore is not initialized');
      }
      
      const articleRef = doc(db, 'articles', article.id);
      const newStatus: ModerationStatus = action === 'approve' ? 'active' : 'removed';
      
      await updateDoc(articleRef, {
        moderationStatus: newStatus,
        moderationNotes: notes,
        moderatedBy: user?.uid,
        moderatedAt: new Date()
      });
      
      // Update flags status
      for (const flag of flags) {
        const flagRef = doc(db, 'flags', flag.id);
        await updateDoc(flagRef, {
          status: action === 'approve' ? 'rejected' : 'accepted',
          resolvedBy: user?.uid,
          resolvedAt: new Date()
        });
      }
      
      toast({
        title: action === 'approve' ? 'Article Approved' : 'Article Removed',
        description: action === 'approve' 
          ? 'The article has been approved and is now active' 
          : 'The article has been removed from the platform',
        status: action === 'approve' ? 'success' : 'info',
        duration: 5000,
        isClosable: true
      });
      
      // Refresh the data
      fetchArticleData(article.id);
      onClose();
    } catch (error) {
      console.error('Error updating article:', error);
      toast({
        title: 'Error',
        description: 'Failed to update article status',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  // Group flags by category
  const flagsByCategory: Record<string, Flag[]> = {};
  flags.forEach(flag => {
    if (!flagsByCategory[flag.category]) {
      flagsByCategory[flag.category] = [];
    }
    flagsByCategory[flag.category].push(flag);
  });

  return (
    <AdminLayout title="Article Moderation">
      <Container maxW="container.xl" py={4}>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="outline"
          mb={6}
          onClick={() => router.push('/admin/moderation')}
        >
          Back to Moderation Queue
        </Button>
        
        {isLoading ? (
          <Box>
            <Skeleton height="50px" width="80%" mb={4} />
            <SkeletonText mt={2} noOfLines={4} spacing={4} />
            <Skeleton height="200px" mt={6} />
          </Box>
        ) : article ? (
          <Box>
            <Flex justify="space-between" align="flex-start" mb={6} wrap="wrap" gap={4}>
              <Box>
                <Heading as="h1" size="xl" mb={2}>
                  {article.title}
                </Heading>
                <HStack spacing={4} mb={2}>
                  <Badge 
                    colorScheme={
                      article.moderationStatus === 'active' ? 'green' : 
                      article.moderationStatus === 'under_review' ? 'yellow' : 
                      'red'
                    }
                    fontSize="md"
                    px={2}
                    py={1}
                  >
                    {article.moderationStatus?.replace('_', ' ') || 'Unknown Status'}
                  </Badge>
                  <Text>
                    {flags.length} {flags.length === 1 ? 'flag' : 'flags'}
                  </Text>
                </HStack>
                <Text color="gray.600">
                  ID: {article.id}
                </Text>
              </Box>
              
              {article.moderationStatus === 'under_review' && (
                <HStack spacing={4}>
                  <Button
                    leftIcon={<FiCheckCircle />}
                    colorScheme="green"
                    onClick={onOpen}
                  >
                    Approve Article
                  </Button>
                  <Button
                    leftIcon={<FiXCircle />}
                    colorScheme="red"
                    onClick={onOpen}
                  >
                    Remove Article
                  </Button>
                </HStack>
              )}
            </Flex>
            
            <Tabs variant="enclosed" colorScheme="blue">
              <TabList>
                <Tab>Article Details</Tab>
                <Tab>
                  Flags ({flags.length})
                </Tab>
                <Tab>Moderation History</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel>
                  <Stack spacing={6}>
                    <Box>
                      <Heading as="h3" size="md" mb={2}>
                        Abstract
                      </Heading>
                      <Text>{article.abstract || 'No abstract available'}</Text>
                    </Box>
                    
                    <Box>
                      <Heading as="h3" size="md" mb={2}>
                        Author Information
                      </Heading>
                      <Text>Author ID: {article.authorId || 'Unknown'}</Text>
                      {article.authorName && <Text>Name: {article.authorName}</Text>}
                    </Box>
                    
                    <Box>
                      <Heading as="h3" size="md" mb={2}>
                        Publication Details
                      </Heading>
                      <Text>Published: {article.date ? format(new Date(article.date), 'PPP') : 'Unknown'}</Text>
                      <Text>Views: {article.views || 0}</Text>
                      <Text>Category: {article.category || 'Uncategorized'}</Text>
                    </Box>
                    
                    <Box>
                      <Heading as="h3" size="md" mb={2}>
                        Keywords
                      </Heading>
                      <Flex gap={2} flexWrap="wrap">
                        {article.keywords?.map((keyword: string) => (
                          <Badge key={keyword} colorScheme="blue">
                            {keyword}
                          </Badge>
                        )) || <Text>No keywords</Text>}
                      </Flex>
                    </Box>
                    
                    <Box>
                      <Heading as="h3" size="md" mb={2}>
                        Actions
                      </Heading>
                      <HStack spacing={4}>
                        <Button 
                          onClick={() => window.open(`/articles/${article.id}`, '_blank')}
                          colorScheme="blue"
                        >
                          View Public Page
                        </Button>
                      </HStack>
                    </Box>
                  </Stack>
                </TabPanel>
                
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Heading as="h3" size="md">
                      <Flex align="center" gap={2}>
                        <FiFlag />
                        <span>Reported Issues</span>
                      </Flex>
                    </Heading>
                    
                    {Object.entries(flagsByCategory).length === 0 ? (
                      <Text>No flags found for this article</Text>
                    ) : (
                      Object.entries(flagsByCategory).map(([category, categoryFlags]) => (
                        <Box key={category} p={4} borderWidth="1px" borderRadius="md">
                          <Flex justify="space-between" align="center" mb={3}>
                            <Badge colorScheme={
                              category === 'misinformation' ? 'red' :
                              category === 'offensive' ? 'orange' :
                              category === 'plagiarism' ? 'purple' :
                              category === 'spam' ? 'blue' :
                              'gray'
                            } px={2} py={1} fontSize="md">
                              {category}
                            </Badge>
                            <Text>{categoryFlags.length} {categoryFlags.length === 1 ? 'report' : 'reports'}</Text>
                          </Flex>
                          
                          <Divider mb={3} />
                          
                          <Stack spacing={4}>
                            {categoryFlags.map((flag, index) => (
                              <Box key={index} p={3} bg="gray.50" borderRadius="md">
                                <Text fontWeight="bold">Report #{index + 1}</Text>
                                {flag.reason ? (
                                  <Text mt={2}>{flag.reason}</Text>
                                ) : (
                                  <Text color="gray.500" mt={2}>No additional details provided</Text>
                                )}
                                <Text fontSize="sm" color="gray.500" mt={2}>
                                  Reported by: {flag.reportedBy}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  Date: {flag.timestamp ? format(new Date(flag.timestamp.seconds * 1000), 'PPP') : 'Unknown'}
                                </Text>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      ))
                    )}
                  </VStack>
                </TabPanel>
                
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Heading as="h3" size="md">
                      <Flex align="center" gap={2}>
                        <FiAlertTriangle />
                        <span>Moderation History</span>
                      </Flex>
                    </Heading>
                    
                    {article.moderatedAt ? (
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Date</Th>
                            <Th>Action</Th>
                            <Th>Moderator</Th>
                            <Th>Notes</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          <Tr>
                            <Td>{format(new Date(article.moderatedAt.seconds * 1000), 'PPP')}</Td>
                            <Td>
                              <Badge colorScheme={article.moderationStatus === 'active' ? 'green' : 'red'}>
                                {article.moderationStatus === 'active' ? 'Approved' : 'Removed'}
                              </Badge>
                            </Td>
                            <Td>{article.moderatedBy || 'Unknown'}</Td>
                            <Td>{article.moderationNotes || 'No notes'}</Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    ) : (
                      <Text>No moderation actions have been taken on this article yet.</Text>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        ) : (
          <Box textAlign="center" py={10}>
            <Heading as="h2" size="lg" mb={4}>
              Article Not Found
            </Heading>
            <Text mb={6}>
              The article you are looking for does not exist or has been removed.
            </Text>
            <Button 
              colorScheme="blue" 
              onClick={() => router.push('/admin/moderation')}
            >
              Back to Moderation Queue
            </Button>
          </Box>
        )}
      </Container>
      
      {article && (
        <ModerationActionModal
          isOpen={isOpen}
          onClose={onClose}
          article={{
            id: article.id,
            title: article.title,
            author: article.author,
            authorId: article.authorId,
            flagCount: flags.length,
            moderationStatus: article.moderationStatus || 'active',
            lastFlaggedAt: article.lastFlaggedAt || new Date(),
            flags
          }}
          onAction={handleModerationAction}
        />
      )}
    </AdminLayout>
  );
};

export default ArticleModeration;
