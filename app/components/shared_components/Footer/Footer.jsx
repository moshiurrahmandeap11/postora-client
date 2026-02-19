"use client"
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContexts/AuthContexts';


const Footer = () => {
    const { user } = useAuth();
    const currentYear = new Date().getFullYear();

    // ফুটার নেভিগেশন লিংক
    const footerLinks = {
        company: [
            { name: 'About Us', path: '/about' },
            { name: 'Careers', path: '/careers' },
            { name: 'Press', path: '/press' },
            { name: 'Blog', path: '/blogs' }
        ],
        resources: [
            { name: 'Community', path: '/community' },
            { name: 'Help Center', path: '/help' },
            { name: 'Support', path: '/support' },
            { name: 'Contact', path: '/contact' }
        ],
        legal: [
            { name: 'Privacy Policy', path: '/privacy' },
            { name: 'Terms of Service', path: '/terms' },
            { name: 'Cookie Policy', path: '/cookies' },
            { name: 'Disclaimer', path: '/disclaimer' }
        ],
        social: [
            { 
                name: 'Twitter', 
                path: 'https://twitter.com',
                icon: (className) => (
                    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                )
            },
            { 
                name: 'Facebook', 
                path: 'https://facebook.com',
                icon: (className) => (
                    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                )
            },
            { 
                name: 'Instagram', 
                path: 'https://instagram.com',
                icon: (className) => (
                    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                    </svg>
                )
            },
            { 
                name: 'LinkedIn', 
                path: 'https://linkedin.com',
                icon: (className) => (
                    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                )
            }
        ]
    };

    // নিউজলেটার সাবস্ক্রাইব
    const handleSubscribe = (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        // টোস্ট বা নোটিফিকেশন যোগ করতে পারেন
        alert(`Thanks for subscribing with: ${email}`);
        e.target.reset();
    };

    return (
        <footer className="bg-white dark:bg-black border-t border-green-200 dark:border-green-800">
            {/* মূল ফুটার কন্টেন্ট */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                
                {/* টপ সেকশন - গ্রিড লেআউট */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
                    
                    {/* কোম্পানি ইনফো + লোগো */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 group mb-4">
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
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                            Discover amazing stories, share your thoughts, and connect with writers from around the world. Join our growing community today.
                        </p>
                        
                        {/* ইউজার কাউন্ট (ঐচ্ছিক) */}
                        {user && (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                                <span>Join 10,000+ readers</span>
                            </div>
                        )}
                    </div>

                    {/* কোম্পানি লিংক */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                            Company
                        </h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.path}
                                        className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* রিসোর্স লিংক */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                            Resources
                        </h3>
                        <ul className="space-y-2">
                            {footerLinks.resources.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.path}
                                        className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* লিগাল লিংক */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                            Legal
                        </h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        href={link.path}
                                        className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* নিউজলেটার সেকশন */}
                <div className="mt-12 pt-8 border-t border-green-200 dark:border-green-800">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                Subscribe to our newsletter
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Get the latest posts delivered right to your inbox.
                            </p>
                        </div>
                        
                        <form onSubmit={handleSubscribe} className="flex w-full md:w-auto">
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    required
                                    className="flex-1 min-w-[250px] px-4 py-2.5 bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 transition-all"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 text-white dark:text-black font-semibold rounded-lg hover:from-green-700 hover:to-green-600 dark:hover:from-green-400 dark:hover:to-green-500 transform hover:scale-105 transition-all shadow-lg shadow-green-500/25 dark:shadow-green-500/10 whitespace-nowrap"
                                >
                                    Subscribe
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* সোশ্যাল মিডিয়া + কপিরাইট */}
                <div className="mt-8 pt-8 border-t border-green-200 dark:border-green-800">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        
                        {/* সোশ্যাল মিডিয়া আইকন */}
                        <div className="flex items-center gap-4">
                            {footerLinks.social.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-all transform hover:scale-110"
                                    aria-label={`Follow us on ${social.name}`}
                                >
                                    {social.icon('w-5 h-5')}
                                </a>
                            ))}
                        </div>

                        {/* কপিরাইট টেক্সট */}
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span>© {currentYear} Postora. All rights reserved.</span>
                            <span className="mx-2">•</span>
                            <span>Developed  </span>
                            <span> by Moshiur Rahman</span>
                        </div>

                        {/* ব্যাক টু টপ বাটন */}
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/30 transition-all transform hover:scale-110 group"
                            aria-label="Back to top"
                        >
                            <svg className="w-5 h-5 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* ডেকোরেটিভ ওয়েভ (ঐচ্ছিক) */}
            <div className="relative h-1 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-200 via-green-400 to-green-200 dark:from-green-800 dark:via-green-600 dark:to-green-800 animate-gradient"></div>
            </div>

            <style jsx>{`
                @keyframes gradient {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-gradient {
                    animation: gradient 2s infinite linear;
                }
            `}</style>
        </footer>
    );
};

export default Footer;