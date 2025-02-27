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
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('submission_file_path')->nullable()->after('image_path');
            $table->timestamp('submission_date')->nullable()->after('submission_file_path');
            $table->boolean('is_submission_checked')->default(false)->after('submission_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn([
                'submission_file_path',
                'submission_date',
                'is_submission_checked'
            ]);
        });
    }
};