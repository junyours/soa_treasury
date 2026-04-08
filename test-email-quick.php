<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

try {
    Mail::raw('Test email from Treasury App', function($message) {
        $message->to('treasuryapp0@gmail.com')
                ->subject('✅ Email Configuration Test');
    });

    echo "✅ Email sent successfully! Configuration is working.";

} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
