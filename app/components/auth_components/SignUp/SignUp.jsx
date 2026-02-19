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
            router.push('/signin');
        }
    };

    // toggle password visibility
    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // check if field has error and is touched
    const hasError = (fieldName) => touched[fieldName] && errors[fieldName];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-green-950 dark:via-black dark:to-green-900">
            
            {/* ডেকোরেটিভ এলিমেন্টস */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 dark:bg-green-900 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-300 dark:bg-green-800 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-100 dark:bg-green-950 rounded-full opacity-10 blur-3xl"></div>
            </div>

            <div className="w-full max-w-110 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-green-200 dark:border-green-800 p-8 shadow-2xl shadow-green-500/10 dark:shadow-green-500/5 relative z-10">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                        Create Account
                    </h1>
                    <p className="text-sm text-green-600 dark:text-green-400">
                        Join us today and start your journey
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                    
                    {/* Full Name Field */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Full Name
                        </label>
                        <div className="flex flex-col gap-1">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 dark:text-green-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Enter your full name"
                                    className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border-2 ${
                                        hasError('name') 
                                            ? 'border-red-400 focus:border-red-500' 
                                            : 'border-green-200 dark:border-green-800 focus:border-green-500 dark:focus:border-green-400'
                                    } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-4 ${
                                        hasError('name') 
                                            ? 'focus:ring-red-100 dark:focus:ring-red-900/20' 
                                            : 'focus:ring-green-100 dark:focus:ring-green-900/20'
                                    } disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-all`}
                                    disabled={loading}
                                />
                            </div>
                            {hasError('name') && (
                                <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                    </svg>
                                    {errors.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Email Address
                        </label>
                        <div className="flex flex-col gap-1">
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
                                    onBlur={handleBlur}
                                    placeholder="Enter your email"
                                    className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border-2 ${
                                        hasError('email') 
                                            ? 'border-red-400 focus:border-red-500' 
                                            : 'border-green-200 dark:border-green-800 focus:border-green-500 dark:focus:border-green-400'
                                    } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-4 ${
                                        hasError('email') 
                                            ? 'focus:ring-red-100 dark:focus:ring-red-900/20' 
                                            : 'focus:ring-green-100 dark:focus:ring-green-900/20'
                                    } disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-all`}
                                    disabled={loading}
                                />
                            </div>
                            {hasError('email') && (
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
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Password
                        </label>
                        <div className="flex flex-col gap-1">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 dark:text-green-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                </span>
                                <input
                                    type={showPassword.password ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Create a password"
                                    className={`w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-900 border-2 ${
                                        hasError('password') 
                                            ? 'border-red-400 focus:border-red-500' 
                                            : 'border-green-200 dark:border-green-800 focus:border-green-500 dark:focus:border-green-400'
                                    } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-4 ${
                                        hasError('password') 
                                            ? 'focus:ring-red-100 dark:focus:ring-red-900/20' 
                                            : 'focus:ring-green-100 dark:focus:ring-green-900/20'
                                    } disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-all`}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('password')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 focus:outline-none transition-colors"
                                    aria-label={showPassword.password ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword.password ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {hasError('password') && (
                                <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                    </svg>
                                    {errors.password}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Confirm Password
                        </label>
                        <div className="flex flex-col gap-1">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 dark:text-green-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                    </svg>
                                </span>
                                <input
                                    type={showPassword.confirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Confirm your password"
                                    className={`w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-900 border-2 ${
                                        hasError('confirmPassword') 
                                            ? 'border-red-400 focus:border-red-500' 
                                            : 'border-green-200 dark:border-green-800 focus:border-green-500 dark:focus:border-green-400'
                                    } text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-4 ${
                                        hasError('confirmPassword') 
                                            ? 'focus:ring-red-100 dark:focus:ring-red-900/20' 
                                            : 'focus:ring-green-100 dark:focus:ring-green-900/20'
                                    } disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-all`}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirmPassword')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 focus:outline-none transition-colors"
                                    aria-label={showPassword.confirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword.confirmPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {hasError('confirmPassword') && (
                                <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                    </svg>
                                    {errors.confirmPassword}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Password Requirements Hint */}
                    {touched.password && !errors.password && formData.password && (
                        <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            Password is valid
                        </div>
                    )}

                    {/* Password Strength Indicator */}
                    {formData.password && !errors.password && (
                        <div className="flex gap-1 mt-1">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 flex-1 rounded-full transition-all ${
                                        formData.password.length > 6 + i * 2
                                            ? 'bg-green-500 dark:bg-green-400'
                                            : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Sign Up Button */}
                    <button 
                        type="submit" 
                        className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-600 text-white font-semibold uppercase tracking-wider rounded-lg hover:from-green-700 hover:to-green-600 dark:hover:from-green-400 dark:hover:to-green-500 focus:outline-none focus:ring-4 focus:ring-green-200 dark:focus:ring-green-800 focus:ring-offset-2 dark:focus:ring-offset-black disabled:from-gray-400 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-600 disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-green-500/25 dark:shadow-green-500/10 mt-4"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Account...
                            </span>
                        ) : 'Sign Up'}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-green-200 dark:border-green-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white/80 dark:bg-black/80 px-4 text-green-600 dark:text-green-400">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            className="flex-1 py-3 border-2 border-green-200 dark:border-green-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 focus:outline-none focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            disabled
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button
                            type="button"
                            className="flex-1 py-3 border-2 border-green-200 dark:border-green-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 focus:outline-none focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            disabled
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                            </svg>
                            Facebook
                        </button>
                    </div>

                    {/* Sign In Link */}
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                        <span>Already have an account? </span>
                        <Link href="/signin" className="text-green-600 dark:text-green-400 font-semibold hover:text-green-700 dark:hover:text-green-300 underline underline-offset-2 transition-colors ml-1">
                            Sign In
                        </Link>
                    </div>

                    {/* Terms and Conditions */}
                    <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
                        By signing up, you agree to our{' '}
                        <Link href="/terms" className="text-green-600 dark:text-green-400 hover:underline">
                            Terms
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-green-600 dark:text-green-400 hover:underline">
                            Privacy Policy
                        </Link>
                    </p>

                    {/* Decorative Element */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-200 dark:via-green-800 to-transparent"></div>
                        <span className="text-xs text-green-500 dark:text-green-400">secure signup</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-green-200 dark:via-green-800 to-transparent"></div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;