<?php

namespace App\Http\Controllers;

use App\Models\Applicant;
use App\Models\Institution;
use App\Models\Ward;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\DataTables;
use App\Imports\ApplicantsImport;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Requests\Applicant\StoreApplicantRequest;
use App\Http\Requests\Applicant\UpdateApplicantRequest;
use App\Http\Requests\Applicant\BulkImportRequest;
use App\Exports\ApplicantsExport;
use App\Exports\ApplicantTemplateExport;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ApplicantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->wantsJson()) {
            $query = Applicant::with(['ward', 'location', 'institution']);

            return DataTables::of($query)
                ->addColumn('ward', fn($row) => strtoupper($row->ward?->name) ?? '-')
                ->addColumn('location', fn($row) => strtoupper($row->location?->name) ?? '-')
                ->addColumn('institution', fn($row) => strtoupper($row->institution?->name) ?? '-')
                ->addColumn('actions', fn($row) => view('backend.applicant.actions', compact('row'))->render())
                ->rawColumns(['actions'])
                ->make(true);
        }

        return Inertia::render('Admin/Applicant/Index', [
            'institutions' => $this->getActiveInstitutions(),
            'filters' => $request->only(['type', 'decision', 'institution_id'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Applicant/ApplicantForm', [
            'wards' => Ward::with('locations')->get(),
            'institutions' => $this->getActiveInstitutions(),
            'types' => config('app.types'),
            'parentStatuses' => config('app.parent_statuses')
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreApplicantRequest $request): JsonResponse
    {
        $applicant = Applicant::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Applicant created successfully',
            'data' => $applicant->load('institution', 'ward', 'location')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $applicant = $this->findApplicant($id);

            return Inertia::render('Admin/Applicant/Show', [
                'applicant' => $applicant
            ]);
        } catch (ModelNotFoundException $e) {
            return redirect()->route('app.index')
                ->with('error', 'Applicant not found');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        try {
            $applicant = $this->findApplicant($id);

            return Inertia::render('Admin/Applicant/ApplicantForm', [
                'applicant' => $applicant,
                'wards' => Ward::with('locations')->get(),
                'institutions' => $this->getActiveInstitutions(),
                'types' => config('app.types'),
                'parentStatuses' => config('app.parent_statuses')
            ]);
        } catch (ModelNotFoundException $e) {
            return redirect()->route('app.index')
                ->with('error', 'Applicant not found');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateApplicantRequest $request, string $id): JsonResponse
    {
        try {
            $applicant = $this->findApplicant($id);
            $applicant->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Applicant updated successfully',
                'data' => $applicant->load('institution', 'ward', 'location')
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Applicant not found'
            ], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $applicant = $this->findApplicant($id);
            $applicant->delete();

            return response()->json([
                'success' => true,
                'message' => 'Applicant deleted successfully'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Applicant not found'
            ], 404);
        }
    }

    /**
     * Bulk import applicants from Excel/CSV
     */
    public function bulkImport(BulkImportRequest $request): JsonResponse
    {
        try {
            $import = new ApplicantsImport();
            Excel::import($import, $request->file('file'));

            return response()->json([
                'success' => true,
                'message' => $this->getImportSummaryMessage($import),
                'stats' => [
                    'imported' => $import->getImportedCount(),
                    'skipped' => $import->getSkippedCount(),
                    'failures' => $import->failures()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process bulk import: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download import template
     */
    public function downloadTemplate(): BinaryFileResponse
    {
        return Excel::download(
            new ApplicantTemplateExport(),
            'applicant_import_template.xlsx'
        );
    }

    /**
     * Export applicants to Excel
     */
    public function export(Request $request): BinaryFileResponse
    {
        return Excel::download(
            new ApplicantsExport($request->all()),
            'applicants_export_' . now()->format('Y-m-d_His') . '.xlsx'
        );
    }

    /**
     * Get statistics for dashboard
     */
    public function getStats(): JsonResponse
    {
        $stats = [
            'total' => Applicant::count(),
            'pending' => Applicant::pending()->count(),
            'approved' => Applicant::approved()->count(),
            'rejected' => Applicant::rejected()->count(),
            'total_amount' => number_format(Applicant::sum('amount') ?: 0, 2),
            'by_type' => $this->getStatsByType(),
            'by_institution' => $this->getStatsByInstitution(),
            'by_ward' => $this->getStatsByWard()
        ];

        return response()->json([
            'success' => true,
            'stats' => $stats
        ]);
    }

    /**
     * Find applicant with relations
     */
    private function findApplicant(string $id): Applicant
    {
        return Applicant::with(['institution', 'ward', 'location'])->findOrFail($id);
    }

    /**
     * Get active institutions
     */
    private function getActiveInstitutions()
    {
        return Institution::where('is_active', true)
            ->select('id', 'name', 'category')
            ->orderBy('name')
            ->get();
    }

    /**
     * Get import summary message
     */
    private function getImportSummaryMessage($import): string
    {
        $imported = $import->getImportedCount();
        $skipped = $import->getSkippedCount();

        $message = "Successfully imported {$imported} applicant" . ($imported !== 1 ? 's' : '');

        if ($skipped > 0) {
            $message .= ". {$skipped} row" . ($skipped !== 1 ? 's were' : ' was') . " skipped due to errors.";
        }

        return $message;
    }

    /**
     * Get statistics by type
     */
    private function getStatsByType(): array
    {
        return Applicant::selectRaw('type, count(*) as count')
            ->whereNotNull('type')
            ->groupBy('type')
            ->get()
            ->map(fn($item) => [
                'type' => ucfirst($item->type),
                'count' => $item->count
            ])
            ->toArray();
    }

    /**
     * Get statistics by institution
     */
    private function getStatsByInstitution(): array
    {
        return Applicant::with('institution')
            ->selectRaw('institution_id, count(*) as count')
            ->whereNotNull('institution_id')
            ->groupBy('institution_id')
            ->get()
            ->map(fn($item) => [
                'institution' => $item->institution?->name ?? 'Unknown',
                'count' => $item->count
            ])
            ->toArray();
    }

    /**
     * Get statistics by ward
     */
    private function getStatsByWard(): array
    {
        return Applicant::with('ward')
            ->selectRaw('ward_id, count(*) as count')
            ->whereNotNull('ward_id')
            ->groupBy('ward_id')
            ->get()
            ->map(fn($item) => [
                'ward' => $item->ward?->name ?? 'Unknown',
                'count' => $item->count
            ])
            ->toArray();
    }
}