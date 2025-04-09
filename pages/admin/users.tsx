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
  ButtonGroup,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { 
  FiSearch, 
  FiMoreVertical, 
  FiEdit, 
  FiTrash2,
  FiUserCheck,
  FiUserX,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle
} from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { createLogger, LogCategory } from '../../utils/logger';

const logger = createLogger('admin-users');

// User type definition
interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
  articles?: number;
  reviews?: number;
}

// User role type
type UserRole = 'User' | 'Reviewer' | 'JuniorAdmin' | 'Editor' | 'Admin';

const UserManagement: React.FC = () => {
  // State for API errors
  const [apiError, setApiError] = useState<string | null>(null);

  // State for user management
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('User');
  const [actionReason, setActionReason] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(50);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
      setIsLoading(true);
      setApiError(null); // Clear any previous errors
      
      if (!db) {
        throw new Error('Firestore is not initialized');
      }
      
      const usersCollection = collection(db, 'users');
      
      // Use a safer query that doesn't rely on the isDeleted field existing
      // This prevents errors if some documents don't have this field
      const usersQuery = query(usersCollection);
      const usersSnapshot = await getDocs(usersQuery);
      
      const usersData: User[] = usersSnapshot.docs
        .map(doc => {
          const data = doc.data();
          
          // Skip documents that are marked as deleted
          if (data.isDeleted === true) {
            return null;
          }
          
          // Handle potential type conversion issues with dates
          let createdAt = new Date();
          try {
            createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : 
                       (data.createdAt ? new Date(data.createdAt) : new Date());
          } catch (e) {
            logger.warn('Error converting createdAt date', { context: { docId: doc.id } });
          }
          
          let lastLogin = null;
          try {
            lastLogin = data.lastLogin?.toDate ? data.lastLogin.toDate() : 
                       (data.lastLogin ? new Date(data.lastLogin) : null);
          } catch (e) {
            logger.warn('Error converting lastLogin date', { context: { docId: doc.id } });
          }
          
          return {
            id: doc.id,
            email: data.email || '',
            displayName: data.displayName || '',
            role: data.role || 'User',
            isActive: data.isActive !== false, // Default to true if not specified
            createdAt: createdAt,
            lastLogin: lastLogin,
            articles: data.articleCount || 0,
            reviews: data.reviewCount || 0
          } as User;
        })
        .filter((user): user is User => user !== null); // Type guard to filter out null values
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      logger.error('Error fetching users', {
        context: { error },
        category: LogCategory.ERROR
      });
      
      // Set API error instead of showing multiple toasts
      setApiError('Failed to load users');
      
      // Clear users data on error
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
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
    if (!selectedUser || !db || !auth) return;
    
    try {
      setIsLoading(true);
      
      // Get the current user's ID token for authentication
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to perform this action');
      }
      
      const idToken = await currentUser.getIdToken();
      
      // Call the update-role API
      const response = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: selectedRole
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role');
      }
      
      // Update the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? { ...user, role: selectedRole } 
            : user
        )
      );
      
      setFilteredUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? { ...user, role: selectedRole } 
            : user
        )
      );
      
      toast({
        title: 'Success',
        description: `User role updated to ${selectedRole}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onEditClose();
    } catch (error) {
      logger.error('Error updating user role', {
        context: { error, userId: selectedUser.id },
        category: LogCategory.ERROR
      });
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user role',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const confirmDeleteUser = async () => {
    if (!selectedUser || !db) return;
    
    try {
      setIsDeleting(true);
      
      // Get the current user's ID token for authentication
      if (!auth) {
        throw new Error('Authentication is not initialized');
      }
      
      const currentUser = auth.currentUser;
      if (currentUser === null) {
        throw new Error('You must be logged in to perform this action');
      }
      
      const idToken = await currentUser.getIdToken();
      
      // Call the API to delete the user
      const response = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          reason: actionReason || 'Deleted by admin'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
      
      // Update local state to reflect the deletion
      setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      setFilteredUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      
      // Show success message
      toast({
        title: 'User Deleted',
        description: `User ${selectedUser.displayName || selectedUser.email} has been deleted successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Log the action
      logger.info('User deleted', {
        context: { userId: selectedUser.id, reason: actionReason },
        category: LogCategory.DATA
      });
      
      // Close the modal
      onDeleteClose();
      
      // Clear the action reason
      setActionReason('');
    } catch (error) {
      // Handle error
      setApiError(error instanceof Error ? error.message : 'An unknown error occurred');
      
      logger.error('Error deleting user', {
        context: { error, userId: selectedUser?.id },
        category: LogCategory.ERROR
      });
    } finally {
      setIsDeleting(false);
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
      if (action === 'delete') {
        setIsDeleting(true);
        
        // Get the current user's ID token for authentication
        if (!auth) {
          throw new Error('Authentication is not initialized');
        }
        
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('You must be logged in to perform this action');
        }
        
        const idToken = await currentUser.getIdToken();
        
        // Call the bulk delete API
        const response = await fetch('/api/admin/users/bulk-delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            userIds: selectedUsers,
            reason: 'Bulk deletion by admin'
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete users');
        }
        
        // Update local state to reflect the deletion
        setUsers(prevUsers => prevUsers.filter(user => !selectedUsers.includes(user.id)));
        setFilteredUsers(prevUsers => prevUsers.filter(user => !selectedUsers.includes(user.id)));
        
        // Clear selected users
        setSelectedUsers([]);
        
        // Show success message
        toast({
          title: 'Users Deleted',
          description: `${selectedUsers.length} users have been deleted successfully.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Log the action
        logger.info('Bulk user deletion', {
          context: { count: selectedUsers.length, userIds: selectedUsers },
          category: LogCategory.DATA
        });
      } else {
        // Process each selected user for activate/deactivate
        for (const userId of selectedUsers) {
          const userRef = doc(db, 'users', userId);
          
          if (action === 'activate') {
            await updateDoc(userRef, {
              isActive: true,
              updatedAt: new Date()
            });
          } else if (action === 'deactivate') {
            await updateDoc(userRef, {
              isActive: false,
              deactivatedAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
        
        // Update local state
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
        
        // Also update filtered users
        setFilteredUsers(prevFilteredUsers => 
          prevFilteredUsers.map(user => {
            if (selectedUsers.includes(user.id)) {
              return {
                ...user,
                isActive: action === 'activate'
              };
            }
            return user;
          })
        );
        
        // Clear selection
        setSelectedUsers([]);
        
        toast({
          title: 'Success',
          description: `${selectedUsers.length} users have been ${action === 'activate' ? 'activated' : 'deactivated'}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      logger.error(`Error performing bulk ${action}`, {
        context: { error, userIds: selectedUsers },
        category: LogCategory.ERROR
      });
      
      setApiError(error.message || `An error occurred while ${action === 'delete' ? 'deleting' : action === 'activate' ? 'activating' : 'deactivating'} users`);
      
      toast({
        title: 'Error',
        description: `Failed to ${action} users`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      if (action === 'delete') {
        setIsDeleting(false);
      }
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
      
      {apiError && (
        <Box mb={4}>
          <Alert status="error" variant="left-accent">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Error loading users</Text>
              <Text fontSize="sm">{apiError}</Text>
              <Button 
                size="sm" 
                colorScheme="red" 
                mt={2} 
                onClick={fetchUsers}
                leftIcon={<FiAlertCircle />}
              >
                Retry
              </Button>
            </Box>
          </Alert>
        </Box>
      )}
      
      {isLoading ? (
        <Center p={10}>
          <Spinner size="xl" color="blue.500" />
        </Center>
      ) : (
        <>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>
                    <Checkbox 
                      isChecked={areAllCurrentUsersSelected} 
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    >
                      SELECT ALL
                    </Checkbox>
                  </Th>
                  <Th>USER</Th>
                  <Th>ROLE</Th>
                  <Th>STATUS</Th>
                  <Th>JOINED</Th>
                  <Th>LAST LOGIN</Th>
                  <Th>CONTENT</Th>
                  <Th>ACTIONS</Th>
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
                          user.role === 'JuniorAdmin' ? 'orange' :
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
                      <Td>{user.createdAt ? user.createdAt.toLocaleDateString() : 'Unknown'}</Td>
                      <Td>{user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}</Td>
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
                            aria-label="Actions"
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
                  isDisabled={selectedUsers.length === 0}
                >
                  Activate
                </Button>
                <Button 
                  onClick={() => handleBulkAction('deactivate')} 
                  colorScheme="orange"
                  isDisabled={selectedUsers.length === 0}
                >
                  Deactivate
                </Button>
                <Button 
                  onClick={() => handleBulkAction('delete')} 
                  colorScheme="red"
                  isLoading={isDeleting}
                  loadingText="Deleting"
                  isDisabled={selectedUsers.length === 0}
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
        </>
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
                  value={selectedRole} 
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                >
                  <option value="User">User</option>
                  <option value="Reviewer">Reviewer</option>
                  <option value="JuniorAdmin">Junior Admin</option>
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
            <FormControl mb={4}>
              <FormLabel>Reason for deletion</FormLabel>
              <Textarea 
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Optional: Provide a reason for deletion"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={confirmDeleteUser}
              isLoading={isDeleting}
              loadingText="Deleting"
            >
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
