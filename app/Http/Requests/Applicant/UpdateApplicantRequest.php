<?php

namespace App\Http\Requests\Applicant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateApplicantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Get the applicant ID from the route
        $applicantId = $this->route('applicant') ?? $this->route('id');

        return [
            'ward_id' => ['sometimes', 'exists:wards,id'],
            'location_id' => ['sometimes', 'exists:locations,id'],
            'institution_id' => ['sometimes', 'exists:institutions,id'],
            'student_name' => ['sometimes', 'string', 'max:255'],
            'admission_number' => [
                'sometimes',
                'string',
                'max:100',
                Rule::unique('applicants', 'admission_number')
                    ->ignore($applicantId)
                    ->where(function ($query) {
                        if ($this->has('institution_id')) {
                            $query->where('institution_id', $this->institution_id);
                        } else {
                            $applicant = \App\Models\Applicant::find($this->route('applicant') ?? $this->route('id'));
                            if ($applicant) {
                                $query->where('institution_id', $applicant->institution_id);
                            }
                        }
                        return $query;
                    })
            ],
            'type' => ['sometimes', Rule::in(config('app.types'))],
            'parent_status' => ['sometimes', Rule::in(config('app.parent_statuses'))],
            'parent_phone_number' => ['sometimes', 'string', 'max:20'],
            'parent_id_number' => ['sometimes', 'string', 'max:50'],
            'amount' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
            'decision' => ['nullable', Rule::in(config('app.decisions'))],
            'decision_reason' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'admission_number.unique' => 'This admission number already exists for the selected institution.',
        ];
    }
}