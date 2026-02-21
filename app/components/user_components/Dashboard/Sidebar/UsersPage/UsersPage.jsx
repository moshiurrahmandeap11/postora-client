"use client"
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { useAuth } from '@/app/components/contexts/AuthContexts/AuthContexts';
import axiosInstane from '@/app/components/contexts/AxiosInstance/AxiosInstance';

const UsersPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [itemsPerPage] = useState(10);

    // Modal states
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userName: '' });
    const [viewModal, setViewModal] = useState({ isOpen: false, user: null });
    const [editModal, setEditModal] = useState({ 
        isOpen: false, 
        user: null,
        formData: {
            name: '',
            email: '',
            role: '',
            old_password: '',
            new_password: '',
            confirm_new_password: ''
        },
        imageFile: null,
        imagePreview: null,
        loading: false
    });

    // File input ref
    const fileInputRef = useRef(null);

    // Fetch users with pagination
    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    // Filter users based on search and role
    useEffect(() => {
        let filtered = [...users];
        
        // Filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(user => 
                user.name?.toLowerCase().includes(term) || 
                user.email?.toLowerCase().includes(term)
            );
        }
        
        // Filter by role
        if (selectedRole !== 'all') {
            filtered = filtered.filter(user => user.role === selectedRole);
        }
        
        setFilteredUsers(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    }, [users, searchTerm, selectedRole, itemsPerPage]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstane.get('/users');
            
            if (response.data.success) {
                setUsers(response.data.data);
                setFilteredUsers(response.data.data);
                setTotalUsers(response.data.data.length);
                setTotalPages(Math.ceil(response.data.data.length / itemsPerPage));
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    // Handle search
    const handleSearch = () => {
        // Search is handled by useEffect
        setCurrentPage(1);
    };

    // Handle role filter
    const handleRoleFilter = (role) => {
        setSelectedRole(role);
        setCurrentPage(1);
    };

    // Handle delete user
    const handleDelete = async () => {
        if (!deleteModal.userId) return;

        try {
            const response = await axiosInstane.delete(`/users/${deleteModal.userId}`);
            
            if (response.data.success) {
                toast.success('User deleted successfully');
                fetchUsers();
                setDeleteModal({ isOpen: false, userId: null, userName: '' });
            }
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    // View user details
    const handleViewUser = (user) => {
        setViewModal({ isOpen: true, user });
    };

    // Open edit modal
    const handleEditUser = (user) => {
        setEditModal({
            isOpen: true,
            user,
            formData: {
                name: user.name || '',
                email: user.email || '',
                role: user.role || 'user',
                old_password: '',
                new_password: '',
                confirm_new_password: ''
            },
            imageFile: null,
            imagePreview: user.profile_picture_url || null,
            loading: false
        });
    };

    // Handle edit form input change
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditModal(prev => ({
            ...prev,
            formData: {
                ...prev.formData,
                [name]: value
            }
        }));
    };

    // Handle image selection
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            setEditModal(prev => ({
                ...prev,
                imageFile: file,
                imagePreview: URL.createObjectURL(file)
            }));
        }
    };

    // Handle delete profile picture
    const handleDeleteProfilePicture = async () => {
        if (!editModal.user?.id) return;

        try {
            setEditModal(prev => ({ ...prev, loading: true }));
            
            const response = await axiosInstane.delete('/users/profile-picture', {
                data: { userId: editModal.user.id }
            });

            if (response.data.success) {
                toast.success('Profile picture deleted');
                
                // Update edit modal
                setEditModal(prev => ({
                    ...prev,
                    user: {
                        ...prev.user,
                        profile_picture: null,
                        profile_picture_url: null
                    },
                    imagePreview: null,
                    imageFile: null
                }));
                
                // Update users list
                setUsers(prev => prev.map(u => 
                    u.id === editModal.user.id 
                        ? { ...u, profile_picture: null, profile_picture_url: null }
                        : u
                ));
            }
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error(error.response?.data?.message || 'Failed to delete profile picture');
        } finally {
            setEditModal(prev => ({ ...prev, loading: false }));
        }
    };

    // Handle edit submit
    const handleEditSubmit = async () => {
        const { user, formData, imageFile } = editModal;
        
        // Validation
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }

        if (!formData.email.trim()) {
            toast.error('Email is required');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Invalid email format');
            return;
        }

        if (formData.new_password || formData.confirm_new_password || formData.old_password) {
            if (!formData.old_password) {
                toast.error('Old password is required to change password');
                return;
            }
            if (!formData.new_password) {
                toast.error('New password is required');
                return;
            }
            if (!formData.confirm_new_password) {
                toast.error('Please confirm new password');
                return;
            }
            if (formData.new_password !== formData.confirm_new_password) {
                toast.error('New passwords do not match');
                return;
            }
            if (formData.new_password.length < 6) {
                toast.error('Password must be at least 6 characters');
                return;
            }
        }

        try {
            setEditModal(prev => ({ ...prev, loading: true }));

            let updatedUserData = { ...user };

            // Update user info
            if (formData.name !== user.name || 
                formData.email !== user.email || 
                formData.role !== user.role ||
                formData.old_password) {
                
                const updateData = {
                    name: formData.name,
                    email: formData.email
                };

                // Only admin can change role
                if (currentUser?.role === 'admin' && formData.role !== user.role) {
                    updateData.role = formData.role;
                }

                if (formData.old_password) {
                    updateData.old_password = formData.old_password;
                    updateData.new_password = formData.new_password;
                    updateData.confirm_new_password = formData.confirm_new_password;
                }

                const response = await axiosInstane.patch(`/users/${user.id}`, updateData);
                
                if (response.data.success) {
                    toast.success('User updated successfully');
                    updatedUserData = { ...updatedUserData, ...response.data.data };
                }
            }

            // Upload new profile picture if selected
            if (imageFile) {
                const formData = new FormData();
                formData.append('profile_picture', imageFile);
                formData.append('userId', user.id);

                const uploadResponse = await axiosInstane.patch('/users/profile-picture', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });

                if (uploadResponse.data.success) {
                    toast.success('Profile picture uploaded');
                    updatedUserData = { ...updatedUserData, ...uploadResponse.data.data };
                }
            }

            // Update users list
            setUsers(prev => prev.map(u => 
                u.id === user.id ? updatedUserData : u
            ));

            // Close modal
            setEditModal({ 
                isOpen: false, 
                user: null,
                formData: { name: '', email: '', role: '', old_password: '', new_password: '', confirm_new_password: '' },
                imageFile: null,
                imagePreview: null,
                loading: false 
            });

        } catch (error) {
            console.error('Update failed:', error);
            toast.error(error.response?.data?.message || 'Failed to update user');
            setEditModal(prev => ({ ...prev, loading: false }));
        }
    };

    // Get current page users
    const getCurrentPageUsers = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredUsers.slice(startIndex, endIndex);
    };

    // Get role badge color
    const getRoleBadgeColor = (role) => {
        switch(role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'moderator':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        }
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Users Management
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Manage all users, their roles and permissions
                        </p>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Users: <span className="font-semibold">{totalUsers}</span>
                        {searchTerm && ` (Filtered: ${filteredUsers.length})`}
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                        />
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={selectedRole}
                            onChange={(e) => handleRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                            <option value="user">User</option>
                        </select>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedRole('all');
                                fetchUsers();
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    {loading ? (
                        // Loading Skeleton
                        <div className="p-8 space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center space-x-4 animate-pulse">
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                    </div>
                                    <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Joined
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {getCurrentPageUsers().map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            {user.profile_picture_url ? (
                                                                <img
                                                                    src={user.profile_picture_url}
                                                                    alt={user.name}
                                                                    className="h-10 w-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center text-white font-semibold">
                                                                    {user.name?.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                ID: {user.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDate(user.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {/* View Button */}
                                                        <button
                                                            onClick={() => handleViewUser(user)}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                                                            title="View Details"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>

                                                        {/* Edit Button */}
                                                        {(currentUser?.role === 'admin' || currentUser?.id === user.id) && (
                                                            <button
                                                                onClick={() => handleEditUser(user)}
                                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1.5 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                                                                title="Edit User"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                        )}

                                                        {/* Delete Button */}
                                                        {currentUser?.role === 'admin' && currentUser?.id !== user.id && (
                                                            <button
                                                                onClick={() => setDeleteModal({ 
                                                                    isOpen: true, 
                                                                    userId: user.id, 
                                                                    userName: user.name 
                                                                })}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                                title="Delete User"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4 p-4">
                                {getCurrentPageUsers().map((user) => (
                                    <div key={user.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12">
                                                    {user.profile_picture_url ? (
                                                        <img
                                                            src={user.profile_picture_url}
                                                            alt={user.name}
                                                            className="h-12 w-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center text-white font-semibold text-lg">
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {user.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        ID: {user.id}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 mb-3">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Email:</span> {user.email}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Joined:</span> {formatDate(user.created_at)}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                onClick={() => handleViewUser(user)}
                                                className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                title="View Details"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            
                                            {(currentUser?.role === 'admin' || currentUser?.id === user.id) && (
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            )}
                                            
                                            {currentUser?.role === 'admin' && currentUser?.id !== user.id && (
                                                <button
                                                    onClick={() => setDeleteModal({ 
                                                        isOpen: true, 
                                                        userId: user.id, 
                                                        userName: user.name 
                                                    })}
                                                    className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* No Users Found */}
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {searchTerm ? 'Try adjusting your search' : 'Start by adding some users'}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View User Modal */}
            {viewModal.isOpen && viewModal.user && (
                <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setViewModal({ isOpen: false, user: null })}>
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
                             onClick={e => e.stopPropagation()}>
                            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                                {/* Modal Header */}
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        User Details
                                    </h3>
                                    <button
                                        onClick={() => setViewModal({ isOpen: false, user: null })}
                                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* User Details Content */}
                                <div className="space-y-6">
                                    {/* Profile Picture and Basic Info */}
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                        <div className="flex-shrink-0">
                                            {viewModal.user.profile_picture_url ? (
                                                <img
                                                    src={viewModal.user.profile_picture_url}
                                                    alt={viewModal.user.name}
                                                    className="h-32 w-32 rounded-full object-cover border-4 border-green-500"
                                                />
                                            ) : (
                                                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center text-white font-bold text-4xl border-4 border-green-500">
                                                    {viewModal.user.name?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {viewModal.user.name}
                                            </h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                User ID: {viewModal.user.id}
                                            </p>
                                            <div className="mt-2">
                                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(viewModal.user.role)}`}>
                                                    {viewModal.user.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</label>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{viewModal.user.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</label>
                                            <p className="mt-1 text-sm">
                                                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">
                                                    Active
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created At</label>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(viewModal.user.created_at)}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last Updated</label>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(viewModal.user.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                                {(currentUser?.role === 'admin' || currentUser?.id === viewModal.user.id) && (
                                    <button
                                        onClick={() => {
                                            setViewModal({ isOpen: false, user: null });
                                            handleEditUser(viewModal.user);
                                        }}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm"
                                    >
                                        Edit User
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setViewModal({ isOpen: false, user: null })}
                                    className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editModal.isOpen && editModal.user && (
                <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => {
                    if (!editModal.loading) {
                        setEditModal({ 
                            isOpen: false, 
                            user: null,
                            formData: { name: '', email: '', role: '', old_password: '', new_password: '', confirm_new_password: '' },
                            imageFile: null,
                            imagePreview: null,
                            loading: false 
                        });
                    }
                }}>
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
                             onClick={e => e.stopPropagation()}>
                            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                                {/* Modal Header */}
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Edit User: {editModal.user.name}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            if (!editModal.loading) {
                                                setEditModal({ 
                                                    isOpen: false, 
                                                    user: null,
                                                    formData: { name: '', email: '', role: '', old_password: '', new_password: '', confirm_new_password: '' },
                                                    imageFile: null,
                                                    imagePreview: null,
                                                    loading: false 
                                                });
                                            }
                                        }}
                                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                        disabled={editModal.loading}
                                    >
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Edit Form */}
                                <div className="space-y-6">
                                    {/* Profile Picture Upload */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative">
                                            {editModal.imagePreview ? (
                                                <img
                                                    src={editModal.imagePreview}
                                                    alt="Profile preview"
                                                    className="h-24 w-24 rounded-full object-cover border-4 border-green-500"
                                                />
                                            ) : (
                                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center text-white font-bold text-2xl border-4 border-green-500">
                                                    {editModal.user.name?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageSelect}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                                disabled={editModal.loading}
                                            >
                                                Change Photo
                                            </button>
                                            {editModal.user.profile_picture_url && (
                                                <button
                                                    type="button"
                                                    onClick={handleDeleteProfilePicture}
                                                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                                                    disabled={editModal.loading}
                                                >
                                                    Delete Photo
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={editModal.formData.name}
                                                onChange={handleEditInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                disabled={editModal.loading}
                                                required
                                            />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={editModal.formData.email}
                                                onChange={handleEditInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                disabled={editModal.loading}
                                                required
                                            />
                                        </div>

                                        {/* Role - Only visible to admin */}
                                        {currentUser?.role === 'admin' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Role
                                                </label>
                                                <select
                                                    name="role"
                                                    value={editModal.formData.role}
                                                    onChange={handleEditInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    disabled={editModal.loading}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="moderator">Moderator</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        )}

                                        {/* Password Change Section */}
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                Change Password (Optional)
                                            </h4>
                                            
                                            {/* Old Password */}
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Old Password
                                                </label>
                                                <input
                                                    type="password"
                                                    name="old_password"
                                                    value={editModal.formData.old_password}
                                                    onChange={handleEditInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    disabled={editModal.loading}
                                                    placeholder="Enter old password"
                                                />
                                            </div>

                                            {/* New Password */}
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    name="new_password"
                                                    value={editModal.formData.new_password}
                                                    onChange={handleEditInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    disabled={editModal.loading}
                                                    placeholder="Enter new password (min 6 characters)"
                                                />
                                            </div>

                                            {/* Confirm New Password */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    name="confirm_new_password"
                                                    value={editModal.formData.confirm_new_password}
                                                    onChange={handleEditInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                                    disabled={editModal.loading}
                                                    placeholder="Confirm new password"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                                <button
                                    type="button"
                                    onClick={handleEditSubmit}
                                    disabled={editModal.loading}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {editModal.loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!editModal.loading) {
                                            setEditModal({ 
                                                isOpen: false, 
                                                user: null,
                                                formData: { name: '', email: '', role: '', old_password: '', new_password: '', confirm_new_password: '' },
                                                imageFile: null,
                                                imagePreview: null,
                                                loading: false 
                                            });
                                        }
                                    }}
                                    disabled={editModal.loading}
                                    className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setDeleteModal({ isOpen: false, userId: null, userName: '' })}>
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                             onClick={e => e.stopPropagation()}>
                            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                            Delete User
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Are you sure you want to delete <span className="font-semibold">{deleteModal.userName}</span>? 
                                                This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Delete
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeleteModal({ isOpen: false, userId: null, userName: '' })}
                                    className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;