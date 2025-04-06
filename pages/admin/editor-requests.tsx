import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Button, 
  Badge, 
  Text, 
  useToast, 
  Container, 
  Flex, 
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns'; // Added import statement

// Interface for editor requests
interface EditorRequest {
  id: string;
  name: string;
  email: string;
  institution: string;
  department: string;
  editorRequestDate: string;
  editorStatus: 'pending' | 'approved' | 'rejected';
}

const EditorRequestsPage: React.FC = () => {
  const [editorRequests, setEditorRequests] = useState<EditorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const toast = useToast();

  // Check if user is admin (this is a simplified check - in a real app, you'd use Firestore rules or a custom claim)
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }

      // In a real application, you would check if the user has admin privileges
      // For now, we'll use a simple email check for demonstration purposes
      const adminEmails = ['admin@researka.org', 'dom123dxb@gmail.com', 'dominic@dominic.ac'];
      setIsAdmin(adminEmails.includes(currentUser.email || ''));
    };

    checkAdminStatus();
  }, [currentUser]);

  // Fetch editor requests
  useEffect(() => {
    const fetchEditorRequests = async () => {
      if (!isAdmin || !db) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'users'),
          where('editorStatus', '==', 'pending')
        );

        const querySnapshot = await getDocs(q);
        const requests: EditorRequest[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          requests.push({
            id: doc.id,
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            institution: data.institution || 'Not specified',
            department: data.department || 'Not specified',
            editorRequestDate: data.editorRequestDate || new Date().toISOString(),
            editorStatus: data.editorStatus || 'pending'
          });
        });

        setEditorRequests(requests);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching editor requests:', err);
        setError('Failed to load editor requests. Please try again later.');
        setLoading(false);
      }
    };

    fetchEditorRequests();
  }, [isAdmin]);

  // Handle approval or rejection
  const handleEditorRequestAction = async (userId: string, action: 'approved' | 'rejected') => {
    if (!db) {
      toast({
        title: 'Error',
        description: 'Database not initialized',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      // Update the user document
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        editorStatus: action,
        editorStatusUpdatedAt: new Date().toISOString(),
        editorStatusUpdatedBy: currentUser?.uid || 'unknown',
        isEditor: action === 'approved'
      });

      // Update local state
      setEditorRequests(prevRequests => 
        prevRequests.filter(request => request.id !== userId)
      );

      toast({
        title: `Request ${action}`,
        description: `The editor request has been ${action}.`,
        status: action === 'approved' ? 'success' : 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error(`Error ${action} editor request:`, err);
      toast({
        title: 'Error',
        description: `Failed to ${action} the editor request. Please try again.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!isAdmin) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" variant="solid" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page. Please contact an administrator if you believe this is an error.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Editor Requests</Heading>

      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : editorRequests.length === 0 ? (
        <Box p={6} bg="gray.50" borderRadius="md" textAlign="center">
          <Text fontSize="lg">No pending editor requests at this time.</Text>
        </Box>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Institution</Th>
                <Th>Department</Th>
                <Th>Request Date</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {editorRequests.map((request) => (
                <Tr key={request.id}>
                  <Td>{request.name}</Td>
                  <Td>{request.email}</Td>
                  <Td>{request.institution}</Td>
                  <Td>{request.department}</Td>
                  <Td>
                    {format(new Date(request.editorRequestDate), 'MMM d, yyyy')}
                  </Td>
                  <Td>
                    <Badge colorScheme={
                      request.editorStatus === 'approved' ? 'green' : 
                      request.editorStatus === 'rejected' ? 'red' : 'yellow'
                    }>
                      {request.editorStatus}
                    </Badge>
                  </Td>
                  <Td>
                    <Flex gap={2}>
                      <Button 
                        size="sm" 
                        colorScheme="green" 
                        onClick={() => handleEditorRequestAction(request.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        colorScheme="red" 
                        onClick={() => handleEditorRequestAction(request.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Container>
  );
};

export default EditorRequestsPage;
