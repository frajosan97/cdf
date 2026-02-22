<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Applicant extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'ward_id',
        'location_id',
        'institution_id',
        'financial_year_id',
        'type',
        'student_name',
        'admission_number',
        'parent_name',
        'parent_status',
        'parent_phone_number',
        'parent_id_number',
        'amount',
        'decision',
        'decision_reason',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the ward that owns the applicant.
     */
    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    /**
     * Get the location that owns the applicant.
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get the institution that owns the applicant.
     */
    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function financialYear()
    {
        return $this->belongsTo(FinancialYear::class);
    }

    public function scopeForFinancialYear($query, $financialYearId)
    {
        return $query->where('financial_year_id', $financialYearId);
    }

    public function scopeForActiveFinancialYear($query)
    {
        return $query->whereHas('financialYear', function ($q) {
            $q->where('is_active', true);
        });
    }

    public function scopeForCurrentFinancialYear($query)
    {
        return $query->whereHas('financialYear', function ($q) {
            $q->where('start_date', '<=', now())
                ->where('end_date', '>=', now());
        });
    }

    /**
     * Scope a query to only include pending applicants.
     */
    public function scopePending($query)
    {
        return $query->where('decision', 'pending');
    }

    /**
     * Scope a query to only include approved applicants.
     */
    public function scopeApproved($query)
    {
        return $query->where('decision', 'approved');
    }

    /**
     * Scope a query to only include rejected applicants.
     */
    public function scopeRejected($query)
    {
        return $query->where('decision', 'rejected');
    }

    /**
     * Scope a query to only include applicants by type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include applicants by institution.
     */
    public function scopeByInstitution($query, $institutionId)
    {
        return $query->where('institution_id', $institutionId);
    }

    /**
     * Scope a query to only include applicants by ward.
     */
    public function scopeByWard($query, $wardId)
    {
        return $query->where('ward_id', $wardId);
    }

    /**
     * Scope a query to only include applicants by location.
     */
    public function scopeByLocation($query, $locationId)
    {
        return $query->where('location_id', $locationId);
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($applicant) {
            if (empty($applicant->decision)) {
                $applicant->decision = 'pending';
            }
        });

        static::saving(function ($applicant) {
            // Add any additional logic before saving
        });
    }
}