<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('statement_of_accounts', function (Blueprint $table) {
            $table->string('certified_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('statement_of_accounts', function (Blueprint $table) {
            $table->dropColumn('certified_by');
        });
    }
};
