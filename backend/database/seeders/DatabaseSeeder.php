<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Buat Akun Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'), // Password admin
            'role' => 'admin',
        ]);

        // 2. Buat Akun User Biasa (Opsional)
        User::create([
            'name' => 'Mahasiswa 1',
            'email' => 'user@example.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);

        // Setup Default AI Settings (Penting agar Admin Panel tidak error saat pertama dibuka)
        \App\Models\AiSetting::create([
            'system_instruction' => 'You are a helpful AI assistant.',
            'model_name' => 'gemini-2.5-flash',
            'temperature' => 0.7,
            'max_tokens' => 2048
        ]);
    }
}
