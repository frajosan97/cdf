<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin One',
                'email' => 'admin1@gmail.com',
            ],
            [
                'name' => 'Admin Two',
                'email' => 'admin2@gmail.com',
            ],
            [
                'name' => 'Admin Three',
                'email' => 'admin3@gmail.com',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => Hash::make('password'),
                ]
            );
        }
    }
}