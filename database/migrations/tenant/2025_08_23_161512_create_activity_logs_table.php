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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('feature'); // e.g., User, Role, Permission
            $table->string('action'); // e.g., Invite User, Create Role, Delete User
            $table->text('details'); // Detailed description of the action
            $table->foreignId('performed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('performed_at');
            $table->timestamps();

            // Indexes for better performance
            $table->index(['feature', 'action']);
            $table->index('performed_by');
            $table->index('performed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
