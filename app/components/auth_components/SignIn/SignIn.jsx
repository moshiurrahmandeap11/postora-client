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
        // ইউজারের ডাটা সেভ করুন
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

        // টোকেন সেভ করুন
        localStorage.setItem('token', token);

        // ইউজারের প্রাথমিক তথ্যও আলাদাভাবে সেভ করতে পারেন (দ্রুত অ্যাক্সেসের জন্য)
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
            // সম্পূর্ণ ইউজার ডাটা localStorage এ সেভ করুন
            saveUserToLocalStorage(result.data.user, result.data.token);
            
            // save email if remember me is checked
            if (rememberMe) {
                localStorage.setItem('savedEmail', formData.email);
            } else {
                localStorage.removeItem('savedEmail');
            }
            
            // ইউজার লগইনের সময় সেভ করুন (সেশন ট্র্যাকিং)
            localStorage.setItem('lastLogin', new Date().toISOString());
            
            router.push('/');
        }
    };

    // toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
            <div className="w-full max-w-105 bg-white dark:bg-black border border-black dark:border-white p-8 shadow-lg">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-black dark:text-white mb-2 tracking-tight">
                        Welcome Back!
                    </h1>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Please sign in to your account
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                    
                    {/* Email Field */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm font-semibold text-black dark:text-white uppercase tracking-wider">
                            Email Address
                        </label>
                        <div className="flex flex-col gap-1.5">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className={`w-full px-4 py-3 bg-white dark:bg-black border ${
                                    errors.email ? 'border-red-500' : 'border-black dark:border-white'
                                } text-black dark:text-white focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-600 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-all`}
                                disabled={loading}
                            />
                            {errors.email && (
                                <span className="text-xs text-red-500">{errors.email}</span>
                            )}
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-sm font-semibold text-black dark:text-white uppercase tracking-wider">
                            Password
                        </label>
                        <div className="flex flex-col gap-1.5">
                            <div className="relative w-full">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className={`w-full px-4 py-3 bg-white dark:bg-black border ${
                                        errors.password ? 'border-red-500' : 'border-black dark:border-white'
                                    } text-black dark:text-white focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-600 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-all pr-12`}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black dark:text-white hover:opacity-70 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && (
                                <span className="text-xs text-red-500">{errors.password}</span>
                            )}
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between flex-wrap gap-4 my-2">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-black dark:text-white">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 cursor-pointer border border-black dark:border-white bg-white dark:bg-black checked:bg-black dark:checked:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            />
                            <span className="select-none">Remember me</span>
                        </label>
                        
                        <Link href="/forgot-password" className="text-sm text-black dark:text-white underline underline-offset-2 hover:opacity-70 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white">
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Sign In Button */}
                    <button 
                        type="submit" 
                        className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white text-sm font-semibold uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:border-gray-400 dark:disabled:border-gray-600 disabled:cursor-not-allowed disabled:opacity-50 transition-all mt-2"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    {/* Sign Up Link */}
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                        <span>Don&apos;t have an account? </span>
                        <Link href="/signup" className="text-black dark:text-white underline font-semibold hover:opacity-70 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white ml-1">
                            Sign Up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignIn;