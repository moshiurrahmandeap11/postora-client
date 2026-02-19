'use client'
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../../contexts/AxiosInstance/AxiosInstance';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    // email validation
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    // handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // validation
        if (!email) {
            setError('Email is required');
            return;
        }
        
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await axiosInstance.post('/users/forgot-password', { email });
            
            if (response.data.success) {
                setSubmitted(true);
                toast.success('Reset link sent to your email!');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            const message = error.response?.data?.message || 'Failed to send reset link';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // email provider link
    const getEmailProviderLink = (email) => {
        const domain = email.split('@')[1];
        
        const emailLinks = {
            'gmail.com': 'https://mail.google.com',
            'yahoo.com': 'https://mail.yahoo.com',
            'outlook.com': 'https://outlook.live.com',
            'hotmail.com': 'https://outlook.live.com',
            'aol.com': 'https://mail.aol.com',
            'protonmail.com': 'https://mail.protonmail.com',
            'icloud.com': 'https://www.icloud.com/mail',
        };

        return emailLinks[domain] || null;
    };

    const emailProviderLink = submitted ? getEmailProviderLink(email) : null;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
            <div className="w-full max-w-md">
                
                {/* card */}
                <div className="bg-white dark:bg-black border border-green-200 dark:border-green-800 rounded-2xl p-8 shadow-xl shadow-green-500/5">
                    
                    {/* header */}
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {submitted ? 'Check Your Email' : 'Forgot Password?'}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {submitted 
                                ? `We've sent a reset link to ${email}`
                                : 'Enter your email and we\'ll send you reset instructions.'
                            }
                        </p>
                    </div>

                    {/* success message */}
                    {submitted ? (
                        <div className="text-center space-y-6">
                            
                            {/* success icon */}
                            <div className="flex justify-center">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-bounce">
                                    <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>

                            {/* info card */}
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                     Email Sent Successfully!
                                </h3>
                                
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        We've sent a password reset link to:
                                    </p>
                                    
                                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-green-200 dark:border-green-800">
                                        <p className="text-base font-medium text-green-600 dark:text-green-400 break-all">
                                            {email}
                                        </p>
                                    </div>

                                    {/* email provider link */}
                                    {emailProviderLink && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                Quick access to your email:
                                            </p>
                                            <a
                                                href={emailProviderLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transform hover:scale-105 transition-all shadow-lg shadow-blue-500/25"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                                </svg>
                                                Open {email.split('@')[1]}
                                            </a>
                                        </div>
                                    )}

                                    {/* timer info */}
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-4">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Link expires in <span className="font-semibold text-green-600 dark:text-green-400">15 minutes</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* instruction */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
                                <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                                    📋 Next Steps:
                                </h4>
                                <ol className="text-xs text-blue-600 dark:text-blue-400 space-y-2 list-decimal list-inside">
                                    <li>Click the link in the email</li>
                                    <li>Enter your new password</li>
                                    <li>Confirm your new password</li>
                                    <li>Sign in with your new password</li>
                                </ol>
                            </div>

                            {/* action button */}
                            <div className="space-y-3 pt-4">
                                <Link
                                    href="/signin"
                                    className="inline-block w-full px-4 py-3 bg-linear-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 text-white dark:text-black font-semibold rounded-lg hover:from-green-700 hover:to-green-600 dark:hover:from-green-400 dark:hover:to-green-500 transform hover:scale-105 transition-all shadow-lg shadow-green-500/25 dark:shadow-green-500/10"
                                >
                                    Back to Sign In
                                </Link>
                                
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="w-full text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium py-2"
                                >
                                    ← Try another email
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* ফর্ম */
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* email field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 dark:text-green-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="Enter your email"
                                        className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border-2 ${
                                            error ? 'border-red-500' : 'border-green-200 dark:border-green-800'
                                        } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 transition-all`}
                                        disabled={loading}
                                    />
                                </div>
                                {error && (
                                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {error}
                                    </p>
                                )}
                            </div>

                            {/* info toast */}
                            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    We'll send a password reset link to your email. The link will expire in 15 minutes for security.
                                </p>
                            </div>

                            {/* button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-linear-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 text-white dark:text-black font-semibold rounded-lg hover:from-green-700 hover:to-green-600 dark:hover:from-green-400 dark:hover:to-green-500 transform hover:scale-105 transition-all shadow-lg shadow-green-500/25 dark:shadow-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>

                            {/* back to sign in */}
                            <div className="text-center">
                                <Link
                                    href="/signin"
                                    className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium inline-flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to Sign In
                                </Link>
                            </div>
                        </form>
                    )}
                </div>

                {/* footer text */}
                <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6">
                    © {new Date().getFullYear()} Postora. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;