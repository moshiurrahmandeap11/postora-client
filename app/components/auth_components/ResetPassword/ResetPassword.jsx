'use client'
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../../contexts/AxiosInstance/AxiosInstance';

// ক্লায়েন্ট সাইড কম্পোনেন্ট যেটা useSearchParams ব্যবহার করে
function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        password: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');

    // URL থেকে token এবং email নেওয়া
    useEffect(() => {
        const urlToken = searchParams.get('token');
        const urlEmail = searchParams.get('email');
        
        if (!urlToken || !urlEmail) {
            toast.error('Invalid reset link');
            router.push('/forgot-password');
            return;
        }

        setToken(urlToken);
        setEmail(decodeURIComponent(urlEmail));
    }, [searchParams, router]);

    // ভ্যালিডেশন ফাংশন
    const validateForm = () => {
        const newErrors = {};

        if (!formData.password) {
            newErrors.password = 'New password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // হ্যান্ডেল সাবমিট
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await axiosInstance.post('/users/forgot-password/reset', {
                token,
                email,
                newPassword: formData.password,
                confirmNewPassword: formData.confirmPassword
            });

            if (response.data.success) {
                toast.success('Password reset successfully!');
                
                // ২ সেকেন্ড পর সাইনইন পেজে রিডাইরেক্ট
                setTimeout(() => {
                    router.push('/signin');
                }, 2000);
            }
        } catch (error) {
            console.error('Reset password error:', error);
            const message = error.response?.data?.message || 'Failed to reset password';
            toast.error(message);
            
            // যদি টোকেন এক্সপায়ার হয়ে থাকে
            if (error.response?.status === 401) {
                setTimeout(() => {
                    router.push('/forgot-password');
                }, 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    // টগল পাসওয়ার্ড ভিজিবিলিটি
    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
            <div className="w-full max-w-md">
                
                {/* কার্ড */}
                <div className="bg-white dark:bg-black border border-green-200 dark:border-green-800 rounded-2xl p-8 shadow-xl shadow-green-500/5">
                    
                    {/* হেডার */}
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Reset Password
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Enter your new password below
                        </p>
                        {email && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                For: {email}
                            </p>
                        )}
                    </div>

                    {/* ফর্ম */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* নিউ পাসওয়ার্ড ফিল্ড */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 dark:text-green-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    type={showPassword.password ? 'text' : 'password'}
                                    id="password"
                                    value={formData.password}
                                    onChange={(e) => {
                                        setFormData({...formData, password: e.target.value});
                                        if (errors.password) setErrors({...errors, password: ''});
                                    }}
                                    placeholder="Enter new password"
                                    className={`w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-900 border-2 ${
                                        errors.password ? 'border-red-500' : 'border-green-200 dark:border-green-800'
                                    } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 transition-all`}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('password')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {showPassword.password ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* কনফার্ম পাসওয়ার্ড ফিল্ড */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 dark:text-green-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </span>
                                <input
                                    type={showPassword.confirm ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={(e) => {
                                        setFormData({...formData, confirmPassword: e.target.value});
                                        if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                                    }}
                                    placeholder="Confirm new password"
                                    className={`w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-900 border-2 ${
                                        errors.confirmPassword ? 'border-red-500' : 'border-green-200 dark:border-green-800'
                                    } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 transition-all`}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {showPassword.confirm ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* পাসওয়ার্ড স্ট্রেংথ ইন্ডিকেটর */}
                        {formData.password && !errors.password && formData.password.length >= 6 && (
                            <div className="flex gap-1 mt-1">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-all ${
                                            formData.password.length > 8 + i * 2
                                                ? 'bg-green-500 dark:bg-green-400'
                                                : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* বাটন */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-linear-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 text-white dark:text-black font-semibold rounded-lg hover:from-green-700 hover:to-green-600 dark:hover:from-green-400 dark:hover:to-green-500 transform hover:scale-105 transition-all shadow-lg shadow-green-500/25 dark:shadow-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Resetting...
                                </span>
                            ) : (
                                'Reset Password'
                            )}
                        </button>

                        {/* ব্যাক টু ফরগট পাসওয়ার্ড */}
                        <div className="text-center mt-4">
                            <Link
                                href="/forgot-password"
                                className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium inline-flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Request new link
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// মূল কম্পোনেন্ট - Suspense দিয়ে wrap করা
const ResetPassword = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-green-200 dark:border-green-800 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-green-600 dark:border-t-green-400 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
};

export default ResetPassword;