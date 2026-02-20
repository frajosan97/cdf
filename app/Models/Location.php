<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'ward_id',
        'name'
    ];

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function applicants()
    {
        return $this->hasMany(Applicant::class);
    }
}