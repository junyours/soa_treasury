import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const [isModal, setIsModal] = useState(false);

    useEffect(() => {
        const referrer = document.referrer;
        const currentUrl = window.location.href;
        
        if (referrer.includes('/front') || currentUrl.includes('modal=true')) {
            setIsModal(true);
        }
    }, []);

    const closeModal = () => {
        if (isModal) {
            window.parent.postMessage({ type: 'close-modal' }, '*');
        } else {
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

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    if (isModal) {
        return (
            <>
                <Head title="Forgot Password" />
                
                <div className="p-8">
                    <div className="text-center mb-6">
                        <img 
                            src="/images/Untitled.png" 
                            alt="Logo" 
                            className="h-12 w-12 mx-auto mb-4"
                        />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                        <p className="text-gray-600">Enter your email to receive a reset link</p>
                    </div>

                    <div className="mb-4 text-sm text-gray-600">
                        Forgot your password? No problem. Just let us know your email
                        address and we will email you a password reset link that will
                        allow you to choose a new one.
                    </div>

                    {status && (
                        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-800">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="email" value="Email Address" className="text-sm font-medium text-gray-700" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                placeholder="Enter your email"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div className="pt-2">
                            <PrimaryButton 
                                className="w-full justify-center py-3 text-base font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors" 
                                disabled={processing}
                            >
                                {processing ? 'Sending...' : 'Email Password Reset Link'}
                            </PrimaryButton>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={switchToLogin}
                            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                            Back to Sign in
                        </button>
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

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
                <p className="mt-2 text-sm text-gray-600">Enter your email to receive a password reset link</p>
            </div>

            <div className="mb-4 text-sm text-gray-600">
                Forgot your password? No problem. Just let us know your email
                address and we will email you a password reset link that will
                allow you to choose a new one.
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="text-sm font-medium text-gray-700" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                        placeholder="Enter your email"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="pt-2">
                    <PrimaryButton 
                        className="w-full justify-center py-3 text-base font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors" 
                        disabled={processing}
                    >
                        {processing ? 'Sending...' : 'Email Password Reset Link'}
                    </PrimaryButton>
                </div>
            </form>

            <div className="mt-6 text-center">
                <Link
                    href={route('login')}
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                    Back to Sign in
                </Link>
            </div>
        </GuestLayout>
    );
}
