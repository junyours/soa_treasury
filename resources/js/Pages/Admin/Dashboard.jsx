import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function AdminDashboard({ auth, pendingUsers, approvedUsers, declinedUsers, pendingCount, flash }) {
    const { post, processing, errors } = useForm();
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [declineReason, setDeclineReason] = useState('');

    const handleApprove = (userId) => {
        post(route('admin.users.approve', userId), {
            onSuccess: () => {
                // Success message handled by Inertia
            }
        });
    };

    const handleDecline = (userId) => {
        console.log('handleDecline called with userId:', userId);
        const user = pendingUsers.find(u => u.id === userId);
        console.log('Found user:', user);
        setSelectedUser(user);
        setShowDeclineModal(true);
    };

    const submitDecline = (e) => {
        console.log('submitDecline called');
        e.preventDefault();
        console.log('Selected user ID:', selectedUser?.id);
        console.log('Decline reason:', declineReason);
        
        if (!selectedUser || !declineReason.trim()) {
            console.error('Missing user or reason');
            return;
        }
        
        // Use direct form submission to test data transmission
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('admin.users.decline', selectedUser.id);
        
        // Add CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }
        
        // Add reason field
        const reasonInput = document.createElement('input');
        reasonInput.type = 'hidden';
        reasonInput.name = 'reason';
        reasonInput.value = declineReason;
        form.appendChild(reasonInput);
        
        console.log('Submitting form with data:', { reason: declineReason });
        
        // Submit form
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        // Close modal
        setShowDeclineModal(false);
        setSelectedUser(null);
        setDeclineReason('');
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            {/* Error Display */}
                            {errors && Object.keys(errors).length > 0 && (
                                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <span className="text-sm text-red-800 font-medium">
                                            {Object.values(errors).join(', ')}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Flash Messages */}
                            {flash?.success && (
                                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm text-green-800 font-medium">
                                            {flash.success}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {flash?.error && (
                                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <span className="text-sm text-red-800 font-medium">
                                            {flash.error}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                                    <p className="mt-1 text-sm text-gray-600">Manage user approvals and system administration</p>
                                </div>
                                {pendingCount > 0 && (
                                    <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold">
                                        {pendingCount} Pending Users
                                    </div>
                                )}
                            </div>

                            {/* Pending Users Section */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm mr-2">
                                        {pendingCount}
                                    </span>
                                    Pending User Approvals
                                </h2>
                                
                                {pendingUsers.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500">No pending users to approve.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Email
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Registered
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Email Verified
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {pendingUsers.map((user) => (
                                                    <tr key={user.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {user.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {user.email}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(user.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {user.email_verified_at ? (
                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                    Verified
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                                    Not Verified
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                            <button
                                                                onClick={() => handleApprove(user.id)}
                                                                disabled={processing}
                                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleDecline(user.id)}
                                                                disabled={processing}
                                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                                            >
                                                                Decline
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Recently Approved Users */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recently Approved Users</h2>
                                {approvedUsers.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500">No approved users yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {approvedUsers.map((user) => (
                                            <div key={user.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-semibold">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Recently Declined Users */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recently Declined Users</h2>
                                {declinedUsers.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500">No declined users yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {declinedUsers.map((user) => (
                                            <div key={user.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-semibold">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                        {user.decline_reason && (
                                                            <p className="text-xs text-red-600 mt-1">Reason: {user.decline_reason}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decline Modal */}
            {showDeclineModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Decline User: {selectedUser.name}
                        </h3>
                        <form onSubmit={submitDecline}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for declining
                                </label>
                                <textarea
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    placeholder="Please provide a reason for declining this user..."
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeclineModal(false);
                                        setSelectedUser(null);
                                        setDeclineReason('');
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !declineReason.trim()}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                                >
                                    Decline User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
