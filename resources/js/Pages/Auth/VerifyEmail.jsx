import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});
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
            window.location.href = route('login');
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    if (isModal) {
        return (
            <>
                <Head title="Email Verification" />
                
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

                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center mb-2">
                            <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <h3 className="text-sm font-medium text-blue-900">Check your email</h3>
                        </div>
                        <p className="text-sm text-blue-700">
                            Thanks for signing up! Before getting started, could you verify
                            your email address by clicking on the link we just emailed to
                            you? If you didn't receive the email, we will gladly send you
                            another.
                        </p>
                    </div>

                    {status === 'verification-link-sent' && (
                        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-800">
                            A new verification link has been sent to the email address
                            you provided during registration.
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <PrimaryButton 
                            className="w-full justify-center py-3 text-base font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors" 
                            disabled={processing}
                        >
                            {processing ? 'Sending...' : 'Resend Verification Email'}
                        </PrimaryButton>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={closeModal}
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
            <Head title="Email Verification" />

            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
                <p className="mt-2 text-sm text-gray-600">Check your inbox for verification link</p>
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                    <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-sm font-medium text-blue-900">Check your email</h3>
                </div>
                <p className="text-sm text-blue-700">
                    Thanks for signing up! Before getting started, could you verify
                    your email address by clicking on the link we just emailed to
                    you? If you didn't receive the email, we will gladly send you
                    another.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <PrimaryButton 
                    className="w-full justify-center py-3 text-base font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors" 
                    disabled={processing}
                >
                    {processing ? 'Sending...' : 'Resend Verification Email'}
                </PrimaryButton>
            </form>

            <div className="mt-6 flex items-center justify-between">
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Log Out
                </Link>
                
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
