<?php

namespace App\Http\Controllers;

use App\Imports\InstitutionsImport;
use App\Models\Institution;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Yajra\DataTables\DataTables;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Requests\Institution\StoreInstitutionRequest;
use App\Http\Requests\Institution\UpdateInstitutionRequest;
use App\Http\Requests\Institution\BulkImportRequest;
use App\Exports\InstitutionsExport;
use App\Exports\InstitutionTemplateExport;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

class InstitutionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            if ($request->has('draw')) {
                $query = Institution::query();

                return DataTables::of($query)
                    ->editColumn('name', fn($row) => strtoupper($row->name))
                    ->editColumn('category', fn($row) => $row->category ? ucfirst($row->category) : '-')
                    ->editColumn('is_active', fn($row) => $this->getStatusBadge($row->is_active))
                    ->addColumn('actions', fn($row) => view('backend.institution.actions', compact('row'))->render())
                    ->rawColumns(['actions', 'is_active'])
                    ->make(true);
            }

            return Inertia::render('Admin/Institution/Index', [
                'filters' => $request->only(['category', 'is_active'])
            ]);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return redirect()->route('institution.index')
                ->with('error', 'Institution not found');
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Institution/InstitutionForm', [
            'categories' => config('institution.categories', [
                'secondary',
                'polytechnic',
                'college',
                'university',
                'special'
            ])
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInstitutionRequest $request): JsonResponse
    {
        $institution = Institution::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Institution created successfully',
            'data' => $institution
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $institution = $this->findInstitution($id);

            return response()->json([
                'success' => true,
                'institution' => $institution
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Institution not found'
            ], 404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        try {
            $institution = $this->findInstitution($id);

            return Inertia::render('Admin/Institution/InstitutionForm', [
                'institution' => $institution,
                'categories' => config('institution.categories', [
                    'secondary',
                    'polytechnic',
                    'college',
                    'university',
                    'special'
                ])
            ]);
        } catch (ModelNotFoundException $e) {
            return redirect()->route('institution.index')
                ->with('error', 'Institution not found');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInstitutionRequest $request, string $id): JsonResponse
    {
        try {
            $institution = $this->findInstitution($id);
            $institution->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Institution updated successfully',
                'data' => $institution
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Institution not found'
            ], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $institution = $this->findInstitution($id);

            // Check if institution has applicants
            if ($institution->applicants()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete institution with associated applicants'
                ], 422);
            }

            $institution->delete();

            return response()->json([
                'success' => true,
                'message' => 'Institution deleted successfully'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Institution not found'
            ], 404);
        }
    }

    /**
     * Bulk import institutions from Excel/CSV
     */
    public function bulkImport(BulkImportRequest $request): JsonResponse
    {
        try {
            $import = new InstitutionsImport();
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
            new InstitutionTemplateExport(),
            'institution_import_template.xlsx'
        );
    }

    /**
     * Export institutions to Excel
     */
    public function export(Request $request): BinaryFileResponse
    {
        return Excel::download(
            new InstitutionsExport($request->all()),
            'institutions_export_' . now()->format('Y-m-d_His') . '.xlsx'
        );
    }

    /**
     * Get statistics for dashboard
     */
    public function getStats(): JsonResponse
    {
        $stats = [
            'total' => Institution::count(),
            'active' => Institution::where('is_active', true)->count(),
            'inactive' => Institution::where('is_active', false)->count(),
            'by_category' => $this->getStatsByCategory(),
            'recent_additions' => Institution::where('created_at', '>=', now()->subDays(30))->count()
        ];

        return response()->json([
            'success' => true,
            'stats' => $stats
        ]);
    }

    /**
     * Find institution by ID
     */
    private function findInstitution(string $id): Institution
    {
        return Institution::withCount('applicants')->findOrFail($id);
    }

    /**
     * Get import summary message
     */
    private function getImportSummaryMessage($import): string
    {
        $imported = $import->getImportedCount();
        $skipped = $import->getSkippedCount();

        $message = "Successfully imported {$imported} institution" . ($imported !== 1 ? 's' : '');

        if ($skipped > 0) {
            $message .= ". {$skipped} row" . ($skipped !== 1 ? 's were' : ' was') . " skipped due to errors.";
        }

        return $message;
    }

    /**
     * Get statistics by category
     */
    private function getStatsByCategory(): array
    {
        return Institution::selectRaw('category, count(*) as count')
            ->whereNotNull('category')
            ->groupBy('category')
            ->get()
            ->map(fn($item) => [
                'category' => ucfirst($item->category),
                'count' => $item->count
            ])
            ->toArray();
    }

    /**
     * Get status badge HTML
     */
    private function getStatusBadge(bool $isActive): string
    {
        $badgeClass = $isActive ? 'bg-success' : 'bg-danger';
        $status = $isActive ? 'Active' : 'Inactive';

        return '<span class="badge ' . $badgeClass . '">' . $status . '</span>';
    }
}