import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
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
            window.location.href = route('login');
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    if (isModal) {
        return (
            <>
                <Head title="Reset Password" />
                
                <div className="p-8">
                    <div className="text-center mb-6">
                        <img 
                            src="/images/Untitled.png" 
                            alt="Logo" 
                            className="h-12 w-12 mx-auto mb-4"
                        />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h2>
                        <p className="text-gray-600">Choose a strong password for your account</p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="email" value="Email" className="text-sm font-medium text-gray-700" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                readOnly
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="New Password" className="text-sm font-medium text-gray-700" />
                            <div className="relative">
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                    placeholder="Create a strong password"
                                    autoComplete="new-password"
                                    isFocused={true}
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
                                value="Confirm New Password"
                                className="text-sm font-medium text-gray-700"
                            />
                            <TextInput
                                type="password"
                                id="password_confirmation"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                placeholder="Confirm your new password"
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
                                {processing ? 'Resetting...' : 'Reset Password'}
                            </PrimaryButton>
                        </div>
                    </form>
                    
                    <button
                        onClick={closeModal}
                        className="mt-6 w-full text-gray-500 hover:text-gray-700 text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </>
        );
    }

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Set New Password</h2>
                <p className="mt-2 text-sm text-gray-600">Choose a strong password for your account</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-sm font-medium text-gray-700" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        readOnly
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="New Password" className="text-sm font-medium text-gray-700" />
                    <div className="relative">
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                            placeholder="Create a strong password"
                            autoComplete="new-password"
                            isFocused={true}
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
                        value="Confirm New Password"
                        className="text-sm font-medium text-gray-700"
                    />
                    <TextInput
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                        placeholder="Confirm your new password"
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
                        {processing ? 'Resetting...' : 'Reset Password'}
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
