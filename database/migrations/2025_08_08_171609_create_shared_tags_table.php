<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shared_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // The user it is shared WITH
            $table->string('permission_level')->default('view'); // e.g., view, edit
            $table->timestamps();

            // A user can only have a specific tag shared with them once.
            $table->unique(['tag_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shared_tags');
    }
};
