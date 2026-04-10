import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function FrontPage() {
    // Modal states
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [showVerifyEmailModal, setShowVerifyEmailModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [justVerified, setJustVerified] = useState(false);
    
    // Form states
    const [loginData, setLoginData] = useState({ email: '', password: '', remember: false });
    const [forgotData, setForgotData] = useState({ email: '' });
    const [resetData, setResetData] = useState({ token: '', email: '', password: '', password_confirmation: '' });
    
    // Processing states
    const [loginProcessing, setLoginProcessing] = useState(false);
    const [forgotProcessing, setForgotProcessing] = useState(false);
    const [resetProcessing, setResetProcessing] = useState(false);
    
    // Error states
    const [loginErrors, setLoginErrors] = useState({});
    const [forgotErrors, setForgotErrors] = useState({});
    const [resetErrors, setResetErrors] = useState({});
    
    // Inertia forms
    const { data: registerData, setData: setRegisterData, post: registerPost, processing: registerProcessing, errors: registerErrors, reset: registerReset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    
    // Status messages
    const [forgotStatus, setForgotStatus] = useState('');
    const [verifyStatus, setVerifyStatus] = useState('');

    useEffect(() => {
        // Check URL parameters for login and verified flags
        const urlParams = new URLSearchParams(window.location.search);
        const loginParam = urlParams.get('login');
        const verifiedParam = urlParams.get('verified');
        
        console.log('FrontPage Debug - URL params:', { loginParam, verifiedParam });
        console.log('FrontPage Debug - Full URL:', window.location.href);
        
        if (loginParam === 'true' && verifiedParam === 'true') {
            console.log('FrontPage Debug - Opening login modal with verification success');
            setJustVerified(true);
            setShowLoginModal(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // Check for reset token
        const token = urlParams.get('token');
        const email = urlParams.get('email');
        if (token && email) {
            setResetData({ token, email, password: '', password_confirmation: '' });
            setShowResetPasswordModal(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    // Login handlers
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginProcessing(true);
        setLoginErrors({});

        try {
            // Use FormData for proper Laravel form submission
            const formData = new FormData();
            formData.append('email', loginData.email);
            formData.append('password', loginData.password);
            if (loginData.remember) {
                formData.append('remember', 'on');
            }

            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                },
                body: formData
            });

            if (response.ok) {
                setShowLoginModal(false);
                router.visit('/statement-of-account');
            } else {
                // Try to parse as JSON first, if fails, try as text
                let data;
                try {
                    data = await response.json();
                } catch {
                    const text = await response.text();
                    // Try to extract errors from HTML response
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, 'text/html');
                    const errorElements = doc.querySelectorAll('.text-red-600');
                    if (errorElements.length > 0) {
                        const errors = {};
                        errorElements.forEach(el => {
                            const text = el.textContent.trim();
                            if (text) {
                                errors.email = [text];
                            }
                        });
                        setLoginErrors(errors);
                    } else {
                        setLoginErrors({ email: ['Login failed. Please check your credentials.'] });
                    }
                    return;
                }
                
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
        setLoginData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // Register handlers
    const handleRegisterSubmit = (e) => {
        e.preventDefault();

        registerPost(route('register'), {
            onFinish: () => registerReset('password', 'password_confirmation'),
            onSuccess: () => {
                // Registration successful, show verification modal
                setShowRegisterModal(false);
                setShowVerifyEmailModal(true);
                registerReset();
            }
        });
    };

    // Forgot password handlers
    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setForgotProcessing(true);
        setForgotErrors({});

        try {
            const response = await fetch('/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(forgotData)
            });

            if (response.ok) {
                setForgotStatus('Password reset link sent to your email.');
                setForgotData({ email: '' });
            } else {
                const data = await response.json();
                if (data.errors) {
                    setForgotErrors(data.errors);
                } else if (data.message) {
                    setForgotErrors({ email: [data.message] });
                }
            }
        } catch (error) {
            setForgotErrors({ email: ['An error occurred.'] });
        } finally {
            setForgotProcessing(false);
        }
    };

    const handleForgotInputChange = (e) => {
        const { name, value } = e.target;
        setForgotData(prev => ({ ...prev, [name]: value }));
    };

    // Reset password handlers
    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setResetProcessing(true);
        setResetErrors({});

        try {
            const response = await fetch('/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(resetData)
            });

            if (response.ok) {
                setShowResetPasswordModal(false);
                setShowLoginModal(true);
                setResetData({ token: '', email: '', password: '', password_confirmation: '' });
            } else {
                const data = await response.json();
                if (data.errors) {
                    setResetErrors(data.errors);
                } else if (data.message) {
                    setResetErrors({ password: [data.message] });
                }
            }
        } catch (error) {
            setResetErrors({ password: ['An error occurred.'] });
        } finally {
            setResetProcessing(false);
        }
    };

    const handleResetInputChange = (e) => {
        const { name, value } = e.target;
        setResetData(prev => ({ ...prev, [name]: value }));
    };

    // Resend verification email
    const handleResendVerification = async () => {
        try {
            const response = await fetch('/email/verification-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            if (response.ok) {
                setVerifyStatus('Verification link sent to your email.');
            }
        } catch (error) {
            console.error('Error sending verification:', error);
        }
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
                                    onClick={() => setShowLoginModal(true)}
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

                            {justVerified && (
                                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm text-green-800 font-medium">
                                            Email verified successfully! You can now sign in.
                                        </span>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleLoginSubmit} className="space-y-5">
                                {Object.keys(loginErrors).length > 0 && (
                                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                                        {Object.values(loginErrors).map((error, index) => (
                                            <div key={index}>{error}</div>
                                        ))}
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
                                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => {setShowLoginModal(false); setShowForgotPasswordModal(true);}}
                                        className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
                                    >
                                        Forgot password?
                                    </button>
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
                                        onClick={() => {setShowLoginModal(false); setShowRegisterModal(true);}}
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

                            <form onSubmit={handleRegisterSubmit} className="space-y-5">
                                {Object.keys(registerErrors).length > 0 && (
                                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                                        {Object.values(registerErrors).map((error, index) => (
                                            <div key={index}>{error}</div>
                                        ))}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={registerData.name}
                                        onChange={(e) => setRegisterData('name', e.target.value)}
                                        className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors px-3 py-2 border ${registerErrors.name ? 'border-red-500' : ''}`}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData('email', e.target.value)}
                                        className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors px-3 py-2 border ${registerErrors.email ? 'border-red-500' : ''}`}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={registerData.password}
                                        onChange={(e) => setRegisterData('password', e.target.value)}
                                        className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors px-3 py-2 border ${registerErrors.password ? 'border-red-500' : ''}`}
                                        placeholder="Create a strong password"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        value={registerData.password_confirmation}
                                        onChange={(e) => setRegisterData('password_confirmation', e.target.value)}
                                        className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors px-3 py-2 border ${registerErrors.password_confirmation ? 'border-red-500' : ''}`}
                                        placeholder="Confirm your password"
                                        required
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={registerProcessing}
                                        className="w-full justify-center py-3 text-base font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {registerProcessing ? 'Creating Account...' : 'Create Account'}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => {setShowRegisterModal(false); setShowLoginModal(true);}}
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

            {/* Forgot Password Modal */}
            {showForgotPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="text-center mb-6">
                                <img 
                                    src="/images/Untitled.png" 
                                    alt="Logo" 
                                    className="h-12 w-12 mx-auto mb-4"
                                />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h2>
                                <p className="text-gray-600">Enter your email to reset your password</p>
                            </div>

                            {forgotStatus && (
                                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                                    {forgotStatus}
                                </div>
                            )}

                            <form onSubmit={handleForgotSubmit} className="space-y-5">
                                {Object.keys(forgotErrors).length > 0 && (
                                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                                        {Object.values(forgotErrors).map((error, index) => (
                                            <div key={index}>{error}</div>
                                        ))}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={forgotData.email}
                                        onChange={handleForgotInputChange}
                                        className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors px-3 py-2 border ${forgotErrors.email ? 'border-red-500' : ''}`}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={forgotProcessing}
                                        className="w-full justify-center py-3 text-base font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {forgotProcessing ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => {setShowForgotPasswordModal(false); setShowLoginModal(true);}}
                                    className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
                                >
                                    Back to login
                                </button>
                            </div>
                            
                            <button
                                onClick={() => setShowForgotPasswordModal(false)}
                                className="mt-4 w-full text-gray-500 hover:text-gray-700 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Verify Email Modal */}
            {showVerifyEmailModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="text-center mb-6">
                                <img 
                                    src="/images/Untitled.png" 
                                    alt="Logo" 
                                    className="h-12 w-12 mx-auto mb-4"
                                />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                                <p className="text-gray-600">Check your inbox for verification link</p>
                            </div>

                            <div className="text-center space-y-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <svg className="w-12 h-12 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm text-gray-700">
                                        We've sent a verification email to your registered email address.
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Please check your inbox and click the verification link to continue.
                                    </p>
                                </div>

                                {verifyStatus && (
                                    <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                                        {verifyStatus}
                                    </div>
                                )}

                                <button
                                    onClick={handleResendVerification}
                                    className="w-full justify-center py-2 text-base font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-white"
                                >
                                    Resend Verification Email
                                </button>

                                <div className="text-sm text-gray-600">
                                    Didn't receive the email? Check your spam folder or request a new verification link.
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => {setShowVerifyEmailModal(false); setShowLoginModal(true);}}
                                    className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
                                >
                                    Back to login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="text-center mb-6">
                                <img 
                                    src="/images/Untitled.png" 
                                    alt="Logo" 
                                    className="h-12 w-12 mx-auto mb-4"
                                />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                                <p className="text-gray-600">Enter your new password below</p>
                            </div>

                            <form onSubmit={handleResetSubmit} className="space-y-5">
                                {Object.keys(resetErrors).length > 0 && (
                                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                                        {Object.values(resetErrors).map((error, index) => (
                                            <div key={index}>{error}</div>
                                        ))}
                                    </div>
                                )}

                                <input type="hidden" name="token" value={resetData.token} />
                                <input type="hidden" name="email" value={resetData.email} />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={resetData.password}
                                        onChange={handleResetInputChange}
                                        className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors px-3 py-2 border ${resetErrors.password ? 'border-red-500' : ''}`}
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        value={resetData.password_confirmation}
                                        onChange={handleResetInputChange}
                                        className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors px-3 py-2 border ${resetErrors.password_confirmation ? 'border-red-500' : ''}`}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={resetProcessing}
                                        className="w-full justify-center py-3 text-base font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {resetProcessing ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setShowResetPasswordModal(false)}
                                    className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}