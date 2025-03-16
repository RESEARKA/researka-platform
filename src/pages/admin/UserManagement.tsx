import { useState, useEffect } from 'react';
import { 
  User, 
  getUsers, 
  updateUserStatus,
  updateUserRole
} from '../../services/mockAdminService';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<User['role'] | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<User['status'] | 'all'>('all');
  
  useEffect(() => {
    const fetchUsers = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const fetchedUsers = getUsers();
      setUsers(fetchedUsers);
      setIsLoading(false);
    };
    
    fetchUsers();
  }, []);
  
  const filteredUsers = users
    .filter(user => {
      if (roleFilter === 'all') return true;
      return user.role === roleFilter;
    })
    .filter(user => {
      if (statusFilter === 'all') return true;
      return user.status === statusFilter;
    })
    .filter(user => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.walletAddress && user.walletAddress.toLowerCase().includes(searchLower))
      );
    });
  
  const handleStatusChange = (userId: string, newStatus: User['status']) => {
    const updatedUser = updateUserStatus(userId, newStatus);
    
    if (updatedUser) {
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      
      // If the user is currently selected, update it
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
    }
  };
  
  const handleRoleChange = (userId: string, newRole: User['role']) => {
    const updatedUser = updateUserRole(userId, newRole);
    
    if (updatedUser) {
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      // If the user is currently selected, update it
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    }
  };
  
  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  
  const closeUserModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  
  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'suspended':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">Suspended</span>;
      case 'banned':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Banned</span>;
      default:
        return null;
    }
  };
  
  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Admin</span>;
      case 'editor':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Editor</span>;
      case 'reviewer':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">Reviewer</span>;
      case 'user':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">User</span>;
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-12 bg-gray-200 rounded mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
          + Add New User
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <div>
              <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role-filter"
                className="border rounded-md text-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value as User['role'] | 'all')}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="reviewer">Reviewer</option>
                <option value="user">User</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                className="border rounded-md text-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as User['status'] | 'all')}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border rounded-md w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                           onClick={() => openUserModal(user)}>
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.registrationDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.lastActive}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openUserModal(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleStatusChange(user.id, 'suspended')}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Suspend
                        </button>
                      ) : user.status === 'pending' ? (
                        <button
                          onClick={() => handleStatusChange(user.id, 'active')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                      ) : user.status === 'suspended' ? (
                        <button
                          onClick={() => handleStatusChange(user.id, 'active')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(user.id, 'active')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Unban
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* User Detail Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">User Details</h3>
              <button
                onClick={closeUserModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedUser.name}</h2>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Registration Date</h4>
                  <p className="text-sm text-gray-900">{selectedUser.registrationDate}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Last Active</h4>
                  <p className="text-sm text-gray-900">{selectedUser.lastActive}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Articles Published</h4>
                  <p className="text-sm text-gray-900">{selectedUser.articleCount}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Reviews Completed</h4>
                  <p className="text-sm text-gray-900">{selectedUser.reviewCount}</p>
                </div>
              </div>
              
              {selectedUser.walletAddress && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Wallet Address</h4>
                  <div className="bg-gray-50 p-3 rounded-md text-sm font-mono text-gray-800 break-all">
                    {selectedUser.walletAddress}
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Change Role</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleRoleChange(selectedUser.id, 'user')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      selectedUser.role === 'user'
                        ? 'bg-gray-200 text-gray-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={selectedUser.role === 'user'}
                  >
                    User
                  </button>
                  <button
                    onClick={() => handleRoleChange(selectedUser.id, 'reviewer')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      selectedUser.role === 'reviewer'
                        ? 'bg-indigo-200 text-indigo-800'
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                    disabled={selectedUser.role === 'reviewer'}
                  >
                    Reviewer
                  </button>
                  <button
                    onClick={() => handleRoleChange(selectedUser.id, 'editor')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      selectedUser.role === 'editor'
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                    disabled={selectedUser.role === 'editor'}
                  >
                    Editor
                  </button>
                  <button
                    onClick={() => handleRoleChange(selectedUser.id, 'admin')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      selectedUser.role === 'admin'
                        ? 'bg-purple-200 text-purple-800'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                    disabled={selectedUser.role === 'admin'}
                  >
                    Admin
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Change Status</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedUser.id, 'active')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      selectedUser.status === 'active'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    disabled={selectedUser.status === 'active'}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedUser.id, 'suspended')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      selectedUser.status === 'suspended'
                        ? 'bg-orange-200 text-orange-800'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                    disabled={selectedUser.status === 'suspended'}
                  >
                    Suspended
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedUser.id, 'banned')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      selectedUser.status === 'banned'
                        ? 'bg-red-200 text-red-800'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                    disabled={selectedUser.status === 'banned'}
                  >
                    Banned
                  </button>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
              <button
                onClick={closeUserModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
