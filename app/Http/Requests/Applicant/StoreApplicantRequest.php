<?php

namespace App\Http\Requests\Applicant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreApplicantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ward_id' => ['required', 'exists:wards,id'],
            'location_id' => ['required', 'exists:locations,id'],
            'institution_id' => ['required', 'exists:institutions,id'],
            'student_name' => ['required', 'string', 'max:255'],
            'admission_number' => [
                'required',
                'string',
                'max:100',
                Rule::unique('applicants')->where(function ($query) {
                    return $query->where('institution_id', $this->institution_id);
                })
            ],
            'type' => ['required', Rule::in(config('app.types'))],
            'parent_status' => ['required', Rule::in(config('app.parent_statuses'))],
            'parent_phone_number' => ['required', 'string', 'max:20'],
            'parent_id_number' => ['required', 'string', 'max:50'],
            'amount' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
            'decision' => ['nullable', Rule::in(config('app.decisions'))],
            'decision_reason' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'ward_id.required' => 'The ward field is required.',
            'location_id.required' => 'The location field is required.',
            'student_name.required' => 'The student name field is required.',
            'admission_number.unique' => 'This admission number already exists for the selected institution.',
        ];
    }
}