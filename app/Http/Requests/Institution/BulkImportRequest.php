<?php

namespace App\Http\Requests\Institution;

use Illuminate\Foundation\Http\FormRequest;

class BulkImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240'
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Please select a file to import.',
            'file.mimes' => 'The file must be an Excel or CSV file.',
            'file.max' => 'The file size must not exceed 10MB.'
        ];
    }
}