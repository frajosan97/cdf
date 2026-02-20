<?php

namespace App\Imports;

use App\Models\Institution;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Validators\Failure;

class InstitutionsImport implements
    ToModel,
    WithHeadingRow,
    WithValidation,
    SkipsOnFailure,
    WithChunkReading
{
    use SkipsFailures; // This already provides $failures property

    private $importedCount = 0;
    private $skippedCount = 0;
    private $processedNames = [];

    // DON'T redeclare $failures here - it's already provided by SkipsFailures trait

    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        // Format the institution name using helper
        $institutionName = formatInstitutionName($row['name'] ?? '');

        // Skip if name is empty after cleaning
        if (empty($institutionName)) {
            $this->skippedCount++;
            return null;
        }

        // Check if already processed in this import
        if (in_array($institutionName, $this->processedNames)) {
            $this->skippedCount++;
            return null;
        }

        // Normalize category (handles any case: UNIVERSITY, University, university)
        $category = !empty($row['category'])
            ? normalizeInstitutionCategory($row['category'])
            : null;

        // Validate category using helper (case-insensitive)
        if (!empty($row['category']) && !isValidInstitutionCategory($row['category'])) {
            // Use onFailure method or add to the trait's failures
            $this->onFailure(new Failure(
                $this->importedCount + $this->skippedCount + 2, // Row number
                'category',
                ['Invalid category. Must be one of: ' . implode(', ', getValidInstitutionCategories())],
                $row
            ));
            $this->skippedCount++;
            return null;
        }

        // Check if institution already exists (case-insensitive)
        $existingInstitution = Institution::whereRaw('LOWER(name) = ?', [strtolower($institutionName)])->first();

        if ($existingInstitution) {
            $this->skippedCount++;
            return null;
        }

        // Generate unique code using helper
        $code = generateInstitutionCode($institutionName);

        // Mark as processed for this import
        $this->processedNames[] = $institutionName;
        $this->importedCount++;

        // Create new institution with normalized category
        return new Institution([
            'name' => $institutionName,
            'code' => $code,
            'category' => $category, // Already normalized to lowercase
            'is_active' => true,
        ]);
    }

    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'category' => 'nullable|string',
        ];
    }

    /**
     * @return array
     */
    public function customValidationMessages()
    {
        return [
            'name.required' => 'Institution name is required',
        ];
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
    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    /**
     * @return int
     */
    public function getSkippedCount(): int
    {
        return $this->skippedCount;
    }

    /**
     * Get failures - this method is already provided by SkipsFailures trait
     * but you can override it if needed
     */
    // public function failures(): array
    // {
    //     return $this->failures; // $this->failures comes from the trait
    // }
}