"use client"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContexts/AuthContexts';

const SignUp = () => {
    const router = useRouter();
    const { signup, loading } = useAuth();
    
    // state management
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        password: false,
        confirmPassword: false
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // validation function
    const validateForm = () => {
        const newErrors = {};
        
        // Name validation
        if (!formData.name) {
            newErrors.name = 'Full name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }
        
        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        // Confirm Password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // handle blur for validation
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateForm();
    };

    // handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // mark all fields as touched
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);
        
        if (!validateForm()) return;
        
        // remove confirmPassword before sending to API
        const { confirmPassword, ...signupData } = formData;
        const result = await signup(signupData);
        
        if (result.success) {
            router.push('/login');
        }
    };

    // toggle password visibility
    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // check if field has error and is touched
    const hasError = (fieldName) => touched[fieldName] && errors[fieldName];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
            <div className="w-full max-w-110 bg-white dark:bg-black border border-black dark:border-white p-8 shadow-lg">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-black dark:text-white mb-2 tracking-tight">
                        Create Account
                    </h1>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Sign up to get started
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                    
                    {/* Full Name Field */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="text-sm font-semibold text-black dark:text-white uppercase tracking-wider">
                            Full Name
                        </label>
                        <div className="flex flex-col gap-1">
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter your full name"
                                className={`w-full px-4 py-3 bg-white dark:bg-black border ${
                                    hasError('name') ? 'border-red-500' : 'border-black dark:border-white'
                                } text-black dark:text-white focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-600 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-all`}
                                disabled={loading}
                            />
                            {hasError('name') && (
                                <span className="text-xs text-red-500 mt-1">{errors.name}</span>
                            )}
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-sm font-semibold text-black dark:text-white uppercase tracking-wider">
                            Email Address
                        </label>
                        <div className="flex flex-col gap-1">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter your email"
                                className={`w-full px-4 py-3 bg-white dark:bg-black border ${
                                    hasError('email') ? 'border-red-500' : 'border-black dark:border-white'
                                } text-black dark:text-white focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-600 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-all`}
                                disabled={loading}
                            />
                            {hasError('email') && (
                                <span className="text-xs text-red-500 mt-1">{errors.email}</span>
                            )}
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-sm font-semibold text-black dark:text-white uppercase tracking-wider">
                            Password
                        </label>
                        <div className="flex flex-col gap-1">
                            <div className="relative w-full">
                                <input
                                    type={showPassword.password ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Create a password"
                                    className={`w-full px-4 py-3 bg-white dark:bg-black border ${
                                        hasError('password') ? 'border-red-500' : 'border-black dark:border-white'
                                    } text-black dark:text-white focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-600 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-all pr-12`}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('password')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black dark:text-white hover:opacity-70 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                                    aria-label={showPassword.password ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword.password ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {hasError('password') && (
                                <span className="text-xs text-red-500 mt-1">{errors.password}</span>
                            )}
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="confirmPassword" className="text-sm font-semibold text-black dark:text-white uppercase tracking-wider">
                            Confirm Password
                        </label>
                        <div className="flex flex-col gap-1">
                            <div className="relative w-full">
                                <input
                                    type={showPassword.confirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Confirm your password"
                                    className={`w-full px-4 py-3 bg-white dark:bg-black border ${
                                        hasError('confirmPassword') ? 'border-red-500' : 'border-black dark:border-white'
                                    } text-black dark:text-white focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-600 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-all pr-12`}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirmPassword')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black dark:text-white hover:opacity-70 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                                    aria-label={showPassword.confirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword.confirmPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {hasError('confirmPassword') && (
                                <span className="text-xs text-red-500 mt-1">{errors.confirmPassword}</span>
                            )}
                        </div>
                    </div>

                    {/* Password Requirements Hint */}
                    {touched.password && !errors.password && formData.password && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✓ Password is valid
                        </div>
                    )}

                    {/* Sign Up Button */}
                    <button 
                        type="submit" 
                        className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white text-sm font-semibold uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:border-gray-400 dark:disabled:border-gray-600 disabled:cursor-not-allowed disabled:opacity-50 transition-all mt-4"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-black px-4 text-gray-500 dark:text-gray-400">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Social Login Buttons (Placeholder) */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            className="flex-1 py-3 border border-black dark:border-white text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 disabled:opacity-50 transition-all"
                            disabled
                        >
                            Google
                        </button>
                        <button
                            type="button"
                            className="flex-1 py-3 border border-black dark:border-white text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 disabled:opacity-50 transition-all"
                            disabled
                        >
                            Facebook
                        </button>
                    </div>

                    {/* Sign In Link */}
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                        <span>Already have an account? </span>
                        <Link href="/signin" className="text-black dark:text-white underline font-semibold hover:opacity-70 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white ml-1">
                            Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;