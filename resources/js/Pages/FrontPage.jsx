import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function FrontPage() {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    
    // Login form state
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
        remember: false
    });
    const [loginErrors, setLoginErrors] = useState({});
    const [loginProcessing, setLoginProcessing] = useState(false);

    useEffect(() => {
        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    useEffect(() => {
        // Listen for messages from modal windows
        const handleMessage = (event) => {
            switch (event.data.type) {
                case 'close-modal':
                    setShowLoginModal(false);
                    setShowRegisterModal(false);
                    break;
                case 'switch-to-register':
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                    break;
                case 'switch-to-login':
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                    break;
                case 'login-success':
                case 'register-success':
                    // Close modal and redirect to statement-of-account
                    setShowLoginModal(false);
                    setShowRegisterModal(false);
                    router.visit('/statement-of-account');
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const openLoginModal = () => {
        setShowLoginModal(true);
    };

    const openRegisterModal = () => {
        setShowRegisterModal(true);
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginProcessing(true);
        setLoginErrors({});

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(loginData)
            });

            if (response.ok) {
                // Login successful, redirect to statement-of-account
                setShowLoginModal(false);
                router.visit('/statement-of-account');
            } else {
                const data = await response.json();
                if (data.errors) {
                    setLoginErrors(data.errors);
                } else if (data.message) {
                    setLoginErrors({ email: [data.message] });
                }
            }
        } catch (error) {
            setLoginErrors({ email: ['An error occurred during login.'] });
        } finally {
            setLoginProcessing(false);
        }
    };

    const handleLoginInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <>
            <Head title="Municipality of Opol - Treasury Office" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                {/* Navigation */}
                <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-3">
                                <img 
                                    src="/images/Untitled.png" 
                                    alt="Municipality of Opol Logo" 
                                    className="h-8 w-8 object-contain"
                                />
                                <div className="hidden sm:block">
                                    <span className="font-semibold text-gray-900">Municipal Treasury Office</span>
                                    <div className="text-xs text-gray-500">Province of Misamis Oriental</div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={openLoginModal}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Sign In
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="relative px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Logo */}
                        <div className="mb-8">
                            <img 
                                src="/images/Untitled.png" 
                                alt="Municipality of Opol Logo" 
                                className="h-24 w-24 mx-auto object-contain"
                            />
                        </div>

                        {/* Main Titles */}
                        <div className="space-y-4 mb-8">
                            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                                Municipality of Opol
                            </h1>
                            <h2 className="text-2xl md:text-4xl font-semibold text-gray-700">
                                Province of Misamis Oriental
                            </h2>
                            <div className="text-xl md:text-2xl font-medium text-blue-600">
                                Municipal Treasury Office
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
                            Modern digital treasury management for the Municipality of Opol. 
                            Access your tax records, manage payments, and streamline your financial operations.
                        </p>
                    </div>
                </div>

                {/* Features Section */}
                <div className="bg-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Treasury Services
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Everything you need to manage your municipal financial requirements
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tax Records</h3>
                                <p className="text-gray-600">
                                    View and manage your property tax records and statements online
                                </p>
                            </div>

                            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6m9 4h-4a1 1 0 01-1-1v-1m0-4V8a2 2 0 012-2h4a2 2 0 012 2v4" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Management</h3>
                                <p className="text-gray-600">
                                    Manage your personal and property information securely
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="flex justify-center items-center mb-6 space-x-3">
                                <img 
                                    src="/images/Untitled.png" 
                                    alt="Municipality of Opol Logo" 
                                    className="h-10 w-10 object-contain"
                                />
                                <div>
                                    <span className="font-semibold">Municipality of Opol</span>
                                    <div className="text-sm text-gray-400">Treasury Office</div>
                                </div>
                            </div>
                            <p className="text-gray-400 mb-2">
                                © 2026 Municipal Treasury Office. Province of Misamis Oriental
                            </p>
                            <p className="text-gray-500 text-sm">
                                Serving the community with excellence and integrity
                            </p>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="text-center mb-6">
                                <img 
                                    src="/images/Untitled.png" 
                                    alt="Logo" 
                                    className="h-12 w-12 mx-auto mb-4"
                                />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                                <p className="text-gray-600">Sign in to your account</p>
                            </div>

                            <form onSubmit={handleLoginSubmit} className="space-y-5">
                                {loginErrors.message && (
                                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                                        {loginErrors.message}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={loginData.email}
                                        onChange={handleLoginInputChange}
                                        className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors px-3 py-2 border ${loginErrors.email ? 'border-red-500' : ''}`}
                                        placeholder="Enter your email"
                                        required
                                    />
                                    {loginErrors.email && (
                                        <p className="mt-2 text-sm text-red-600">{loginErrors.email[0]}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={loginData.password}
                                        onChange={handleLoginInputChange}
                                        className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors px-3 py-2 border ${loginErrors.password ? 'border-red-500' : ''}`}
                                        placeholder="Enter your password"
                                        required
                                    />
                                    {loginErrors.password && (
                                        <p className="mt-2 text-sm text-red-600">{loginErrors.password[0]}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            checked={loginData.remember}
                                            onChange={handleLoginInputChange}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-600">
                                            Remember me
                                        </span>
                                    </label>

                                    <a
                                        href="/forgot-password"
                                        className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
                                    >
                                        Forgot password?
                                    </a>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loginProcessing}
                                        className="w-full justify-center py-3 text-base font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loginProcessing ? 'Signing in...' : 'Sign in'}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => {
                                            setShowLoginModal(false);
                                            openRegisterModal();
                                        }}
                                        className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                                    >
                                        Sign up for free
                                    </button>
                                </p>
                            </div>
                            
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="mt-4 w-full text-gray-500 hover:text-gray-700 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Register Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="text-center mb-6">
                                <img 
                                    src="/images/Untitled.png" 
                                    alt="Logo" 
                                    className="h-12 w-12 mx-auto mb-4"
                                />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
                                <p className="text-gray-600">Join us and start managing your finances</p>
                            </div>

                            <form className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors px-3 py-2 border"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors px-3 py-2 border"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors px-3 py-2 border"
                                        placeholder="Create a strong password"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors px-3 py-2 border"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full justify-center py-3 text-base font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-white"
                                    >
                                        Create account
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => {
                                            setShowRegisterModal(false);
                                            openLoginModal();
                                        }}
                                        className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                                    >
                                        Sign in here
                                    </button>
                                </p>
                            </div>

                            <button
                                onClick={() => setShowRegisterModal(false)}
                                className="mt-4 w-full text-gray-500 hover:text-gray-700 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}