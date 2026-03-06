<?php

namespace App\Http\Controllers;

use App\Models\Applicant;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class VerifyController extends Controller
{
    public function index()
    {
        $institutions = Institution::select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Verify', [
            'institutions' => $institutions
        ]);
    }

    public function verify(Request $request)
    {
        try {
            $request->validate([
                'search' => 'required|string|min:2',
                'type' => 'required|in:admission_number,student_name,parent_id_number,parent_phone_number',
                'institution_id' => 'nullable|exists:institutions,id'
            ]);

            $searchTerm = $request->search;
            $searchType = $request->type;
            $institutionId = $request->institution_id;

            // Check if institution is required for the search type
            $requiresInstitution = in_array($searchType, ['admission_number', 'student_name']);
            if ($requiresInstitution && !$institutionId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Institution selection is required for this search type'
                ], 422);
            }

            $query = Applicant::query();

            // Add institution filter if provided
            if ($institutionId) {
                $query->where('institution_id', $institutionId);
            }

            // Exact match search
            if ($searchType === 'student_name') {
                $query->where($searchType, 'like', '%' . $searchTerm . '%');
            } else {
                $query->where($searchType, $searchTerm);
            }

            // Get results with relationships
            $results = $query->with([
                'ward',
                'location',
                'institution',
            ])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($applicant) {
                    return [
                        'id' => $applicant->id,
                        'student_name' => $applicant->student_name,
                        'admission_number' => $applicant->admission_number,
                        'parent_name' => $applicant->parent_name,
                        'parent_phone_number' => $applicant->parent_phone_number,
                        'parent_id_number' => $applicant->parent_id_number,
                        'type' => $applicant->type,
                        'amount' => $applicant->amount,
                        'decision' => $applicant->decision,
                        'decision_reason' => $applicant->decision_reason,
                        'created_at' => $applicant->created_at ? $applicant->created_at->format('Y-m-d') : null,

                        // Relationships
                        'ward' => $applicant->ward ? [
                            'name' => $applicant->ward->name
                        ] : null,

                        'location' => $applicant->location ? [
                            'name' => $applicant->location->name
                        ] : null,

                        'institution' => $applicant->institution ? [
                            'name' => $applicant->institution->name,
                        ] : null,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $results,
                'count' => $results->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Verification error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during verification. Please try again.'
            ], 500);
        }
    }
}