import { useState, useEffect, useMemo } from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Select, Input, Button, Flex, Badge, Text,
  Spinner, useToast, Code
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '../../config/firebase';
import { AdminActionType, ADMIN_LOGS_COLLECTION } from '../../utils/adminLogger';
import { useAuth } from '../../hooks/useAuth';

// Subcomponents for better organization
const SafeJsonDisplay = ({ data }: { data: Record<string, any> }) => {
  const jsonString = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return 'Unable to display details';
    }
  }, [data]);

  return <Code p={2} fontSize="sm" noOfLines={2}>{jsonString}</Code>;
};

interface AdminLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminRole: 'Admin' | 'JuniorAdmin';
  actionType: AdminActionType;
  targetId?: string;
  targetType: 'user' | 'article' | 'flag' | 'setting';
  details: Record<string, any>;
  timestamp: Timestamp;
  ipAddress?: string;
}

const ITEMS_PER_PAGE = 25;

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [adminFilter, setAdminFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const toast = useToast();
  const router = useRouter();
  const { user } = useAuth();

  // Authorization check
  useEffect(() => {
    if (!user) {
      return; // Wait for auth to initialize
    }
    
    if (user.role !== 'Admin' && user.role !== 'JuniorAdmin') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this page',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      router.push('/admin');
    }
  }, [user, router, toast]);

  // Fetch logs with filtering
  useEffect(() => {
    if (user?.role === 'Admin' || user?.role === 'JuniorAdmin') {
      fetchLogs();
    }
  }, [actionFilter, adminFilter, page, user]);

  const fetchLogs = async () => {
    // Rate limiting
    if (lastRefresh && Date.now() - lastRefresh.getTime() < 2000) {
      toast({
        title: 'Please wait',
        description: 'Refreshing too frequently',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    setLastRefresh(new Date());
    setLoading(true);
    
    try {
      const db = getFirebaseFirestore();
      if (!db) throw new Error('Firestore not initialized');
      
      let logsQuery = query(
        collection(db, ADMIN_LOGS_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(ITEMS_PER_PAGE)
      );
      
      // Apply filters
      if (actionFilter !== 'all') {
        logsQuery = query(logsQuery, where('actionType', '==', actionFilter));
      }
      
      if (adminFilter) {
        logsQuery = query(logsQuery, where('adminEmail', '==', adminFilter));
      }
      
      const snapshot = await getDocs(logsQuery);
      const logData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminLog[];
      
      setLogs(logData);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? `Failed to load logs: ${error.message}` 
          : 'Failed to load admin activity logs',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination
  const handleNextPage = () => {
    setPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    setPage(prev => Math.max(1, prev - 1));
  };

  if (!user) {
    return <AdminLayout title="Admin Activity Logs"><Spinner /></AdminLayout>;
  }

  return (
    <AdminLayout title="Admin Activity Logs">
      <Box p={4}>
        <Heading mb={6}>Admin Activity Logs</Heading>
        
        {/* Filter controls */}
        <Flex mb={6} gap={4} flexWrap="wrap">
          <Select 
            placeholder="Filter by action" 
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            width="auto"
            minW="200px"
          >
            <option value="all">All Actions</option>
            {Object.values(AdminActionType).map(actionType => (
              <option key={actionType} value={actionType}>
                {actionType.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
          
          <Input
            placeholder="Filter by admin email"
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
            width="auto"
            minW="250px"
          />
          
          <Button 
            onClick={fetchLogs} 
            colorScheme="blue"
            isLoading={loading}
            loadingText="Refreshing"
          >
            Refresh
          </Button>
        </Flex>
        
        {/* Logs table */}
        {loading ? (
          <Flex justify="center" align="center" minH="300px" direction="column" gap={4}>
            <Spinner size="xl" />
            <Text>Loading activity logs...</Text>
          </Flex>
        ) : logs.length > 0 ? (
          <>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Timestamp</Th>
                  <Th>Admin</Th>
                  <Th>Action</Th>
                  <Th>Target</Th>
                  <Th>Details</Th>
                </Tr>
              </Thead>
              <Tbody>
                {logs.map(log => (
                  <Tr key={log.id}>
                    <Td>
                      {log.timestamp?.toDate 
                        ? format(log.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss')
                        : 'Pending'}
                    </Td>
                    <Td>
                      {log.adminEmail}
                      <Badge ml={2} colorScheme={log.adminRole === 'Admin' ? 'red' : 'orange'}>
                        {log.adminRole}
                      </Badge>
                    </Td>
                    <Td>{log.actionType.replace(/_/g, ' ')}</Td>
                    <Td>{`${log.targetType}: ${log.targetId || 'N/A'}`}</Td>
                    <Td>
                      <SafeJsonDisplay data={log.details} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            
            {/* Pagination controls */}
            <Flex justify="space-between" mt={4}>
              <Button 
                onClick={handlePrevPage} 
                isDisabled={page === 1}
              >
                Previous
              </Button>
              <Text>Page {page}</Text>
              <Button 
                onClick={handleNextPage} 
                isDisabled={logs.length < ITEMS_PER_PAGE}
              >
                Next
              </Button>
            </Flex>
          </>
        ) : (
          <Flex 
            justify="center" 
            align="center" 
            minH="300px" 
            direction="column" 
            gap={4}
            p={8}
            borderWidth="1px"
            borderRadius="lg"
            bg="gray.50"
          >
            <Text fontSize="xl">No activity logs found</Text>
            <Text>
              {adminFilter 
                ? `No logs found for admin: ${adminFilter}` 
                : actionFilter !== 'all' 
                  ? `No logs found for action type: ${actionFilter}` 
                  : 'No admin activity has been logged yet'
              }
            </Text>
          </Flex>
        )}
      </Box>
    </AdminLayout>
  );
};

export default AdminActivityLogs;
