"use client"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContexts/AuthContexts';


const Header = () => {
    const { user, signout } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const profileMenuRef = useRef(null);

    // navigation items
    const navItems = [
        { name: 'Blogs', path: '/blogs' },
        { name: 'Videos', path: '/videos' },
        { name: 'Photos', path: '/photos' }
    ];

    // handle click outside to close menus
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // handle logout
    const handleLogout = async () => {
        await signout();
        router.push('/');
        setIsProfileMenuOpen(false);
    };

    // get user initials for avatar
    const getUserInitials = () => {
        if (!user?.name) return 'U';
        return user.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-green-200 dark:border-green-800 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    
                    {/* Logo - Left Side */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500 dark:bg-green-400 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
                                <span className="text-white dark:text-black font-bold text-lg sm:text-xl">P</span>
                            </div>
                        </div>
                        <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            Post<span className="text-green-600 dark:text-green-400">Ora</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation - Right Side */}
                    <div className="hidden md:flex items-center gap-8">
                        {/* Nav Links */}
                        <div className="flex items-center gap-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors relative group"
                                >
                                    {item.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 dark:bg-green-400 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                            ))}
                        </div>

                        {/* Auth Section */}
                        {user ? (
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-3 focus:outline-none group"
                                >
                                    {/* User Avatar */}
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 rounded-full flex items-center justify-center text-white dark:text-black font-semibold transform group-hover:scale-105 transition-transform">
                                        {user.profile_picture_url ? (
                                            <img 
                                                src={user.profile_picture_url} 
                                                alt={user.name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            getUserInitials()
                                        )}
                                    </div>
                                    
                                    {/* User Name */}
                                    <span className="text-gray-900 dark:text-white font-medium">
                                        {user.name.split(' ')[0]}
                                    </span>
                                    
                                    {/* Dropdown Icon */}
                                    <svg 
                                        className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Profile Dropdown Menu */}
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800 rounded-lg shadow-xl py-1 z-50">
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/signup"
                                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 text-white dark:text-black font-semibold rounded-lg hover:from-green-700 hover:to-green-600 dark:hover:from-green-400 dark:hover:to-green-500 transform hover:scale-105 transition-all shadow-lg shadow-green-500/25 dark:shadow-green-500/10"
                            >
                                Sign Up
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden relative w-10 h-10 focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <span className={`block w-6 h-0.5 bg-gray-900 dark:bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-1'}`}></span>
                            <span className={`block w-6 h-0.5 bg-gray-900 dark:bg-white transition-all duration-300 my-1 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                            <span className={`block w-6 h-0.5 bg-gray-900 dark:bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'}`}></span>
                        </div>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div 
                        ref={menuRef}
                        className="md:hidden absolute left-0 right-0 top-16 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-green-200 dark:border-green-800 py-4 px-4 shadow-xl"
                    >
                        <div className="flex flex-col gap-3">
                            {/* Mobile Nav Links */}
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium py-2 px-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {/* Mobile Auth Section */}
                            {user ? (
                                <>
                                    <div className="border-t border-green-200 dark:border-green-800 my-2"></div>
                                    <div className="flex items-center gap-3 px-3 py-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 rounded-full flex items-center justify-center text-white dark:text-black font-semibold">
                                            {user.profile_picture_url ? (
                                                <img 
                                                    src={user.profile_picture_url} 
                                                    alt={user.name}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                getUserInitials()
                                            )}
                                        </div>
                                        <span className="text-gray-900 dark:text-white font-medium">
                                            {user.name}
                                        </span>
                                    </div>
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 py-2 px-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 py-2 px-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/signup"
                                    className="mt-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 text-white dark:text-black font-semibold rounded-lg hover:from-green-700 hover:to-green-600 dark:hover:from-green-400 dark:hover:to-green-500 transform hover:scale-105 transition-all shadow-lg shadow-green-500/25 dark:shadow-green-500/10 text-center"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;