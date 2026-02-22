<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinancialYear extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'release_date',
        'is_active',
        'is_closed',
        'description'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'release_date' => 'date',
        'is_active' => 'boolean',
        'is_closed' => 'boolean'
    ];

    // Relationships with all bursary-related models
    public function applications()
    {
        return $this->hasMany(Applicant::class);
    }

    // Scope for active financial year
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope for current financial year (based on date)
    public function scopeCurrent($query)
    {
        return $query->where('start_date', '<=', now())
            ->where('end_date', '>=', now());
    }

    // Get the financial year where release date matches
    public function scopeWithReleaseDate($query, $date)
    {
        return $query->whereDate('release_date', $date);
    }

    // Get upcoming releases
    public function scopeUpcomingReleases($query)
    {
        return $query->where('release_date', '>=', now())
            ->where('is_closed', false);
    }

    // Get past releases
    public function scopePastReleases($query)
    {
        return $query->where('release_date', '<', now());
    }
}