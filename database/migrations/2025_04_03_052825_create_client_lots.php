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
        Schema::create('client_lots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_payment_id')->constrained()->onDelete('cascade');
            $table->foreignId('lot_id')->constrained();
            $table->integer('custom_price')->nullable(); // Using integer to match your lot price
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_lots');
    }
};