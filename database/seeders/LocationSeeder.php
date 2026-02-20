<?php

namespace Database\Seeders;

use App\Models\Ward;
use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            "mbitini" => ["katwala", "kitungati", "mbitini", "ngangani", "kanzau"],
            "kisasi" => ["kavisuni", "kisasi", "maliku", "mbusyani", "mosa", "ngiluni", "nguuni", "mukameni"],
            "kwa vonza/yatta" => ["ilika", "kanyonyoo", "kaw'ongo", "kwa vonza", "nthongoni", "yatta"],
            "kanyangi" => ["kalulini", "kanyangi", "kanyongonyo", "kiseuni", "ngomoni", "nzambia"],
            "other" => ["other"]
        ];

        foreach ($data as $wardName => $locations) {

            $ward = Ward::where('name', ucfirst($wardName))->first();

            if (!$ward) {
                continue;
            }

            foreach ($locations as $locationName) {
                Location::create([
                    'ward_id' => $ward->id,
                    'name' => ucfirst($locationName),
                ]);
            }
        }
    }
}
