<?php

namespace Database\Seeders;

use App\Models\Ward;
use Illuminate\Database\Seeder;

class WardSeeder extends Seeder
{
    public function run(): void
    {
        $wards = [
            "mbitini",
            "kisasi",
            "kwa vonza/yatta",
            "kanyangi",
            "other",
        ];

        foreach ($wards as $ward) {
            Ward::create([
                'name' => ucfirst($ward),
            ]);
        }
    }
}
