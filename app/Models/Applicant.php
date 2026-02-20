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
     * Check if applicant is approved.
     */
    public function isApproved(): bool
    {
        return $this->decision === 'approved';
    }

    /**
     * Check if applicant is rejected.
     */
    public function isRejected(): bool
    {
        return $this->decision === 'rejected';
    }

    /**
     * Check if applicant is pending.
     */
    public function isPending(): bool
    {
        return $this->decision === 'pending' || $this->decision === null;
    }

    /**
     * Get the decision badge color.
     */
    public function getDecisionBadgeAttribute(): string
    {
        return match ($this->decision) {
            'approved' => 'success',
            'rejected' => 'danger',
            'pending' => 'warning',
            default => 'secondary'
        };
    }

    /**
     * Get the type badge color.
     */
    public function getTypeBadgeAttribute(): string
    {
        return match ($this->type) {
            'student' => 'primary',
            'guardian' => 'success',
            'other' => 'secondary',
            default => 'secondary'
        };
    }

    /**
     * Get the formatted amount.
     */
    public function getFormattedAmountAttribute(): string
    {
        if (!$this->amount) {
            return '-';
        }
        return 'KES ' . number_format($this->amount, 2);
    }

    /**
     * Get the student name with fallback.
     */
    public function getStudentNameAttribute($value): string
    {
        return $value ?? '-';
    }

    /**
     * Get the parent name with fallback.
     */
    public function getParentNameAttribute($value): string
    {
        return $value ?? '-';
    }

    /**
     * Get the admission number with fallback.
     */
    public function getAdmissionNumberAttribute($value): string
    {
        return $value ?? '-';
    }

    /**
     * Get the parent phone number with fallback.
     */
    public function getParentPhoneNumberAttribute($value): string
    {
        return $value ?? '-';
    }

    /**
     * Get the parent ID number with fallback.
     */
    public function getParentIdNumberAttribute($value): string
    {
        return $value ?? '-';
    }

    /**
     * Get the decision reason with fallback.
     */
    public function getDecisionReasonAttribute($value): string
    {
        return $value ?? '-';
    }

    /**
     * Get the ward name through relationship.
     */
    public function getWardNameAttribute(): string
    {
        return $this->ward?->name ?? '-';
    }

    /**
     * Get the location name through relationship.
     */
    public function getLocationNameAttribute(): string
    {
        return $this->location?->name ?? '-';
    }

    /**
     * Get the institution name through relationship.
     */
    public function getInstitutionNameAttribute(): string
    {
        return $this->institution?->name ?? '-';
    }

    /**
     * Get the full location hierarchy.
     */
    public function getFullLocationAttribute(): string
    {
        $parts = [];
        if ($this->ward) {
            $parts[] = $this->ward->name;
        }
        if ($this->location) {
            $parts[] = $this->location->name;
        }
        return implode(' > ', $parts) ?: '-';
    }

    /**
     * Set the decision to pending if null.
     */
    public function setDecisionAttribute($value): void
    {
        $this->attributes['decision'] = $value ?? 'pending';
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