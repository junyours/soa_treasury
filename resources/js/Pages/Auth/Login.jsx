// import Checkbox from '@/Components/Checkbox';
// import InputError from '@/Components/InputError';
// import InputLabel from '@/Components/InputLabel';
// import PrimaryButton from '@/Components/PrimaryButton';
// import TextInput from '@/Components/TextInput';
// import GuestLayout from '@/Layouts/GuestLayout';
// import { Head, Link, useForm, usePage } from '@inertiajs/react';
// import { useState, useEffect } from 'react';

// export default function Login({ status, canResetPassword }) {
//     const { data, setData, post, processing, errors, reset } = useForm({
//         email: '',
//         password: '',
//         remember: false,
//     });

//     const [isModal, setIsModal] = useState(false);
//     const { url } = usePage();

//     useEffect(() => {
//         // Check if we're in modal mode by checking if there's a referring page
//         const referrer = document.referrer;
//         const currentUrl = window.location.href;
        
//         // Multiple ways to detect modal mode
//         const hasModalFlag = currentUrl.includes('modal=true');
//         const isFromFrontPage = referrer && (referrer.includes(window.location.origin + '/') || referrer.endsWith('/'));
//         const isInIframe = window.parent !== window;
        
//         // Force modal mode if in iframe or has modal flag
//         if (isInIframe || hasModalFlag) {
//             setIsModal(true);
//         }
//     }, []);

//     const submit = (e) => {
//         e.preventDefault();

//         post(route('login'), {
//             onFinish: () => reset('password'),
//             onSuccess: () => {
//                 if (isModal) {
//                     // Close modal and redirect to dashboard
//                     window.parent.postMessage({ type: 'login-success' }, '*');
//                 }
//             }
//         });
//     };

//     const closeModal = () => {
//         if (isModal) {
//             window.parent.postMessage({ type: 'close-modal' }, '*');
//         } else {
//             // Navigate back or to home
//             window.history.back();
//         }
//     };

//     const switchToRegister = () => {
//         if (isModal) {
//             window.parent.postMessage({ type: 'switch-to-register' }, '*');
//         } else {
//             window.location.href = route('register');
//         }
//     };

//     // If in modal mode, render modal content without GuestLayout
//     if (isModal) {
//         return (
//             <>
//                 <Head title="Log in" />
                
//                 <div className="p-8">
//                     <div className="text-center mb-6">
//                         <img 
//                             src="/images/Untitled.png" 
//                             alt="Logo" 
//                             className="h-12 w-12 mx-auto mb-4"
//                         />
//                         <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
//                         <p className="text-gray-600">Sign in to your account</p>
//                     </div>

//                     {status && (
//                         <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-800">
//                             {status}
//                         </div>
//                     )}

//                     {errors.message && (
//                         <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
//                             {errors.message}
//                         </div>
//                     )}

//                     <form onSubmit={submit} className="space-y-5">
//                         <div>
//                             <InputLabel htmlFor="email" value="Email Address" className="text-sm font-medium text-gray-700" />
//                             <TextInput
//                                 id="email"
//                                 type="email"
//                                 name="email"
//                                 value={data.email}
//                                 className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
//                                 placeholder="Enter your email"
//                                 autoComplete="username"
//                                 isFocused={true}
//                                 onChange={(e) => setData('email', e.target.value)}
//                             />
//                             <InputError message={errors.email} className="mt-2" />
//                         </div>

//                         <div>
//                             <InputLabel htmlFor="password" value="Password" className="text-sm font-medium text-gray-700" />
//                             <TextInput
//                                 id="password"
//                                 type="password"
//                                 name="password"
//                                 value={data.password}
//                                 className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
//                                 placeholder="Enter your password"
//                                 autoComplete="current-password"
//                                 onChange={(e) => setData('password', e.target.value)}
//                             />
//                             <InputError message={errors.password} className="mt-2" />
//                         </div>

//                         <div className="flex items-center justify-between">
//                             <label className="flex items-center">
//                                 <Checkbox
//                                     name="remember"
//                                     checked={data.remember}
//                                     onChange={(e) =>
//                                         setData('remember', e.target.checked)
//                                     }
//                                     className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                                 />
//                                 <span className="ml-2 text-sm text-gray-600">
//                                     Remember me
//                                 </span>
//                             </label>

//                             {canResetPassword && (
//                                 <Link
//                                     href={route('password.request')}
//                                     className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
//                                 >
//                                     Forgot password?
//                                 </Link>
//                             )}
//                         </div>

//                         <div className="pt-2">
//                             <PrimaryButton 
//                                 className="w-full justify-center py-3 text-base font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors" 
//                                 disabled={processing}
//                             >
//                                 {processing ? 'Signing in...' : 'Sign in'}
//                             </PrimaryButton>
//                         </div>
//                     </form>

//                     <div className="mt-6 text-center">
//                         <p className="text-sm text-gray-600">
//                             Don't have an account?{' '}
//                             <button
//                                 onClick={switchToRegister}
//                                 className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
//                             >
//                                 Sign up for free
//                             </button>
//                         </p>
//                     </div>
                    
//                     <button
//                         onClick={closeModal}
//                         className="mt-4 w-full text-gray-500 hover:text-gray-700 text-sm"
//                     >
//                         Cancel
//                     </button>
//                 </div>
//             </>
//         );
//     }

//     // Standalone mode with GuestLayout
//     return (
//         <GuestLayout>
//             <Head title="Log in" />

//             <div className="text-center mb-6">
//                 <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
//                 <p className="mt-2 text-sm text-gray-600">Sign in to your account to continue</p>
//             </div>

//             {status && (
//                 <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-800">
//                     {status}
//                 </div>
//             )}

//             {errors.message && (
//                 <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
//                     {errors.message}
//                 </div>
//             )}

//             <form onSubmit={submit} className="space-y-5">
//                 <div>
//                     <InputLabel htmlFor="email" value="Email Address" className="text-sm font-medium text-gray-700" />
//                     <TextInput
//                         id="email"
//                         type="email"
//                         name="email"
//                         value={data.email}
//                         className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
//                         placeholder="Enter your email"
//                         autoComplete="username"
//                         isFocused={true}
//                         onChange={(e) => setData('email', e.target.value)}
//                     />
//                     <InputError message={errors.email} className="mt-2" />
//                 </div>

//                 <div>
//                     <InputLabel htmlFor="password" value="Password" className="text-sm font-medium text-gray-700" />
//                     <TextInput
//                         id="password"
//                         type="password"
//                         name="password"
//                         value={data.password}
//                         className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
//                         placeholder="Enter your password"
//                         autoComplete="current-password"
//                         onChange={(e) => setData('password', e.target.value)}
//                     />
//                     <InputError message={errors.password} className="mt-2" />
//                 </div>

//                 <div className="flex items-center justify-between">
//                     <label className="flex items-center">
//                         <Checkbox
//                             name="remember"
//                             checked={data.remember}
//                             onChange={(e) =>
//                                 setData('remember', e.target.checked)
//                             }
//                             className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                         />
//                         <span className="ml-2 text-sm text-gray-600">
//                             Remember me
//                         </span>
//                     </label>

//                     {canResetPassword && (
//                         <Link
//                             href={route('password.request')}
//                             className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
//                         >
//                             Forgot password?
//                         </Link>
//                     )}
//                 </div>

//                 <div className="pt-2">
//                     <PrimaryButton 
//                         className="w-full justify-center py-3 text-base font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors" 
//                         disabled={processing}
//                     >
//                         {processing ? 'Signing in...' : 'Sign in'}
//                     </PrimaryButton>
//                 </div>
//             </form>

//             <div className="mt-6 text-center">
//                 <p className="text-sm text-gray-600">
//                     Don't have an account?{' '}
//                     <Link
//                         href={route('register')}
//                         className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
//                     >
//                         Sign up for free
//                     </Link>
//                 </p>
//             </div>
//         </GuestLayout>
//     );
// }