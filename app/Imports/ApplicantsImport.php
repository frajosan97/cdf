<?php

namespace App\Imports;

use App\Models\Applicant;
use App\Models\Institution;
use App\Models\Ward;
use App\Models\Location;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Validators\Failure;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ApplicantsImport implements
    ToCollection,
    WithHeadingRow,
    WithValidation,
    SkipsOnFailure,
    WithChunkReading,
    WithStartRow
{
    protected $importedCount = 0;
    protected $skippedCount = 0;
    protected $failures = [];
    protected $wardCache = [];
    protected $locationCache = [];
    protected $institutionCache = [];
    protected $createdInstitutions = []; // Track newly created institutions

    /**
     * @param Collection $rows
     */
    public function collection(Collection $rows)
    {
        DB::beginTransaction();

        try {
            foreach ($rows as $index => $row) {
                // Skip empty rows
                if ($this->isEmptyRow($row)) {
                    $this->skippedCount++;
                    continue;
                }

                try {
                    // Single validation function call
                    $validationResult = $this->validateRow($row, $index);

                    if (!$validationResult['valid']) {
                        $this->failures[] = new Failure(
                            $index + 2,
                            'validation',
                            $validationResult['errors'],
                            $row->toArray()
                        );
                        $this->skippedCount++;
                        continue;
                    }

                    // Get IDs from names/values
                    $wardId = $this->getWardId($row['ward']);
                    $locationId = $this->getLocationId($row['location'], $wardId);

                    // This will now create institution if not found (including category)
                    $institutionId = $this->getOrCreateInstitution(
                        $row['institution'] ?? $row['institution_name'] ?? '',
                        $row['category'] ?? null // Pass the category from Excel
                    );

                    // Check if applicant already exists
                    $existingApplicant = Applicant::where('admission_number', $row['admission_number'])
                        ->where('institution_id', $institutionId)
                        ->first();

                    $applicantData = [
                        'ward_id' => $wardId,
                        'location_id' => $locationId,
                        'institution_id' => $institutionId,
                        'type' => strtolower(trim($row['type'])),
                        'student_name' => $row['student_name'] ?? null,
                        'admission_number' => $row['admission_number'],
                        'parent_name' => $row['parent_name'] ?? null,
                        'parent_status' => strtolower(trim($row['parent_status'])),
                        'parent_phone_number' => $row['parent_phone'],
                        'parent_id_number' => $row['parent_id'],
                        'amount' => !empty($row['amount']) ? floatval($row['amount']) : null,
                    ];

                    if ($existingApplicant) {
                        // Update existing applicant
                        $existingApplicant->update($applicantData);
                        Log::info("Updated existing applicant: {$row['admission_number']}");
                    } else {
                        // Create new applicant with pending decision
                        $applicantData['decision'] = 'pending';
                        Applicant::create($applicantData);
                        // Log::info("Created new applicant: {$row['admission_number']}");
                    }

                    $this->importedCount++;

                } catch (\Exception $e) {
                    $this->failures[] = new Failure(
                        $index + 2,
                        'exception',
                        [$e->getMessage()],
                        $row->toArray()
                    );
                    $this->skippedCount++;

                    Log::error('Applicant import row error: ' . $e->getMessage(), [
                        'row' => $row->toArray(),
                        'index' => $index
                    ]);
                }
            }

            DB::commit();

            // Log summary of created institutions
            if (!empty($this->createdInstitutions)) {
                Log::info('New institutions created during import: ' . implode(', ', array_keys($this->createdInstitutions)));
            }

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Applicant import transaction failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Single validation function that handles all validation logic
     */
    protected function validateRow(Collection $row, int $index): array
    {
        $errors = [];
        $data = $row->toArray();

        // Required field validation
        $requiredFields = [
            'ward' => 'Ward',
            'location' => 'Location',
            'institution' => 'Institution',
            'type' => 'Type',
            'admission_number' => 'Admission Number',
            'parent_status' => 'Parent Status',
            'parent_phone' => 'Parent Phone',
            'parent_id' => 'Parent ID Number',
        ];

        foreach ($requiredFields as $field => $label) {
            if (empty($data[$field])) {
                $errors[] = "The {$label} field is required.";
            }
        }

        // If required fields are missing, return early
        if (!empty($errors)) {
            return ['valid' => false, 'errors' => $errors];
        }

        // Type validation
        $validTypes = array_merge(
            config('app.types', []),
            array_map('strtoupper', config('app.types', []))
        );

        if (!in_array(trim($data['type']), $validTypes)) {
            $errors[] = "The selected Type is invalid. Valid types are: " . implode(', ', config('app.types', []));
        }

        // Parent status validation
        $validStatuses = array_merge(
            config('app.parent_statuses', []),
            array_map('strtoupper', config('app.parent_statuses', []))
        );

        if (!in_array(trim($data['parent_status']), $validStatuses)) {
            $errors[] = "The selected Parent Status is invalid. Valid statuses are: " . implode(', ', config('app.parent_statuses', []));
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Get or create institution ID by name (with caching and auto-creation)
     * Now includes category parameter for new institutions
     */
    protected function getOrCreateInstitution(string $institutionName, ?string $category = null): ?int
    {
        $institutionName = trim($institutionName);

        if (empty($institutionName)) {
            return null;
        }

        // Check cache first
        if (isset($this->institutionCache[$institutionName])) {
            return $this->institutionCache[$institutionName];
        }

        // Try to find existing institution (case-insensitive)
        $institution = Institution::where('name', $institutionName)
            ->first();

        if (!$institution) {
            $institution = Institution::whereRaw('LOWER(name) = ?', [strtolower($institutionName)])
                ->first();
        }

        // If still not found, create new institution
        if (!$institution) {
            $institutionData = [
                'name' => $institutionName,
                'code' => generateInstitutionCode($institutionName),
                'type' => $this->determineInstitutionType($institutionName),
                'is_active' => true,
                'contact_email' => null,
                'contact_phone' => null,
                'address' => null,
            ];

            // Add category if provided
            if (!empty($category)) {
                $institutionData['category'] = trim($category);
            }

            $institution = Institution::create($institutionData);

            // Track newly created institution
            $this->createdInstitutions[$institutionName] = [
                'id' => $institution->id,
                'category' => $category ?? 'Not specified'
            ];

            // Log::info("Created new institution during import: {$institutionName} (ID: {$institution->id}, Category: " . ($category ?? 'Not specified') . ")");
        } else {
            // Optionally update category for existing institution if needed
            // You can uncomment this if you want to update categories for existing institutions
            /*
            if (!empty($category) && $institution->category !== $category) {
                $institution->category = $category;
                $institution->save();
                Log::info("Updated category for existing institution: {$institutionName} (ID: {$institution->id}, New Category: {$category})");
            }
            */
        }

        // Cache and return
        $this->institutionCache[$institutionName] = $institution->id;
        return $institution->id;
    }

    /**
     * Determine institution type from name (you can customize this logic)
     */
    protected function determineInstitutionType(string $name): string
    {
        $name = strtolower($name);

        if (str_contains($name, 'university') || str_contains($name, 'univ')) {
            return 'university';
        } elseif (str_contains($name, 'college')) {
            return 'college';
        } elseif (str_contains($name, 'secondary') || str_contains($name, 'high school')) {
            return 'secondary';
        } elseif (str_contains($name, 'primary') || str_contains($name, 'elementary')) {
            return 'primary';
        } elseif (str_contains($name, 'vocational') || str_contains($name, 'technical')) {
            return 'vocational';
        } elseif (str_contains($name, 'polytechnic')) {
            return 'polytechnic';
        } else {
            // Default type from config or 'other'
            return config('app.default_institution_type', 'other');
        }
    }

    /**
     * Required for WithValidation interface - kept for compatibility
     */
    public function rules(): array
    {
        return []; // Empty because we're using custom validation
    }

    /**
     * @return array
     */
    public function customValidationAttributes(): array
    {
        return [
            'ward' => 'Ward',
            'location' => 'Location',
            'institution' => 'Institution',
            'category' => 'Category',
            'type' => 'Type',
            'student_name' => 'Student Name',
            'admission_number' => 'Admission Number',
            'parent_name' => 'Parent Name',
            'parent_status' => 'Parent Status',
            'parent_phone' => 'Parent Phone',
            'parent_id' => 'Parent ID Number',
            'amount' => 'Amount',
        ];
    }

    /**
     * @param Failure ...$failures
     */
    public function onFailure(Failure ...$failures): void
    {
        $this->failures = array_merge($this->failures, $failures);
        $this->skippedCount += count($failures);
    }

    /**
     * @return int
     */
    public function chunkSize(): int
    {
        return 100;
    }

    /**
     * @return int
     */
    public function startRow(): int
    {
        return 2;
    }

    /**
     * Get imported count
     */
    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    /**
     * Get skipped count
     */
    public function getSkippedCount(): int
    {
        return $this->skippedCount;
    }

    /**
     * Get failures
     */
    public function failures(): array
    {
        return $this->failures;
    }

    /**
     * Get newly created institutions with their categories
     */
    public function getCreatedInstitutions(): array
    {
        return $this->createdInstitutions;
    }

    /**
     * Get ward ID by name (with caching)
     */
    protected function getWardId(string $wardName): ?int
    {
        $wardName = trim($wardName);

        if (isset($this->wardCache[$wardName])) {
            return $this->wardCache[$wardName];
        }

        $ward = Ward::firstOrCreate(
            ['name' => $wardName],
            ['name' => $wardName]
        );

        $this->wardCache[$wardName] = $ward->id;
        return $ward->id;
    }

    /**
     * Get location ID by name and ward ID (with caching)
     */
    protected function getLocationId(string $locationName, ?int $wardId): ?int
    {
        if (!$wardId) {
            return null;
        }

        $locationName = trim($locationName);
        $cacheKey = $wardId . '_' . $locationName;

        if (isset($this->locationCache[$cacheKey])) {
            return $this->locationCache[$cacheKey];
        }

        $location = Location::firstOrCreate(
            [
                'name' => $locationName,
                'ward_id' => $wardId
            ],
            [
                'name' => $locationName,
                'ward_id' => $wardId
            ]
        );

        $this->locationCache[$cacheKey] = $location->id;
        return $location->id;
    }

    /**
     * Check if row is empty
     */
    protected function isEmptyRow(Collection $row): bool
    {
        return $row->filter(function ($value) {
            return !is_null($value) && trim($value) !== '';
        })->isEmpty();
    }
}