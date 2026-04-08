# Email Configuration Test Guide

## Setup Instructions

1. **Configure your .env file** with the following Gmail SMTP settings:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-gmail-address@gmail.com
MAIL_PASSWORD=your-16-character-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="${MAIL_USERNAME}"
MAIL_FROM_NAME="${APP_NAME}"
```

2. **Generate Gmail App Password**:
   - Enable 2-Factor Authentication on your Gmail account
   - Go to Google Account Settings → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail" 
   - Copy the 16-character password and use it as MAIL_PASSWORD

3. **Test the configuration** by running:
   ```bash
   php artisan tinker
   ```
   Then in tinker:
   ```php
   Mail::raw('Test email', function($message) {
       $message->to('test@example.com')->subject('Test Email');
   });
   ```

## Features Implemented

✅ **Email Verification**:
- Users must verify email before accessing dashboard
- Automatic redirect to verification page after registration
- Resend verification email functionality

✅ **Password Reset**:
- Forgot password form with email input
- Password reset link sent via email
- New password form with strength indicator

✅ **Enhanced UI**:
- Modal support for all auth forms
- Consistent styling with Tailwind CSS
- Password strength indicators
- Better user feedback messages

## Testing Flow

1. **Registration Test**:
   - Go to `/register`
   - Fill form and submit
   - Should redirect to `/verify-email`
   - Check email for verification link
   - Click link to verify and access dashboard

2. **Password Reset Test**:
   - Go to `/login` → "Forgot password?"
   - Enter email address
   - Check email for reset link
   - Follow link to set new password
   - Login with new password

## Troubleshooting

If emails don't send:
1. Verify Gmail app password is correct
2. Check if 2FA is enabled on Gmail account
3. Ensure MAIL_FROM_ADDRESS matches MAIL_USERNAME
4. Check Laravel logs: `php artisan log:clear` then try again
