'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContexts/AuthContexts';
import axiosInstance from '../../contexts/AxiosInstance/AxiosInstance';

const EditProfile = () => {
    const router = useRouter();
    const { user: authUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState(null);
    
    // ফর্ম ডাটা স্টেট
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        profile_picture: null,
        profile_picture_url: '',
        old_password: '',
        new_password: '',
        confirm_new_password: ''
    });

    // পাসওয়ার্ড দেখানোর জন্য
    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    });

    // এডিট মোড
    const [editMode, setEditMode] = useState({
        name: false,
        email: false,
        password: false
    });

    // এরর স্টেট
    const [errors, setErrors] = useState({});

    // ইউজার আইডি পাওয়া
    const getUserId = useCallback(() => {
        if (typeof window === 'undefined') return null;
        try {
            const userFromLS = localStorage.getItem("user");
            if (!userFromLS) return authUser?.id || null;
            const userData = JSON.parse(userFromLS);
            return userData?.id || authUser?.id || null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return authUser?.id || null;
        }
    }, [authUser?.id]);

    const userId = getUserId();

    // ইউজার ডাটা ফেচ
    useEffect(() => {
        if (!userId) {
            router.push('/signin');
            return;
        }

        const fetchUserData = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get(`/users/${userId}`);
                
                if (res.data.success) {
                    setUser(res.data.data);
                    setFormData(prev => ({
                        ...prev,
                        name: res.data.data.name || '',
                        email: res.data.data.email || '',
                        role: res.data.data.role || 'user',
                        profile_picture_url: res.data.data.profile_picture_url || ''
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                toast.error('Failed to load profile');
                if (error.response?.status === 404) {
                    router.push('/404');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId, router]);

    // ভ্যালিডেশন ফাংশন
    const validateForm = () => {
        const newErrors = {};

        // নাম ভ্যালিডেশন (যদি এডিট মোডে থাকে)
        if (editMode.name && !formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        // ইমেইল ভ্যালিডেশন (যদি এডিট মোডে থাকে)
        if (editMode.email && !formData.email) {
            newErrors.email = 'Email is required';
        } else if (editMode.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        // পাসওয়ার্ড ভ্যালিডেশন (যদি পাসওয়ার্ড চেঞ্জ করতে চায়)
        if (editMode.password) {
            if (!formData.old_password) {
                newErrors.old_password = 'Old password is required';
            }
            if (!formData.new_password) {
                newErrors.new_password = 'New password is required';
            } else if (formData.new_password.length < 6) {
                newErrors.new_password = 'Password must be at least 6 characters';
            }
            if (!formData.confirm_new_password) {
                newErrors.confirm_new_password = 'Please confirm your password';
            } else if (formData.new_password !== formData.confirm_new_password) {
                newErrors.confirm_new_password = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // প্রোফাইল পিকচার আপলোড
    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // ফাইল সাইজ চেক (10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        // ফাইল টাইপ চেক
        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed');
            return;
        }

        const formData = new FormData();
        formData.append('profile_picture', file);

        try {
            setUploading(true);
            const response = await axiosInstance.patch('/users/profile-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setFormData(prev => ({
                    ...prev,
                    profile_picture_url: response.data.data.profile_picture_url
                }));
                toast.success('Profile picture updated successfully');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload picture');
        } finally {
            setUploading(false);
        }
    };

    // প্রোফাইল পিকচার ডিলিট
    const handleDeletePicture = async () => {
        const result = await Swal.fire({
            title: 'Delete Picture?',
            text: "Are you sure you want to delete your profile picture?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#10b981',
            confirmButtonText: 'Yes, delete it!',
            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827',
        });

        if (result.isConfirmed) {
            try {
                await axiosInstance.delete('/users/profile-picture');
                setFormData(prev => ({ ...prev, profile_picture_url: '' }));
                toast.success('Profile picture deleted');
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete picture');
            }
        }
    };

    // ফর্ম সাবমিট
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        // চেক করা কি কিছু আপডেট করতে চায়
        if (!editMode.name && !editMode.email && !editMode.password) {
            toast.error('No changes to update');
            return;
        }

        try {
            setSubmitting(true);
            
            // আপডেটের জন্য ডাটা প্রস্তুত
            const updateData = {};
            if (editMode.name) updateData.name = formData.name;
            if (editMode.email) updateData.email = formData.email;
            if (editMode.password) {
                updateData.old_password = formData.old_password;
                updateData.new_password = formData.new_password;
                updateData.confirm_new_password = formData.confirm_new_password;
            }

            const response = await axiosInstance.patch(`/users/${userId}`, updateData);

            if (response.data.success) {
                // লোকাল স্টোরেজ আপডেট
                const userFromLS = localStorage.getItem('user');
                if (userFromLS) {
                    const userData = JSON.parse(userFromLS);
                    const updatedUser = { ...userData, ...response.data.data };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }

                toast.success('Profile updated successfully');
                
                // এডিট মোড অফ
                setEditMode({ name: false, email: false, password: false });
                
                // পাসওয়ার্ড ফিল্ড ক্লিয়ার
                if (editMode.password) {
                    setFormData(prev => ({
                        ...prev,
                        old_password: '',
                        new_password: '',
                        confirm_new_password: ''
                    }));
                }

                // ২ সেকেন্ড পর প্রোফাইল পেজে রিডাইরেক্ট
                setTimeout(() => {
                    router.push('/profile');
                }, 2000);
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    // ক্যান্সেল হ্যান্ডলার
    const handleCancel = () => {
        setEditMode({ name: false, email: false, password: false });
        setErrors({});
        // ফর্ম রিসেট
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                old_password: '',
                new_password: '',
                confirm_new_password: ''
            }));
        }
    };

    // লোডিং স্টেট
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-green-200 dark:border-green-800 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-green-600 dark:border-t-green-400 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black py-8 sm:py-12 lg:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                
                {/* হেডার */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Edit Profile
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Update your profile information
                    </p>
                </div>

                {/* এডিট ফর্ম */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* প্রোফাইল পিকচার সেকশন */}
                    <div className="bg-white dark:bg-black border border-green-200 dark:border-green-800 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Profile Picture
                        </h2>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* প্রিভিউ */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 rounded-2xl flex items-center justify-center text-white dark:text-black font-bold text-3xl sm:text-4xl overflow-hidden">
                                    {formData.profile_picture_url ? (
                                        <img 
                                            src={formData.profile_picture_url} 
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        formData.name?.charAt(0).toUpperCase() || 'U'
                                    )}
                                </div>
                            </div>

                            {/* বাটন */}
                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap gap-3">
                                    <label className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 text-white dark:text-black font-semibold rounded-lg hover:from-green-700 hover:to-green-600 dark:hover:from-green-400 dark:hover:to-green-500 transform hover:scale-105 transition-all shadow-lg shadow-green-500/25 dark:shadow-green-500/10 cursor-pointer">
                                        <span>{uploading ? 'Uploading...' : 'Upload New'}</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleProfilePictureUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                    
                                    {formData.profile_picture_url && (
                                        <button
                                            type="button"
                                            onClick={handleDeletePicture}
                                            className="px-4 py-2.5 bg-red-500 dark:bg-red-600 text-white font-semibold rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transform hover:scale-105 transition-all shadow-lg shadow-red-500/25"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Allowed: JPG, PNG, GIF, WEBP. Max size: 10MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* নাম সেকশন */}
                    <div className="bg-white dark:bg-black border border-green-200 dark:border-green-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Full Name
                            </h2>
                            <button
                                type="button"
                                onClick={() => setEditMode(prev => ({ ...prev, name: !prev.name }))}
                                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                            >
                                {editMode.name ? 'Cancel' : 'Edit'}
                            </button>
                        </div>

                        {editMode.name ? (
                            <div>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 ${
                                        errors.name ? 'border-red-500' : 'border-green-200 dark:border-green-800'
                                    } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 transition-all`}
                                    placeholder="Enter your full name"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-700 dark:text-gray-300">{formData.name || 'Not set'}</p>
                        )}
                    </div>

                    {/* ইমেইল সেকশন */}
                    <div className="bg-white dark:bg-black border border-green-200 dark:border-green-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Email Address
                            </h2>
                            <button
                                type="button"
                                onClick={() => setEditMode(prev => ({ ...prev, email: !prev.email }))}
                                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                            >
                                {editMode.email ? 'Cancel' : 'Edit'}
                            </button>
                        </div>

                        {editMode.email ? (
                            <div>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 ${
                                        errors.email ? 'border-red-500' : 'border-green-200 dark:border-green-800'
                                    } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 transition-all`}
                                    placeholder="Enter your email"
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-700 dark:text-gray-300">{formData.email}</p>
                        )}
                    </div>

                    {/* রোল সেকশন (View Only) */}
                    <div className="bg-white dark:bg-black border border-green-200 dark:border-green-800 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Role
                        </h2>
                        <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium">
                            {formData.role}
                        </div>
                    </div>

                    {/* পাসওয়ার্ড সেকশন */}
                    <div className="bg-white dark:bg-black border border-green-200 dark:border-green-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Password
                            </h2>
                            <button
                                type="button"
                                onClick={() => setEditMode(prev => ({ ...prev, password: !prev.password }))}
                                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                            >
                                {editMode.password ? 'Cancel' : 'Change Password'}
                            </button>
                        </div>

                        {editMode.password && (
                            <div className="space-y-4">
                                {/* Old Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.old ? 'text' : 'password'}
                                            value={formData.old_password}
                                            onChange={(e) => setFormData(prev => ({ ...prev, old_password: e.target.value }))}
                                            className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 ${
                                                errors.old_password ? 'border-red-500' : 'border-green-200 dark:border-green-800'
                                            } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 transition-all pr-12`}
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(prev => ({ ...prev, old: !prev.old }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            {showPassword.old ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                    {errors.old_password && (
                                        <p className="text-xs text-red-500 mt-1">{errors.old_password}</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.new ? 'text' : 'password'}
                                            value={formData.new_password}
                                            onChange={(e) => setFormData(prev => ({ ...prev, new_password: e.target.value }))}
                                            className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 ${
                                                errors.new_password ? 'border-red-500' : 'border-green-200 dark:border-green-800'
                                            } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 transition-all pr-12`}
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            {showPassword.new ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                    {errors.new_password && (
                                        <p className="text-xs text-red-500 mt-1">{errors.new_password}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.confirm ? 'text' : 'password'}
                                            value={formData.confirm_new_password}
                                            onChange={(e) => setFormData(prev => ({ ...prev, confirm_new_password: e.target.value }))}
                                            className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 ${
                                                errors.confirm_new_password ? 'border-red-500' : 'border-green-200 dark:border-green-800'
                                            } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 transition-all pr-12`}
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            {showPassword.confirm ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                    {errors.confirm_new_password && (
                                        <p className="text-xs text-red-500 mt-1">{errors.confirm_new_password}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* অ্যাকশন বাটন */}
                    {(editMode.name || editMode.email || editMode.password) && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 text-white dark:text-black font-semibold rounded-lg hover:from-green-700 hover:to-green-600 dark:hover:from-green-400 dark:hover:to-green-500 transform hover:scale-105 transition-all shadow-lg shadow-green-500/25 dark:shadow-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                            
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 px-6 py-3 border-2 border-green-200 dark:border-green-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* ব্যাক টু প্রোফাইল */}
                    <div className="text-center mt-6">
                        <Link 
                            href="/profile" 
                            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium inline-flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Profile
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;