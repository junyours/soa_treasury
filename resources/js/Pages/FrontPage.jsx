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
        const emailVerifiedParam = urlParams.get('email_verified');
        const verifyEmailParam = urlParams.get('verify_email');
        
        console.log('FrontPage Debug - URL params:', { loginParam, verifiedParam, emailVerifiedParam, verifyEmailParam });
        console.log('FrontPage Debug - Full URL:', window.location.href);
        
        if (loginParam === 'true' && verifiedParam === 'true') {
            console.log('FrontPage Debug - Opening login modal with verification success');
            setJustVerified(true);
            setShowLoginModal(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // Handle email verification (new flow - requires admin approval)
        if (emailVerifiedParam === 'true') {
            console.log('FrontPage Debug - Email verified, showing approval pending modal');
            setShowVerifyEmailModal(true);
            setVerifyStatus('Email verified successfully! Your account is now pending administrator approval. You will receive an email once your account is approved.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // Handle email verification prompt (after registration)
        if (verifyEmailParam === 'true') {
            console.log('FrontPage Debug - Showing email verification prompt');
            setShowVerifyEmailModal(true);
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

    // Client-side validation for login
    const validateLoginForm = () => {
        const errors = {};
        
        // Email validation
        if (!loginData.email) {
            errors.email = ['Email address is required.'];
        } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
            errors.email = ['Please enter a valid email address.'];
        }
        
        // Password validation
        if (!loginData.password) {
            errors.password = ['Password is required.'];
        } else if (loginData.password.length < 8) {
            errors.password = ['Password must be at least 8 characters long.'];
        }
        
        return errors;
    };

    // Login handlers
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        setLoginErrors({});
        
        // Client-side validation
        const clientErrors = validateLoginForm();
        if (Object.keys(clientErrors).length > 0) {
            setLoginErrors(clientErrors);
            return;
        }
        
        setLoginProcessing(true);

        const attemptLogin = async (useFreshToken = false) => {
            try {
                // Get CSRF token
                let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                
                // If we need a fresh token, refresh it first
                if (useFreshToken) {
                    const freshToken = await refreshCsrfToken();
                    if (freshToken) {
                        csrfToken = freshToken;
                    }
                }
                
                if (!csrfToken) {
                    setLoginErrors({ email: ['Security token missing. Please refresh the page and try again.'] });
                    return false;
                }

                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: loginData.email,
                        password: loginData.password,
                        remember: loginData.remember
                    })
                });

                if (response.ok) {
                    setShowLoginModal(false);
                    router.visit('/statement-of-account');
                    return true;
                } else {
                    // Try to parse as JSON first
                    let data;
                    try {
                        data = await response.json();
                    } catch {
                        // If JSON parsing fails, try to extract errors from HTML response
                        const text = await response.text();
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(text, 'text/html');
                        const errorElements = doc.querySelectorAll('.text-red-600, .alert-danger');
                        
                        if (errorElements.length > 0) {
                            const errors = {};
                            errorElements.forEach(el => {
                                const text = el.textContent.trim();
                                if (text && !text.includes('The password field is required.') && !text.includes('The email field is required.')) {
                                    errors.email = [text];
                                }
                            });
                            setLoginErrors(errors);
                        } else {
                            setLoginErrors({ email: ['Login failed. Please check your email and password and try again.'] });
                        }
                        return false;
                    }
                    
                    if (data.errors) {
                        setLoginErrors(data.errors);
                    } else if (data.message) {
                        // Check for CSRF mismatch specifically
                        if (data.message.includes('CSRF token mismatch') || data.message.includes('csrf')) {
                            if (!useFreshToken) {
                                // Try again with fresh token
                                return await attemptLogin(true);
                            } else {
                                setLoginErrors({ email: ['Security token error. Please refresh the page and try again.'] });
                            }
                        }
                        // Check for specific approval-related messages
                        else if (data.message.includes('pending approval')) {
                            setLoginErrors({ 
                                email: ['Your account is pending approval by the administrator. You will receive an email once your account is approved.'],
                                approvalStatus: 'pending'
                            });
                        } else if (data.message.includes('declined')) {
                            setLoginErrors({ 
                                email: [data.message],
                                approvalStatus: 'declined'
                            });
                        } else {
                            setLoginErrors({ email: [data.message] });
                        }
                    } else {
                        // Handle different HTTP status codes with specific messages
                        if (response.status === 419) { // CSRF token mismatch
                            if (!useFreshToken) {
                                return await attemptLogin(true);
                            } else {
                                setLoginErrors({ email: ['Security token error. Please refresh the page and try again.'] });
                            }
                        } else if (response.status === 422) {
                            setLoginErrors({ email: ['Invalid credentials. Please check your email and password.'] });
                        } else if (response.status === 429) {
                            setLoginErrors({ email: ['Too many login attempts. Please try again later.'] });
                        } else if (response.status === 401) {
                            setLoginErrors({ email: ['Invalid email or password. Please try again.'] });
                        } else {
                            setLoginErrors({ email: ['Login failed. Please check your credentials and try again.'] });
                        }
                    }
                    return false;
                }
            } catch (error) {
                console.error('Login error:', error);
                setLoginErrors({ email: ['Network error. Please check your connection and try again.'] });
                return false;
            }
        };

        await attemptLogin();
        setLoginProcessing(false);
    };

    const handleLoginInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLoginData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        
        // Clear field-specific errors when user starts typing
        if (loginErrors[name]) {
            setLoginErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
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

    // Refresh CSRF token
    const refreshCsrfToken = async () => {
        try {
            const response = await fetch('/csrf-token', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                // Update the meta tag with fresh token
                const metaTag = document.querySelector('meta[name="csrf-token"]');
                if (metaTag && data.token) {
                    metaTag.setAttribute('content', data.token);
                    return data.token;
                }
            }
            return null;
        } catch (error) {
            console.error('Error refreshing CSRF token:', error);
            return null;
        }
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
                                    src="/images/Opol-logo real.png" 
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
                <div className="relative min-h-screen flex items-center justify-center px-6 lg:px-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.05),transparent_70%)]"></div>
                    
                    <div className="relative z-10 w-full max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            
                            {/* Left Side - Logo and Visual Elements */}
                            <div className="lg:col-span-5 text-center lg:text-left flex items-center justify-center">
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 blur-3xl rounded-full"></div>
                                    <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/30">
                                        <img 
                                            src="/images/Opol-logo real.png" 
                                            alt="Municipality of Opol Logo" 
                                            className="h-96 w-96 object-contain"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Side - Content */}
                            <div className="lg:col-span-7 text-center lg:text-left space-y-8">
                                {/* Location Info */}
                                <div className="space-y-1 mt-0">
                                    <p className="text-sm text-gray-500 font-medium tracking-[0.4em] uppercase">
                                        Municipality of Opol
                                    </p>
                                    <p className="text-xs text-gray-400 tracking-wide">
                                        Province of Misamis Oriental
                                    </p>
                                </div>
                                
                                {/* Main Title */}
                                <div className="space-y-2">
                                    <h1 className="text-7xl md:text-8xl lg:text-8xl font-black text-gray-900 leading-none tracking-tight">
                                        MUNICIPAL
                                    </h1>
                                    <h2 className="text-6xl md:text-7xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 leading-none tracking-tight">
                                        TREASURY OFFICE
                                    </h2>
                                </div>
                                
                                {/* Description */}
                                <div className="max-w-2xl">
                                    <p className="text-xl text-gray-600 leading-relaxed">
                                        Modern digital treasury management for the Municipality of Opol. 
                                        Access your tax records, manage payments, and streamline your financial operations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            {/* <div className="flex justify-center items-center mb-6 space-x-3">
                                <img 
                                    src="/images/Opol-logo real.png" 
                                    alt="Municipality of Opol Logo" 
                                    className="h-10 w-10 object-contain"
                                />
                                <div>
                                    <span className="font-semibold">Municipality of Opol</span>
                                    <div className="text-sm text-gray-400">Treasury Office</div>
                                </div>
                            </div> */}
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
                                    src="/images/Opol-logo real.png" 
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
                                {/* Approval Status Messages */}
                                {loginErrors.approvalStatus === 'pending' && (
                                    <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div>
                                                <p className="font-medium">Account Pending Approval</p>
                                                <p className="text-xs mt-1">Your account is waiting for administrator approval. You'll be notified once approved.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {loginErrors.approvalStatus === 'declined' && (
                                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <div>
                                                <p className="font-medium">Account Declined</p>
                                                <p className="text-xs mt-1">{loginErrors.email[0]}</p>
                                                <p className="text-xs mt-2 text-blue-700">
                                                    You can register again with the same email address.
                                                    <button
                                                        onClick={() => {setShowLoginModal(false); setShowRegisterModal(true);}}
                                                        className="ml-1 underline hover:text-blue-800 transition-colors"
                                                    >
                                                        Click here to register
                                                    </button>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Global error message */}
                                {loginErrors.email && Array.isArray(loginErrors.email) && loginErrors.email.some(msg => msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('csrf') || msg.toLowerCase().includes('security')) && !loginErrors.approvalStatus && (
                                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <span>{loginErrors.email.find(msg => msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('csrf') || msg.toLowerCase().includes('security'))}</span>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            name="email"
                                            value={loginData.email}
                                            onChange={handleLoginInputChange}
                                            className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors px-3 py-2 border ${loginErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                                            placeholder="Enter your email"
                                            required
                                        />
                                        {loginErrors.email && !loginErrors.email.some(msg => msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('network')) && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {loginErrors.email && !loginErrors.email.some(msg => msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('failed') || msg.toLowerCase().includes('network')) && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {loginErrors.email.find(msg => !msg.toLowerCase().includes('invalid') && !msg.toLowerCase().includes('failed') && !msg.toLowerCase().includes('network'))}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            name="password"
                                            value={loginData.password}
                                            onChange={handleLoginInputChange}
                                            className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors px-3 py-2 border ${loginErrors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                                            placeholder="Enter your password"
                                            required
                                        />
                                        {loginErrors.password && (
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {loginErrors.password && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {loginErrors.password[0]}
                                        </p>
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
                                    src="/images/Opol-logo real.png" 
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
                                    src="/images/Opol-logo real.png" 
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
                                    src="/images/Opol-logo real.png" 
                                    alt="Logo" 
                                    className="h-12 w-12 mx-auto mb-4"
                                />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {verifyStatus && verifyStatus.includes('pending administrator approval') ? 'Email Verified' : 'Verify Your Email'}
                                </h2>
                                <p className="text-gray-600">
                                    {verifyStatus && verifyStatus.includes('pending administrator approval') 
                                        ? 'Your email has been successfully verified' 
                                        : 'Check your inbox for verification link'}
                                </p>
                            </div>

                            <div className="text-center space-y-4">
                                {verifyStatus && verifyStatus.includes('pending administrator approval') ? (
                                    <div className="bg-yellow-50 rounded-lg p-4">
                                        <svg className="w-12 h-12 text-yellow-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-gray-700 font-medium">
                                            Email verified successfully!
                                        </p>
                                        <p className="text-xs text-gray-600 mt-2">
                                            Your account is now pending administrator approval. You will receive an email once your account is approved.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <svg className="w-12 h-12 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm text-gray-700">
                                            We've sent a verification email to your registered email address.
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Please check your inbox and click verification link to continue.
                                        </p>
                                    </div>
                                )}

                                {verifyStatus && (
                                    <div className={`rounded-lg border px-4 py-3 text-sm ${
                                        verifyStatus.includes('pending administrator approval') 
                                            ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                                            : 'bg-green-50 border-green-200 text-green-800'
                                    }`}>
                                        {verifyStatus}
                                    </div>
                                )}

                                {!verifyStatus || !verifyStatus.includes('pending administrator approval') ? (
                                    <>
                                        <button
                                            onClick={handleResendVerification}
                                            className="w-full justify-center py-2 text-base font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-white"
                                        >
                                            Resend Verification Email
                                        </button>

                                        <div className="text-sm text-gray-600">
                                            Didn't receive the email? Check your spam folder or request a new verification link.
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-sm text-gray-600">
                                        You can close this window and wait for the administrator to approve your account.
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setShowVerifyEmailModal(false)}
                                    className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
                                >
                                    {verifyStatus && verifyStatus.includes('pending administrator approval') ? 'Close' : 'Back to login'}
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
                                    src="/images/Opol-logo real.png" 
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