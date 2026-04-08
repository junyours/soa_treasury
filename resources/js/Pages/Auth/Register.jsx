import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Register({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [isModal, setIsModal] = useState(false);
    const { url } = usePage();

    useEffect(() => {
        // Check if we're in modal mode by checking if there's a referring page
        const referrer = document.referrer;
        const currentUrl = window.location.href;
        
        // Debug logging
        console.log('Register Debug - Referrer:', referrer);
        console.log('Register Debug - Current URL:', currentUrl);
        console.log('Register Debug - Origin:', window.location.origin);
        
        // Multiple ways to detect modal mode
        const hasModalFlag = currentUrl.includes('modal=true');
        const isFromFrontPage = referrer && (referrer.includes(window.location.origin + '/') || referrer.endsWith('/'));
        const isInIframe = window.parent !== window;
        
        console.log('Register Debug - Has modal flag:', hasModalFlag);
        console.log('Register Debug - Is from front page:', isFromFrontPage);
        console.log('Register Debug - Is in iframe:', isInIframe);
        
        // If any of the modal detection conditions are true
        if (hasModalFlag || isFromFrontPage || isInIframe) {
            setIsModal(true);
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
            onSuccess: () => {
                if (isModal) {
                    // Close modal and redirect to dashboard
                    window.parent.postMessage({ type: 'register-success' }, '*');
                }
            }
        });
    };

    const closeModal = () => {
        if (isModal) {
            window.parent.postMessage({ type: 'close-modal' }, '*');
        } else {
            // Navigate back or to home
            window.history.back();
        }
    };

    const switchToLogin = () => {
        if (isModal) {
            window.parent.postMessage({ type: 'switch-to-login' }, '*');
        } else {
            window.location.href = route('login');
        }
    };

    // If in modal mode, render modal content without GuestLayout
    if (isModal) {
        return (
            <>
                <Head title="Register" />

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

                    {status && (
                        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-800">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="name" value="Full Name" className="text-sm font-medium text-gray-700" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                placeholder="Enter your full name"
                                autoComplete="name"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email Address" className="text-sm font-medium text-gray-700" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                placeholder="Enter your email"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" className="text-sm font-medium text-gray-700" />
                            <div className="relative">
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                    placeholder="Create a strong password"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mt-2">
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                data.password.length === 0 ? 'w-0' :
                                                data.password.length < 6 ? 'w-1/3 bg-red-500' :
                                                data.password.length < 10 ? 'w-2/3 bg-yellow-500' :
                                                'w-full bg-green-500'
                                            }`}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {data.password.length === 0 ? 'Enter password' :
                                         data.password.length < 6 ? 'Weak' :
                                         data.password.length < 10 ? 'Medium' :
                                         'Strong'}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Use 8+ characters with a mix of letters, numbers & symbols
                                </p>
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Confirm Password"
                                className="text-sm font-medium text-gray-700"
                            />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData('password_confirmation', e.target.value)
                                }
                                required
                            />
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        <div className="pt-2">
                            <PrimaryButton 
                                className="w-full justify-center py-3 text-base font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors" 
                                disabled={processing}
                            >
                                {processing ? 'Creating account...' : 'Create account'}
                            </PrimaryButton>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                onClick={switchToLogin}
                                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                            >
                                Sign in here
                            </button>
                        </p>
                    </div>

                    <button
                        onClick={closeModal}
                        className="mt-4 w-full text-gray-500 hover:text-gray-700 text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </>
        );
    }

    // Standalone mode with GuestLayout
    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                <p className="mt-2 text-sm text-gray-600">Join us and start managing your finances</p>
            </div>

            {status && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-800">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="name" value="Full Name" className="text-sm font-medium text-gray-700" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                        placeholder="Enter your full name"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="text-sm font-medium text-gray-700" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                        placeholder="Enter your email"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-sm font-medium text-gray-700" />
                    <div className="relative">
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                            placeholder="Create a strong password"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                    </div>
                    <div className="mt-2">
                        <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        data.password.length === 0 ? 'w-0' :
                                        data.password.length < 6 ? 'w-1/3 bg-red-500' :
                                        data.password.length < 10 ? 'w-2/3 bg-yellow-500' :
                                        'w-full bg-green-500'
                                    }`}
                                />
                            </div>
                            <span className="text-xs text-gray-500">
                                {data.password.length === 0 ? 'Enter password' :
                                 data.password.length < 6 ? 'Weak' :
                                 data.password.length < 10 ? 'Medium' :
                                 'Strong'}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Use 8+ characters with a mix of letters, numbers & symbols
                        </p>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className="text-sm font-medium text-gray-700"
                    />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="pt-2">
                    <PrimaryButton 
                        className="w-full justify-center py-3 text-base font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors" 
                        disabled={processing}
                    >
                        {processing ? 'Creating account...' : 'Create account'}
                    </PrimaryButton>
                </div>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                        href={route('login')}
                        className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                        Sign in here
                    </Link>
                </p>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                    By creating an account, you agree to our{' '}
                    <Link href="#" className="text-indigo-600 hover:text-indigo-500">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="#" className="text-indigo-600 hover:text-indigo-500">
                        Privacy Policy
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
