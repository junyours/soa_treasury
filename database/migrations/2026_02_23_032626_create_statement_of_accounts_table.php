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
        Schema::create('statement_of_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('batch_id')->nullable(); // For grouping multiple entries under one document
            $table->string('declared_owner')->nullable();
            $table->string('location')->nullable();
            $table->string('block_lot_no')->nullable();
            $table->string('tax_dec_no')->nullable();
            $table->string('kind')->nullable();
            $table->decimal('assessed_value', 15, 2)->default(0);
            $table->string('payment_year')->nullable();
            $table->integer('no_of_years')->default(1);
            $table->decimal('full_payment', 15, 2)->default(0);
            $table->decimal('penalty_discount', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->decimal('envi_fee', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('statement_of_accounts');
    }
};
