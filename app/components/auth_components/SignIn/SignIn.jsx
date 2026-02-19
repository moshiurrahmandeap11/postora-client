"use client"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContexts/AuthContexts';

const SignIn = () => {
    const router = useRouter();
    const { signin, loading } = useAuth();
    
    // state management
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({});

    // load saved email from localStorage on component mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        const savedUser = localStorage.getItem('user');
        
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
        }

        // যদি ইউজার আগে থেকে লগইন করা থাকে তাহলে ড্যাশবোর্ডে রিডাইরেক্ট
        if (savedUser) {
            router.push('/');
        }
    }, [router]);

    // validation function
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // save user data to localStorage
    const saveUserToLocalStorage = (userData, token) => {
        localStorage.setItem('user', JSON.stringify({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            profile_picture: userData.profile_picture,
            profile_picture_url: userData.profile_picture_url,
            created_at: userData.created_at,
            updated_at: userData.updated_at
        }));

        localStorage.setItem('token', token);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userRole', userData.role);
        if (userData.profile_picture_url) {
            localStorage.setItem('userAvatar', userData.profile_picture_url);
        }
    };

    // handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        const result = await signin(formData);
        
        if (result.success) {
            saveUserToLocalStorage(result.data.user, result.data.token);
            
            if (rememberMe) {
                localStorage.setItem('savedEmail', formData.email);
            } else {
                localStorage.removeItem('savedEmail');
            }
            
            localStorage.setItem('lastLogin', new Date().toISOString());
            
            router.push('/');
        }
    };

    // toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <div className="min-h-screen mt-10 flex items-center justify-center p-4 bg-linear-to-br from-green-50 via-white to-green-100 dark:from-green-950 dark:via-black dark:to-green-900">
            
            {/* ডেকোরেটিভ এলিমেন্টস */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 dark:bg-green-900 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-300 dark:bg-green-800 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-100 dark:bg-green-950 rounded-full opacity-10 blur-3xl"></div>
            </div>

            <div className="w-full max-w-105 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-green-200 dark:border-green-800 p-8 shadow-2xl shadow-green-500/10 dark:shadow-green-500/5 relative z-10">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                        Welcome Back!
                    </h1>
                    <p className="text-sm text-green-600 dark:text-green-400">
                        Sign in to continue your journey
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                    
                    {/* Email Field */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Email Address
                        </label>
                        <div className="flex flex-col gap-1.5">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 dark:text-green-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border-2 ${
                                        errors.email 
                                            ? 'border-red-400 focus:border-red-500' 
                                            : 'border-green-200 dark:border-green-800 focus:border-green-500 dark:focus:border-green-400'
                                    } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-4 ${
                                        errors.email 
                                            ? 'focus:ring-red-100 dark:focus:ring-red-900/20' 
                                            : 'focus:ring-green-100 dark:focus:ring-green-900/20'
                                    } disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-all`}
                                    disabled={loading}
                                />
                            </div>
                            {errors.email && (
                                <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                    </svg>
                                    {errors.email}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Password
                        </label>
                        <div className="flex flex-col gap-1.5">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 dark:text-green-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className={`w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-900 border-2 ${
                                        errors.password 
                                            ? 'border-red-400 focus:border-red-500' 
                                            : 'border-green-200 dark:border-green-800 focus:border-green-500 dark:focus:border-green-400'
                                    } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-4 ${
                                        errors.password 
                                            ? 'focus:ring-red-100 dark:focus:ring-red-900/20' 
                                            : 'focus:ring-green-100 dark:focus:ring-green-900/20'
                                    } disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-all`}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 focus:outline-none transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && (
                                <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                    </svg>
                                    {errors.password}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between flex-wrap gap-4 my-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="sr-only peer"
                                    disabled={loading}
                                />
                                <div className="w-5 h-5 border-2 border-green-300 dark:border-green-700 rounded peer-checked:bg-green-500 peer-checked:border-green-500 peer-checked:ring-2 peer-checked:ring-green-200 dark:peer-checked:ring-green-900 transition-all group-hover:border-green-400"></div>
                                <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                Remember me
                            </span>
                        </label>
                        
                        <Link href="/forgot-password" className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline underline-offset-2 transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Sign In Button */}
                    <button 
                        type="submit" 
                        className="w-full py-3.5 cursor-pointer bg-linear-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-600 text-white font-semibold uppercase tracking-wider rounded-lg hover:from-green-700 hover:to-green-600 dark:hover:from-green-400 dark:hover:to-green-500 focus:outline-none focus:ring-4 focus:ring-green-200 dark:focus:ring-green-800 focus:ring-offset-2 dark:focus:ring-offset-black disabled:from-gray-400 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-600 disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-green-500/25 dark:shadow-green-500/10"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        ) : 'Sign In'}
                    </button>

                    {/* Sign Up Link */}
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                        <span>New to our platform? </span>
                        <Link href="/signup" className="text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-300 underline underline-offset-2 transition-colors">
                            Create an account
                        </Link>
                    </div>

                    {/* Decorative Element */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-px bg-linear-to-r from-transparent via-green-200 dark:via-green-800 to-transparent"></div>
                        <span className="text-xs text-green-500 dark:text-green-400">secure login</span>
                        <div className="flex-1 h-px bg-linear-to-r from-transparent via-green-200 dark:via-green-800 to-transparent"></div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignIn;