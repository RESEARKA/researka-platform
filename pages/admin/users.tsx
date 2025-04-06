import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Spinner,
  Center,
  useToast,
  Tooltip,
  Checkbox,
  Flex,
  ButtonGroup
} from '@chakra-ui/react';
import { 
  FiSearch, 
  FiMoreVertical, 
  FiEdit, 
  FiTrash2,
  FiUserCheck,
  FiUserX,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  getFirestore, 
  writeBatch, 
  where 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { createLogger, LogCategory } from '../../utils/logger';

const logger = createLogger('admin-users');

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
  articles?: number;
  reviews?: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [newRole, setNewRole] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(50);
  
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isDeactivateOpen, onOpen: onDeactivateOpen, onClose: onDeactivateClose } = useDisclosure();
  
  const toast = useToast();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);
  
  const fetchUsers = async () => {
    try {
      // Make sure we have a valid Firestore instance
      const firestore = db || getFirestore();
      
      if (!firestore) {
        logger.error('Firestore not initialized', {
          category: LogCategory.ERROR
        });
        return;
      }
      
      // Create a query that filters out deleted users
      const usersCollection = collection(firestore, 'users');
      const usersQuery = query(usersCollection, where('isDeleted', '!=', true));
      
      logger.info('Fetching users with query', {
        category: LogCategory.DATA,
        context: { collectionPath: 'users', excludeDeleted: true }
      });
      
      try {
        const usersSnapshot = await getDocs(usersQuery);
        
        if (usersSnapshot.empty) {
          logger.info('No users found in collection', {
            category: LogCategory.DATA
          });
          setUsers([]);
          setFilteredUsers([]);
          setIsLoading(false);
          return;
        }
        
        logger.info(`Found ${usersSnapshot.size} users`, {
          category: LogCategory.DATA
        });
        
        const usersData: User[] = [];
        
        usersSnapshot.forEach(doc => {
          try {
            const userData = doc.data();
            
            // Safely extract data with fallbacks for all fields
            const email = userData.email || '';
            const displayName = userData.displayName || '';
            const role = userData.role || 'User';
            const isActive = userData.isActive !== false; // Default to true if not specified
            const articles = typeof userData.articleCount === 'number' ? userData.articleCount : 0;
            const reviews = typeof userData.reviewCount === 'number' ? userData.reviewCount : 0;
            
            // Handle date fields safely
            let createdAtDate = new Date();
            let lastLoginDate = new Date();
            
            try {
              // Handle Firestore Timestamp objects
              if (userData.createdAt) {
                if (typeof userData.createdAt.toDate === 'function') {
                  createdAtDate = userData.createdAt.toDate();
                } else if (userData.createdAt instanceof Date) {
                  createdAtDate = userData.createdAt;
                } else if (userData.createdAt._seconds) {
                  // Handle serialized Firestore timestamps
                  createdAtDate = new Date(userData.createdAt._seconds * 1000);
                }
              }
              
              if (userData.lastLogin) {
                if (typeof userData.lastLogin.toDate === 'function') {
                  lastLoginDate = userData.lastLogin.toDate();
                } else if (userData.lastLogin instanceof Date) {
                  lastLoginDate = userData.lastLogin;
                } else if (userData.lastLogin._seconds) {
                  // Handle serialized Firestore timestamps
                  lastLoginDate = new Date(userData.lastLogin._seconds * 1000);
                }
              }
            } catch (dateError) {
              logger.error('Error processing date fields', {
                context: { 
                  error: JSON.stringify(dateError, Object.getOwnPropertyNames(dateError)),
                  docId: doc.id,
                  createdAt: JSON.stringify(userData.createdAt),
                  lastLogin: JSON.stringify(userData.lastLogin)
                },
                category: LogCategory.ERROR
              });
            }
            
            // Add the processed user data to our array
            usersData.push({
              id: doc.id,
              email,
              displayName,
              role,
              createdAt: createdAtDate,
              lastLogin: lastLoginDate,
              isActive,
              articles,
              reviews
            });
          } catch (docError) {
            logger.error('Error processing user document', {
              context: { 
                error: JSON.stringify(docError, Object.getOwnPropertyNames(docError)), 
                docId: doc.id,
                userData: JSON.stringify(doc.data(), (_, value) => {
                  // Handle circular references and special objects
                  if (typeof value === 'object' && value !== null) {
                    try {
                      // Try to safely stringify special objects
                      if (value.toDate) {
                        return `Timestamp: ${value.toDate().toISOString()}`;
                      }
                    } catch (e) {
                      return `[Unstringifiable Object: ${typeof value}]`;
                    }
                  }
                  return value;
                })
              },
              category: LogCategory.ERROR
            });
          }
        });
        
        logger.info(`Processed ${usersData.length} users successfully`, {
          category: LogCategory.DATA
        });
        
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (queryError) {
        logger.error('Error executing users query', {
          context: { 
            error: JSON.stringify(queryError, Object.getOwnPropertyNames(queryError))
          },
          category: LogCategory.ERROR
        });
        toast({
          title: 'Error fetching users',
          description: 'There was a problem loading the user data. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      logger.error('Unexpected error in fetchUsers', {
        context: { 
          error: JSON.stringify(error, Object.getOwnPropertyNames(error))
        },
        category: LogCategory.ERROR
      });
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    onEditOpen();
  };
  
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setActionReason('');
    onDeleteOpen();
  };
  
  const handleDeactivateUser = (user: User) => {
    setSelectedUser(user);
    setActionReason('');
    onDeactivateOpen();
  };
  
  const confirmEditUser = async () => {
    if (!selectedUser || !db) return;
    
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date()
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id ? { ...user, role: newRole } : user
        )
      );
      
      toast({
        title: 'Success',
        description: `User role updated to ${newRole}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      logger.info('User role updated', {
        context: { userId: selectedUser.id, newRole },
        category: LogCategory.DATA
      });
      
      onEditClose();
    } catch (error) {
      logger.error('Error updating user role', {
        context: { error, userId: selectedUser.id },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error',
        description: 'Failed to update user role. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const confirmDeleteUser = async () => {
    if (!selectedUser || !db) return;
    
    try {
      // In a real application, you might want to:
      // 1. Archive the user data instead of deleting it
      // 2. Delete or reassign the user's content
      // 3. Log the deletion for compliance purposes
      
      // For now, we'll just update the user record to mark it as deleted
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
        deletedReason: actionReason,
        updatedAt: new Date()
      });
      
      // Remove from local state
      setUsers(prevUsers => 
        prevUsers.filter(user => user.id !== selectedUser.id)
      );
      
      // Also update filtered users
      setFilteredUsers(prevFilteredUsers => 
        prevFilteredUsers.filter(user => user.id !== selectedUser.id)
      );
      
      toast({
        title: 'Success',
        description: 'User has been deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      logger.info('User marked as deleted', {
        context: { userId: selectedUser.id, reason: actionReason },
        category: LogCategory.DATA
      });
      
      onDeleteClose();
    } catch (error) {
      logger.error('Error deleting user', {
        context: { error, userId: selectedUser.id },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const confirmDeactivateUser = async () => {
    if (!selectedUser || !db) return;
    
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      const newActiveState = !selectedUser.isActive;
      
      await updateDoc(userRef, {
        isActive: newActiveState,
        updatedAt: new Date(),
        ...(newActiveState ? {} : { deactivatedReason: actionReason, deactivatedAt: new Date() })
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id ? { ...user, isActive: newActiveState } : user
        )
      );
      
      toast({
        title: 'Success',
        description: `User has been ${newActiveState ? 'activated' : 'deactivated'}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      logger.info(`User ${newActiveState ? 'activated' : 'deactivated'}`, {
        context: { userId: selectedUser.id, reason: actionReason },
        category: LogCategory.DATA
      });
      
      onDeactivateClose();
    } catch (error) {
      logger.error(`Error ${selectedUser.isActive ? 'deactivating' : 'activating'} user`, {
        context: { error, userId: selectedUser.id },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error',
        description: `Failed to ${selectedUser.isActive ? 'deactivate' : 'activate'} user. Please try again.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Bulk actions for selected users
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0 || !db) return;
    
    try {
      // Create a batch to perform multiple operations
      const batch = writeBatch(db);
      
      // Process each selected user
      for (const userId of selectedUsers) {
        const userRef = doc(db, 'users', userId);
        
        if (action === 'activate') {
          batch.update(userRef, {
            isActive: true,
            updatedAt: new Date()
          });
        } else if (action === 'deactivate') {
          batch.update(userRef, {
            isActive: false,
            deactivatedAt: new Date(),
            updatedAt: new Date()
          });
        } else if (action === 'delete') {
          batch.update(userRef, {
            isDeleted: true,
            isActive: false,
            deletedAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
      
      // Commit the batch
      await batch.commit();
      
      // Update local state
      if (action === 'delete') {
        setUsers(prevUsers => 
          prevUsers.filter(user => !selectedUsers.includes(user.id))
        );
        setFilteredUsers(prevFilteredUsers => 
          prevFilteredUsers.filter(user => !selectedUsers.includes(user.id))
        );
      } else {
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (selectedUsers.includes(user.id)) {
              return {
                ...user,
                isActive: action === 'activate'
              };
            }
            return user;
          })
        );
      }
      
      // Clear selection
      setSelectedUsers([]);
      
      toast({
        title: 'Success',
        description: `Bulk action completed: ${selectedUsers.length} users ${action}d`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      logger.info(`Bulk ${action} completed`, {
        context: { count: selectedUsers.length },
        category: LogCategory.DATA
      });
      
    } catch (error) {
      logger.error(`Error performing bulk ${action}`, {
        context: { error },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error',
        description: `Failed to ${action} users. Please try again.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Handle select all users on current page
  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      const currentPageUserIds = currentUsers.map(user => user.id);
      setSelectedUsers(prevSelected => {
        const uniqueIds = new Set([...prevSelected, ...currentPageUserIds]);
        return Array.from(uniqueIds);
      });
    } else {
      // Deselect only users on the current page
      const currentPageUserIds = new Set(currentUsers.map(user => user.id));
      setSelectedUsers(prevSelected => 
        prevSelected.filter(id => !currentPageUserIds.has(id))
      );
    }
  };
  
  // Handle select individual user
  const handleSelectUser = (userId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };
  
  // Check if all users on current page are selected
  const areAllCurrentUsersSelected = currentUsers.length > 0 && 
    currentUsers.every(user => selectedUsers.includes(user.id));
  
  return (
    <AdminLayout title="User Management">
      <Box mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search users by name or email" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </Box>
      
      {isLoading ? (
        <Center p={8}>
          <Spinner size="xl" />
        </Center>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>
                  <Checkbox 
                    isChecked={areAllCurrentUsersSelected} 
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  >
                    Select All
                  </Checkbox>
                </Th>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                <Th>Last Login</Th>
                <Th>Content</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map(user => (
                  <Tr key={user.id}>
                    <Td>
                      <Checkbox 
                        isChecked={selectedUsers.includes(user.id)} 
                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      />
                    </Td>
                    <Td>
                      <Box>
                        <Text fontWeight="medium">{user.displayName || 'Unnamed User'}</Text>
                        <Text fontSize="sm" color="gray.500">{user.email}</Text>
                      </Box>
                    </Td>
                    <Td>
                      <Badge colorScheme={
                        user.role === 'Admin' ? 'red' :
                        user.role === 'Editor' ? 'purple' :
                        user.role === 'Reviewer' ? 'blue' :
                        'gray'
                      }>
                        {user.role}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={user.isActive ? 'green' : 'red'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>{user.createdAt.toLocaleDateString()}</Td>
                    <Td>{user.lastLogin.toLocaleDateString()}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label="Articles">
                          <Badge colorScheme="blue">{user.articles || 0}</Badge>
                        </Tooltip>
                        <Tooltip label="Reviews">
                          <Badge colorScheme="green">{user.reviews || 0}</Badge>
                        </Tooltip>
                      </HStack>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem 
                            icon={<FiEdit />} 
                            onClick={() => handleEditUser(user)}
                          >
                            Edit Role
                          </MenuItem>
                          <MenuItem 
                            icon={user.isActive ? <FiUserX /> : <FiUserCheck />} 
                            onClick={() => handleDeactivateUser(user)}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'} User
                          </MenuItem>
                          <MenuItem 
                            icon={<FiTrash2 />} 
                            color="red.500"
                            onClick={() => handleDeleteUser(user)}
                          >
                            Delete User
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={8} textAlign="center">
                    No users found
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
          <Flex justifyContent="space-between" mt={4}>
            <ButtonGroup>
              <Button 
                onClick={() => handleBulkAction('activate')} 
                colorScheme="green"
              >
                Activate
              </Button>
              <Button 
                onClick={() => handleBulkAction('deactivate')} 
                colorScheme="orange"
              >
                Deactivate
              </Button>
              <Button 
                onClick={() => handleBulkAction('delete')} 
                colorScheme="red"
              >
                Delete
              </Button>
            </ButtonGroup>
            <Box>
              <Text>
                Showing {currentUsers.length} of {filteredUsers.length} users
              </Text>
              <ButtonGroup>
                <Button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft />
                </Button>
                <Button>
                  Page {currentPage} of {totalPages}
                </Button>
                <Button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                >
                  <FiChevronRight />
                </Button>
              </ButtonGroup>
            </Box>
          </Flex>
        </Box>
      )}
      
      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit User Role</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select 
                  value={newRole} 
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="User">User</option>
                  <option value="Reviewer">Reviewer</option>
                  <option value="Editor">Editor</option>
                  <option value="Admin">Admin</option>
                </Select>
              </FormControl>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={confirmEditUser}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Delete User Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Are you sure you want to delete this user? This action cannot be undone.
            </Text>
            {selectedUser && (
              <Box mb={4}>
                <Text fontWeight="bold">{selectedUser.displayName || 'Unnamed User'}</Text>
                <Text>{selectedUser.email}</Text>
              </Box>
            )}
            <FormControl>
              <FormLabel>Reason for deletion</FormLabel>
              <Textarea 
                value={actionReason} 
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Please provide a reason for this action"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDeleteUser}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Deactivate User Modal */}
      <Modal isOpen={isDeactivateOpen} onClose={onDeactivateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedUser?.isActive ? 'Deactivate' : 'Activate'} User
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              {selectedUser?.isActive 
                ? 'Are you sure you want to deactivate this user? They will not be able to log in or use the platform until reactivated.'
                : 'Are you sure you want to reactivate this user? They will regain access to the platform.'
              }
            </Text>
            {selectedUser && (
              <Box mb={4}>
                <Text fontWeight="bold">{selectedUser.displayName || 'Unnamed User'}</Text>
                <Text>{selectedUser.email}</Text>
              </Box>
            )}
            {selectedUser?.isActive && (
              <FormControl>
                <FormLabel>Reason for deactivation</FormLabel>
                <Textarea 
                  value={actionReason} 
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Please provide a reason for this action"
                />
              </FormControl>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeactivateClose}>
              Cancel
            </Button>
            <Button 
              colorScheme={selectedUser?.isActive ? 'orange' : 'green'} 
              onClick={confirmDeactivateUser}
            >
              {selectedUser?.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
};

export default UserManagement;
