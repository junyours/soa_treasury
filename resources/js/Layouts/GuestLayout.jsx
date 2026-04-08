import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <div className="mb-4">
                            <ApplicationLogo className="mx-auto h-16 w-16 fill-current text-indigo-600 transition-transform hover:scale-110" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Treasury App</h1>
                        <p className="mt-2 text-sm text-gray-600">Manage your finances with ease</p>
                    </Link>
                </div>

                <div className="w-full overflow-hidden bg-white/80 backdrop-blur-sm px-8 py-6 shadow-xl sm:rounded-2xl border border-white/20">
                    {children}
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>&copy; 2024 Treasury App. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
