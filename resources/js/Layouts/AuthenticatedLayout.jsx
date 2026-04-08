import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    // Clear statement of account data when user logs out
    const handleLogout = (e) => {
        e.preventDefault();
        
        // Clear all statement of account related localStorage items
        localStorage.removeItem('statementOfAccountData');
        localStorage.removeItem('enviFee');
        localStorage.removeItem('preparedBy');
        localStorage.removeItem('certifiedCorrectBy');
        
        // Use Inertia's router for logout with proper CSRF handling
        router.post(route('logout'), {}, {
            onSuccess: (page) => {
                // Force redirect to front page after successful logout
                window.location.href = '/';
            },
            onError: (errors) => {
                // If there's an error, still try to redirect to front page
                window.location.href = '/';
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
            {/* Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                <div className="flex flex-col flex-grow bg-white/95 backdrop-blur-sm border-r border-gray-200/60 pt-5 pb-4 overflow-y-auto shadow-lg">
                    <div className="flex items-center flex-shrink-0 px-4">
                        
                            <img src="/images/Untitled.png" alt="Logo" className="h-12 w-12 object-contain rounded-lg shadow-sm" />
                            <div className="ml-3">
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Municipal Treasurer's Office</span>
                                <p className="text-xs text-gray-500 mt-0.5">Opol, Misamis Oriental</p>
                            </div>

                    </div>
                    <div className="mt-8 flex-1 flex flex-col">
                        <nav className="flex-1 px-2 space-y-1">
                            <NavLink
                                href={route('statement-of-account')}
                                active={route().current('statement-of-account')}
                                className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50/70"
                            >
                                <svg className="text-gray-400 mr-3 h-5 w-5 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="group-hover:translate-x-0.5 transition-transform">Statement of Account</span>
                            </NavLink>
                            <NavLink
                                href={route('saved-statements')}
                                active={route().current('saved-statements')}
                                className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50/70"
                            >
                                <svg className="text-gray-400 mr-3 h-5 w-5 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                <span className="group-hover:translate-x-0.5 transition-transform">Saved Statements</span>
                            </NavLink>
                        </nav>
                        
                        {/* User profile section at bottom */}
                        <div className="flex-shrink-0 flex border-t border-gray-200/60 p-4">
                            <div className="flex-shrink-0 w-full group block">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                                        <span className="text-sm font-semibold text-white">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-gray-500 group-hover:text-gray-600">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-1">
                                    <ResponsiveNavLink href={route('profile.edit')} className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                                        Profile
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        onClick={(e) => handleLogout(e)}
                                        as="button"
                                        className="block w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:text-red-900 hover:bg-red-50 transition-colors"
                                    >
                                        Log Out
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="md:pl-64 flex flex-col flex-1">
                {/* Mobile top navigation */}
                <div className="md:hidden">
                    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/60 shadow-sm">
                        <div className="px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 justify-between items-center">
                                <div className="flex items-center">
                                    <Link href="/" className="flex items-center space-x-3">
                                        <img src="/images/Untitled.png" alt="Logo" className="h-8 w-8 object-contain rounded-lg shadow-sm" />
                                        <div>
                                            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MTO</span>
                                            <p className="text-xs text-gray-500 -mt-1">Opol</p>
                                        </div>
                                    </Link>
                                </div>

                                <div className="flex items-center">
                                    <div className="relative">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-full border border-gray-200/60 bg-white/80 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                >
                                                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2">
                                                        <span className="text-xs font-semibold text-white">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    {user.name}
                                                </button>
                                            </Dropdown.Trigger>

                                            <Dropdown.Content>
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                                <Dropdown.Link href={route('profile.edit')}>
                                                    Profile
                                                </Dropdown.Link>
                                                <Dropdown.Link
                                                onClick={(e) => handleLogout(e)}
                                                as="button"
                                                className="text-red-600 hover:bg-red-50"
                                            >
                                                Log Out
                                            </Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile navigation */}
                    <div className="border-b border-gray-200/60 bg-white/95 backdrop-blur-sm">
                        <div className="px-2 py-2 space-y-1">
                                                        <ResponsiveNavLink
                                href={route('statement-of-account')}    
                                active={route().current('statement-of-account')}
                            >
                                Statement of Account
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('saved-statements')}
                                active={route().current('saved-statements')}
                            >
                                Saved Statements
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>

                {/* Desktop header */}
                <div className="hidden md:block">
                    {header && (
                        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/60">
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </header>
                    )}
                </div>

                {/* Page content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
