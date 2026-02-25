<?php

use App\Models\Institution;
use Carbon\Carbon;

/*
|--------------------------------------------------------------------------
| Helper: Generate Institution Code
|--------------------------------------------------------------------------
| Generates a unique code for an institution based on its name.
| Format: Takes first 3 letters of each word, uppercase, max 10 chars
*/
if (!function_exists('generateInstitutionCode')) {
    function generateInstitutionCode(string $name): string
    {
        // Clean the name - remove special characters
        $cleanName = preg_replace('/[^a-zA-Z0-9\s]/', '', $name);
        $words = explode(' ', $cleanName);

        // Generate base code
        $code = '';
        foreach ($words as $word) {
            $code .= strtoupper(substr($word, 0, 3));
            if (strlen($code) >= 10)
                break;
        }

        // Ensure minimum length
        $code = substr($code, 0, 10);
        if (strlen($code) < 3) {
            $code = 'INST' . rand(100, 999);
        }

        // Check uniqueness and modify if needed
        $originalCode = $code;
        $counter = 1;

        while (Institution::where('code', $code)->exists()) {
            $suffix = (string) $counter;
            $code = substr($originalCode, 0, 10 - strlen($suffix)) . $suffix;
            $counter++;
        }

        return $code;
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Generate Institution Acronym
|--------------------------------------------------------------------------
| Creates an acronym from the institution name (first letter of each word)
| Example: "Aga Khan University" -> "AKU"
*/
if (!function_exists('generateInstitutionAcronym')) {
    function generateInstitutionAcronym(string $name): string
    {
        $words = explode(' ', $name);
        $acronym = '';

        foreach ($words as $word) {
            if (!empty(trim($word))) {
                $acronym .= strtoupper(substr($word, 0, 1));
            }
        }

        // If acronym is too short, use first 3 letters
        if (strlen($acronym) < 2) {
            $acronym = strtoupper(substr($name, 0, 3));
        }

        // Ensure uniqueness
        $originalAcronym = $acronym;
        $counter = 1;

        while (Institution::where('code', $acronym)->exists()) {
            $acronym = $originalAcronym . $counter;
            $counter++;
        }

        return $acronym;
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Format Institution Name
|--------------------------------------------------------------------------
| Standardizes institution name formatting
*/
if (!function_exists('formatInstitutionName')) {
    function formatInstitutionName(string $name): string
    {
        // Remove extra spaces
        $name = preg_replace('/\s+/', ' ', trim($name));

        // Convert to title case (each word first letter uppercase)
        return ucwords(strtolower($name));
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Get Valid Institution Categories
|--------------------------------------------------------------------------
| Returns the list of valid categories (lowercase)
*/
if (!function_exists('getValidInstitutionCategories')) {
    function getValidInstitutionCategories(): array
    {
        return [
            'secondary',
            'polytechnic',
            'college',
            'university',
            'special'
        ];
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Normalize Institution Category
|--------------------------------------------------------------------------
| Converts any case variation to proper lowercase format
| Examples: UNIVERSITY -> university, College -> college, SECONDARY -> secondary
*/
if (!function_exists('normalizeInstitutionCategory')) {
    function normalizeInstitutionCategory(?string $category): ?string
    {
        if (empty($category)) {
            return null;
        }

        // Trim and convert to lowercase for comparison
        $normalized = strtolower(trim($category));

        // Check if it's a valid category
        $validCategories = getValidInstitutionCategories();

        return in_array($normalized, $validCategories, true) ? $normalized : null;
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Validate Institution Category
|--------------------------------------------------------------------------
| Checks if a category is valid (case-insensitive)
| Returns true for: UNIVERSITY, University, university, etc.
*/
if (!function_exists('isValidInstitutionCategory')) {
    function isValidInstitutionCategory(?string $category): bool
    {
        if (empty($category)) {
            return false;
        }

        $normalized = strtolower(trim($category));
        $validCategories = getValidInstitutionCategories();

        return in_array($normalized, $validCategories, true);
    }
}

/*
|--------------------------------------------------------------------------
| Helper: Get Category Display Name
|--------------------------------------------------------------------------
| Returns the category with proper capitalization for display
| Example: 'university' -> 'University', 'secondary' -> 'Secondary'
*/
if (!function_exists('getCategoryDisplayName')) {
    function getCategoryDisplayName(?string $category): string
    {
        if (empty($category)) {
            return '';
        }

        return ucfirst(strtolower(trim($category)));
    }
}

if (!function_exists('settingInfo')) {
    function settingInfo()
    {
        return (object) [
            'financialYear' => '2025/2026',
            'date' => Carbon::parse('2026-03-02')->format('jS M, Y'),
        ];
    }
}