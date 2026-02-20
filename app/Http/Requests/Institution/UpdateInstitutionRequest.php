<?php

namespace App\Http\Requests\Institution;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInstitutionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:institutions,name,' . $this->route('institution'),
            'category' => 'nullable|string|max:100',
            'is_active' => 'required|boolean'
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The institution name is required.',
            'name.unique' => 'This institution name already exists.',
            'category.required' => 'The category is required.'
        ];
    }
}