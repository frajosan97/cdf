<?php

namespace App\Http\Controllers;

use App\Exports\VoucherExport;
use App\Exports\WardsExport;
use App\Exports\LocationsExport;
use App\Models\Applicant;
use App\Models\Institution;
use App\Models\Ward;
use App\Models\Location;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function index()
    {
        try {
            $institutions = Institution::where('is_active', true)->get(['id', 'name', 'code']);
            $wards = Ward::withCount('applicants')->get(['id', 'name']);
            $locations = Location::with('ward')->get(['id', 'name', 'ward_id']);

            return Inertia::render('Admin/Report/Index', [
                'institutions' => $institutions,
                'wards' => $wards,
                'locations' => $locations,
                'stats' => [
                    'total_approved' => Applicant::where('decision', 'approved')->count(),
                    'total_pending' => Applicant::where('decision', 'pending')->count(),
                    'total_rejected' => Applicant::where('decision', 'rejected')->count(),
                    'total_bursary' => Applicant::where('decision', 'approved')->sum('amount'),
                ]
            ]);
        } catch (\Throwable $th) {
            Log::error($th->getMessage());
            return redirect()->back()->with('error', 'Something went wrong. Please try again.');
        }
    }

    public function forwardingLetter(Request $request, $institution_id = null)
    {
        try {

            // Base query with approved applicants
            $query = Institution::with([
                'applicants' => function ($q) {
                    $q->where('decision', 'approved')
                        ->with(['ward', 'location']);
                }
            ])->where('is_active', true);

            // If specific institution requested
            if ($institution_id) {
                $query->where('id', $institution_id);
            }

            // Always return a collection of institutions
            $institutions = $query->get();

            $settings = settingInfo();

            // Unified structure
            $data = [
                'institutions' => $institutions,
                'type' => $institution_id ? 'single' : 'multiple',
            ];

            // Generate PDF
            $pdf = Pdf::loadView('reports.forwarding-letter', $data);

            return Inertia::render('Admin/Report/ForwardingLetter', [
                'data' => $data,
                'pdf' => base64_encode($pdf->output()),
                'institutions' => Institution::where('is_active', true)
                    ->get(['id', 'name', 'code'])
            ]);

        } catch (\Throwable $th) {
            Log::error($th->getMessage());
            return redirect()->back()->with('error', 'Something went wrong. Please try again.');
        }
    }

    public function previewForwardingLetter(Request $request)
    {
        $institutions = Institution::where('is_active', true)->get(['id', 'name', 'code']);
        $approvedApplicants = Applicant::with(['ward', 'location', 'institution'])
            ->where('decision', 'approved')
            ->get();

        // Group applicants by institution
        $groupedApplicants = $approvedApplicants->groupBy('institution_id');

        // Generate PDF for preview
        $data = [
            'applicants' => $approvedApplicants,
            'groupedApplicants' => $groupedApplicants,
            'date' => now()->format('F j, Y'),
            'reference' => 'KR/BURSARY/' . now()->year . '/' . str_pad(mt_rand(1, 999), 3, '0', STR_PAD_LEFT),
            'type' => 'preview'
        ];

        $pdf = Pdf::loadView('reports.forwarding-letter', $data);

        return Inertia::render('Admin/Report/ForwardingLetter', [
            'institutions' => $institutions,
            'approvedApplicants' => $approvedApplicants,
            'groupedApplicants' => $groupedApplicants,
            'pdf' => base64_encode($pdf->output()),
            'data' => $data
        ]);
    }

    public function voucher(Request $request)
    {
        $filters = $request->validate([
            'institution_id' => 'nullable|exists:institutions,id',
            'ward_id' => 'nullable|exists:wards,id',
            'location_id' => 'nullable|exists:locations,id',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $fileName = strtoupper('kitui_rural_bursary_vouchers_' . now()->format('Y-m_d')) . '.xlsx';

        return Excel::download(new VoucherExport($filters), $fileName);
    }

    public function wardsList(Request $request)
    {
        $format = $request->get('format', 'excel');

        if ($format === 'pdf') {
            $wards = Ward::with(['locations', 'applicants'])->get();
            $pdf = Pdf::loadView('reports.wards-list', [
                'wards' => $wards
            ]);

            if ($request->get('view') === 'inline') {
                return Inertia::render('Admin/Report/PdfViewer', [
                    'pdf' => base64_encode($pdf->output()),
                    'title' => 'Wards List'
                ]);
            }

            return $pdf->download('wards-list.pdf');
        }

        return Excel::download(new WardsExport(), 'wards-list.xlsx');
    }

    public function locationsList(Request $request)
    {
        $format = $request->get('format', 'excel');

        if ($format === 'pdf') {
            $locations = Location::with(['ward', 'applicants'])->get();
            $pdf = Pdf::loadView('reports.locations-list', [
                'locations' => $locations
            ]);

            if ($request->get('view') === 'inline') {
                return Inertia::render('Admin/Report/PdfViewer', [
                    'pdf' => base64_encode($pdf->output()),
                    'title' => 'Locations List'
                ]);
            }

            return $pdf->download('locations-list.pdf');
        }

        return Excel::download(new LocationsExport(), 'locations-list.xlsx');
    }
}