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
        Schema::table('users', function (Blueprint $table) {
            // Rename 'name' column to 'first_name'
            $table->renameColumn('name', 'first_name');
            
            // Add new columns
            $table->string('last_name')->after('first_name');
            $table->string('middle_initial')->nullable()->after('first_name');
            $table->integer('age')->nullable()->after('last_name');
            $table->string('role')->default('agent')->after('email'); // For storing user roles (admin, intern, agent)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Reverse the changes
            $table->renameColumn('first_name', 'name');
            $table->dropColumn(['middle_initial', 'last_name', 'age', 'role']);
        });
    }
};