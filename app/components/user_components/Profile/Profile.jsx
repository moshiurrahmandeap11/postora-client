'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContexts/AuthContexts';
import axiosInstance from '../../contexts/AxiosInstance/AxiosInstance';

const Profile = () => {
    const router = useRouter();
    const { user: authUser, signout } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [stats, setStats] = useState({
        posts: 0,
        followers: 0,
        following: 0
    });
    
    const fetchedRef = useRef(false);
    const userIdRef = useRef(null);

    // ইউজার আইডি মেমোইজ করুন
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

        if (fetchedRef.current && userIdRef.current === userId) {
            return;
        }

        const fetchUserData = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get(`/users/${userId}`);
                
                if (res.data.success) {
                    setUser(res.data.data);
                    setImageError(false); // রিসেট ইমেজ এরর
                    
                    try {
                        const userFromLS = localStorage.getItem("user");
                        if (userFromLS) {
                            const userData = JSON.parse(userFromLS);
                            const updatedUser = { ...userData, ...res.data.data };
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                        }
                    } catch (e) {
                        console.error('Error updating localStorage:', e);
                    }
                    
                    setStats({
                        posts: 24,
                        followers: 156,
                        following: 89
                    });

                    fetchedRef.current = true;
                    userIdRef.current = userId;
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

    // ইউজার ইনিশিয়ালস
    const getUserInitials = useCallback(() => {
        if (!user?.name) return 'U';
        return user.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }, [user?.name]);

    // ডিলিট হ্যান্ডলার
    const handleDeleteAccount = async () => {
        try {
            const response = await axiosInstance.delete(`/users/${userId}`);
            
            if (response.data.success || response.status === 200) {
                
                // লোকাল স্টোরেজ ক্লিয়ার
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('savedEmail');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userAvatar');
                localStorage.removeItem('lastLogin');
                
                // কুকি ক্লিয়ার
                document.cookie.split(";").forEach(function(c) { 
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });
                
                // AuthContext থেকে সাইনআউট
                if (signout) {
                    await signout();
                }
                
                return response.data;
            } else {
                throw new Error('Delete failed');
            }
            
        } catch (error) {
            console.error('Delete account error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete account');
            throw error;
        }
    };

    // ডিলিট কনফার্মেশন
    const confirmDeleteWithSweetAlert = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#10b981',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    setLoading(true);
                    
                    const response = await axiosInstance.delete(`/users/${userId}`);
                    
                    if (response.data.success || response.status === 200) {
                        
                        // লোকাল স্টোরেজ ক্লিয়ার
                        localStorage.clear();
                        
                        if (signout) {
                            await signout();
                        }
                        
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Your account has been deleted.',
                            icon: 'success',
                            confirmButtonColor: '#10b981',
                            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                            color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827',
                            timer: 2000,
                            timerProgressBar: true,
                        }).then(() => {
                            router.push('/');
                        });
                    }
                } catch (error) {
                    Swal.fire({
                        title: 'Error!',
                        text: error.response?.data?.message || 'Failed to delete account',
                        icon: 'error',
                        confirmButtonColor: '#ef4444',
                        background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                        color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827',
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
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

    // ইউজার না পাওয়া গেলে
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
                <div className="text-center">
                    <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User not found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">The profile you&apos;re looking for doesn&apos;t exist.</p>
                    <Link
                        href="/"
                        className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 text-white dark:text-black font-semibold rounded-lg hover:from-green-700 hover:to-green-600 dark:hover:from-green-400 dark:hover:to-green-500 transform hover:scale-105 transition-all shadow-lg shadow-green-500/25 dark:shadow-green-500/10"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen mt-16 bg-white dark:bg-black py-8 sm:py-12 lg:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                
                {/* প্রোফাইল হেডার */}
                <div className="bg-white dark:bg-black border border-green-200 dark:border-green-800 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-green-500/5 mb-6 sm:mb-8">
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
                        
{/* অ্যাভাটার - ফিক্সড ভার্সন */}
<div className="relative group">
    {/* ব্লার ইফেক্ট */}
    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
    
    {/* অ্যাভাটার কন্টেইনার */}
    <div className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
        {user?.profile_picture_url ? (
            <img 
                src={user.profile_picture_url}
                alt={user.name || "Profile"}
                className="w-full h-full object-cover"
                onError={(e) => {
                    console.log('Image failed to load:', user.profile_picture_url);
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 flex items-center justify-center">
                            <span class="text-white dark:text-black font-bold text-4xl">${getUserInitials()}</span>
                        </div>
                    `;
                }}
                onLoad={() => console.log('✅ Image loaded successfully:', user.profile_picture_url)}
            />
        ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 flex items-center justify-center">
                <span className="text-white dark:text-black font-bold text-4xl">
                    {getUserInitials()}
                </span>
            </div>
        )}
    </div>
    
    {/* অনলাইন স্ট্যাটাস */}
    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
    
    {/* এডিট আইকন */}
    <Link
        href={`/edit-profile/${userId}`}
        className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg hover:bg-green-600"
    >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
    </Link>
</div>
                        {/* ইউজার ইনফো */}
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                                        {user.name}
                                    </h1>
                                    <p className="text-green-600 dark:text-green-400 font-medium">
                                        @{user.email?.split('@')[0]}
                                    </p>
                                </div>
                                
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href={`/edit-profile/${userId}`}
                                        className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 text-white dark:text-black font-semibold rounded-lg hover:from-green-700 hover:to-green-600 dark:hover:from-green-400 dark:hover:to-green-500 transform hover:scale-105 transition-all shadow-lg shadow-green-500/25 dark:shadow-green-500/10 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        Edit Profile
                                    </Link>
                                    
                                    <button
                                        onClick={confirmDeleteWithSweetAlert}
                                        className="px-4 sm:px-6 py-2.5 bg-red-500 dark:bg-red-600 text-white font-semibold rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transform hover:scale-105 transition-all shadow-lg shadow-red-500/25 flex items-center gap-2"
                                        disabled={loading}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete Account
                                    </button>
                                </div>
                            </div>

                            {/* স্ট্যাটস গ্রিড */}
                            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4">
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 sm:p-4 text-center hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats.posts}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        Posts
                                    </div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 sm:p-4 text-center hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats.followers}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        Followers
                                    </div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 sm:p-4 text-center hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats.following}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        Following
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* বায়ো সেকশন */}
                    {user.bio && (
                        <div className="mt-6 pt-6 border-t border-green-200 dark:border-green-800">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                About
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {user.bio}
                            </p>
                        </div>
                    )}
                </div>

                {/* ইউজার ডিটেইলস গ্রিড */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* পার্সোনাল ইনফো */}
                    <div className="bg-white dark:bg-black border border-green-200 dark:border-green-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Personal Information
                        </h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                <svg className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="break-all">{user.email}</span>
                            </div>
                            
                            {user.location && (
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{user.location}</span>
                                </div>
                            )}
                            
                            {user.website && (
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                                    </svg>
                                    <a 
                                        href={user.website.startsWith('http') ? user.website : `https://${user.website}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-green-600 dark:text-green-400 hover:underline break-all"
                                    >
                                        {user.website}
                                    </a>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                <svg className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* একাউন্ট সেটিংস */}
                    <div className="bg-white dark:bg-black border border-green-200 dark:border-green-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Account Settings
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Account Type</span>
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                                    {user.role || 'User'}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Email Verified</span>
                                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Verified
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Two-Factor Auth</span>
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full text-sm">
                                    Not Enabled
                                </span>
                            </div>
                            
                            <div className="pt-4 border-t border-green-200 dark:border-green-800">
                                <button
                                    onClick={() => router.push('/change-password')}
                                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center gap-2 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;