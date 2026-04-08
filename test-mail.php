<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

try {
    // Test basic mail configuration
    config([
        'mail.mailers.smtp' => [
            'transport' => 'smtp',
            'host' => 'smtp.gmail.com',
            'port' => 587,
            'encryption' => 'tls',
            'username' => 'benimarushinmon101@gmail.com',
            'password' => 'YOUR-APP-PASSWORD-HERE', // Replace this
            'timeout' => null,
        ],
        'mail.default' => 'smtp',
        'mail.from' => [
            'address' => 'benimarushinmon101@gmail.com',
            'name' => 'Treasury App'
        ]
    ]);

    Mail::raw('Test email from Treasury App', function($message) {
        $message->to('benimarushinmon101@gmail.com')
                ->subject('✅ Email Configuration Test');
    });

    echo "✅ Email sent successfully! Configuration is working.";

} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage();
    echo "\n\nPlease check:\n";
    echo "1. 2FA is enabled on your Google account\n";
    echo "2. You're using an App Password (not regular password)\n";
    echo "3. App Password is correctly copied (16 characters)\n";
}
