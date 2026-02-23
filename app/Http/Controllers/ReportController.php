<?php

namespace App\Http\Controllers;

use App\Exports\VoucherExport;
use App\Exports\WardsExport;
use App\Exports\LocationsExport;
use App\Models\Applicant;
use App\Models\Institution;
use App\Models\Ward;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Mpdf\Mpdf;
use Mpdf\Config\ConfigVariables;
use Mpdf\Config\FontVariables;

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

    /**
     * Generate forwarding letter with mPDF
     */
    public function forwardingLetter(Request $request, $institution_id = null)
    {
        try {
            // Base query with approved applicants ordered alphabetically
            $query = Institution::with([
                'applicants' => function ($q) {
                    $q->where('decision', 'approved')
                        ->orderBy('student_name', 'asc')
                        ->with(['ward', 'location']);
                }
            ])->where('is_active', true);

            if ($institution_id) {
                $query->where('id', $institution_id);
            }

            $institutions = $query->get();

            $data = [
                'institutions' => $institutions,
                'type' => $institution_id ? 'single' : 'multiple',
                'date' => now()->format('jS F, Y'),
                'financial_year' => settingInfo()->financialYear ?? date('Y') . '/' . (date('Y') + 1),
            ];

            // Load HTML view
            $html = view('reports.forwarding-letter', $data)->render();

            // Configure mPDF with custom fonts and settings
            $mpdf = $this->configureMpdf();

            // Add footer that appears on every page
            $mpdf->SetHTMLFooter($this->getFooterHtml());

            // Write HTML to PDF
            $mpdf->WriteHTML($html);

            // Output as string and encode
            $pdfContent = $mpdf->Output('', 'S');

            return Inertia::render('Admin/Report/ForwardingLetter', [
                'data' => $data,
                'pdf' => base64_encode($pdfContent),
                'institutions' => Institution::where('is_active', true)
                    ->get(['id', 'name', 'code'])
            ]);

        } catch (\Throwable $th) {
            Log::error('Forwarding Letter Error: ' . $th->getMessage());
            return redirect()->back()->with('error', 'Failed to generate forwarding letter: ' . $th->getMessage());
        }
    }

    /**
     * Preview forwarding letter (now using mPDF)
     */
    public function previewForwardingLetter(Request $request)
    {
        try {
            $institutions = Institution::where('is_active', true)->get(['id', 'name', 'code']);
            $approvedApplicants = Applicant::with(['ward', 'location', 'institution'])
                ->where('decision', 'approved')
                ->orderBy('student_name', 'asc')
                ->get();

            // Group applicants by institution
            $groupedApplicants = $approvedApplicants->groupBy('institution_id');

            // Generate PDF for preview
            $data = [
                'applicants' => $approvedApplicants,
                'groupedApplicants' => $groupedApplicants,
                'institutions' => $institutions,
                'date' => now()->format('jS F, Y'),
                'financial_year' => settingInfo()->financialYear ?? date('Y') . '/' . (date('Y') + 1),
                'reference' => 'KR/BURSARY/' . now()->year . '/' . str_pad(mt_rand(1, 999), 3, '0', STR_PAD_LEFT),
                'type' => 'preview'
            ];

            // Load HTML view
            $html = view('reports.forwarding-letter-preview', $data)->render();

            // Configure mPDF
            $mpdf = $this->configureMpdf();

            // Add footer
            $mpdf->SetHTMLFooter($this->getFooterHtml());

            // Write HTML to PDF
            $mpdf->WriteHTML($html);

            // Output as string and encode
            $pdfContent = $mpdf->Output('', 'S');

            return Inertia::render('Admin/Report/ForwardingLetter', [
                'institutions' => $institutions,
                'approvedApplicants' => $approvedApplicants,
                'groupedApplicants' => $groupedApplicants,
                'pdf' => base64_encode($pdfContent),
                'data' => $data
            ]);

        } catch (\Throwable $th) {
            Log::error('Preview Forwarding Letter Error: ' . $th->getMessage());
            return redirect()->back()->with('error', 'Failed to generate preview: ' . $th->getMessage());
        }
    }

    /**
     * Export voucher as Excel only (PDF generation would be too complex for vouchers)
     */
    public function voucher(Request $request)
    {
        try {
            $filters = $request->validate([
                'institution_id' => 'nullable|exists:institutions,id',
                'ward_id' => 'nullable|exists:wards,id',
                'location_id' => 'nullable|exists:locations,id',
                'date_from' => 'nullable|date',
                'date_to' => 'nullable|date|after_or_equal:date_from',
            ]);

            $fileName = strtoupper('kitui_rural_bursary_vouchers_' . now()->format('Y-m_d')) . '.xlsx';

            return Excel::download(new VoucherExport($filters), $fileName);

        } catch (\Throwable $th) {
            Log::error('Voucher Export Error: ' . $th->getMessage());
            return redirect()->back()->with('error', 'Failed to generate voucher: ' . $th->getMessage());
        }
    }

    /**
     * Generate wards list (supports both Excel and PDF with mPDF)
     */
    public function wardsList(Request $request)
    {
        try {
            $format = $request->get('format', 'excel');

            if ($format === 'pdf') {
                $wards = Ward::with([
                    'locations',
                    'applicants' => function ($q) {
                        $q->where('decision', 'approved');
                    }
                ])->get();

                $data = [
                    'wards' => $wards,
                    'title' => 'Wards List',
                    'date' => now()->format('jS F, Y'),
                ];

                // Load HTML view
                $html = view('reports.wards-list', $data)->render();

                // Configure mPDF
                $mpdf = $this->configureMpdf();

                // Add footer
                $mpdf->SetHTMLFooter($this->getFooterHtml());

                // Write HTML to PDF
                $mpdf->WriteHTML($html);

                $pdfContent = $mpdf->Output('', 'S');

                if ($request->get('view') === 'inline') {
                    return Inertia::render('Admin/Report/PdfViewer', [
                        'pdf' => base64_encode($pdfContent),
                        'title' => 'Wards List'
                    ]);
                }

                // For download
                return response()->streamDownload(
                    fn() => print ($pdfContent),
                    'wards-list.pdf',
                    ['Content-Type' => 'application/pdf']
                );
            }

            return Excel::download(new WardsExport(), 'wards-list.xlsx');

        } catch (\Throwable $th) {
            Log::error('Wards List Error: ' . $th->getMessage());
            return redirect()->back()->with('error', 'Failed to generate wards list: ' . $th->getMessage());
        }
    }

    /**
     * Generate locations list (supports both Excel and PDF with mPDF)
     */
    public function locationsList(Request $request)
    {
        try {
            $format = $request->get('format', 'excel');

            if ($format === 'pdf') {
                $locations = Location::with([
                    'ward',
                    'applicants' => function ($q) {
                        $q->where('decision', 'approved');
                    }
                ])->get();

                $data = [
                    'locations' => $locations,
                    'title' => 'Locations List',
                    'date' => now()->format('jS F, Y'),
                ];

                // Load HTML view
                $html = view('reports.locations-list', $data)->render();

                // Configure mPDF
                $mpdf = $this->configureMpdf();

                // Add footer
                $mpdf->SetHTMLFooter($this->getFooterHtml());

                // Write HTML to PDF
                $mpdf->WriteHTML($html);

                $pdfContent = $mpdf->Output('', 'S');

                if ($request->get('view') === 'inline') {
                    return Inertia::render('Admin/Report/PdfViewer', [
                        'pdf' => base64_encode($pdfContent),
                        'title' => 'Locations List'
                    ]);
                }

                // For download
                return response()->streamDownload(
                    fn() => print ($pdfContent),
                    'locations-list.pdf',
                    ['Content-Type' => 'application/pdf']
                );
            }

            return Excel::download(new LocationsExport(), 'locations-list.xlsx');

        } catch (\Throwable $th) {
            Log::error('Locations List Error: ' . $th->getMessage());
            return redirect()->back()->with('error', 'Failed to generate locations list: ' . $th->getMessage());
        }
    }

    /**
     * Configure mPDF with common settings
     */
    private function configureMpdf()
    {
        // Default configuration
        $defaultConfig = (new ConfigVariables())->getDefaults();
        $fontDirs = $defaultConfig['fontDir'];

        // Default font configuration
        $defaultFontConfig = (new FontVariables())->getDefaults();
        $fontData = $defaultFontConfig['fontdata'];

        $mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'margin_bottom' => 35,
            'margin_footer' => 0,
            'fontDir' => array_merge($fontDirs, [
                public_path('fonts'),
            ]),
            'fontdata' => $fontData + [
                'times' => [
                    'R' => 'Times New Roman.ttf',
                    'I' => 'Times New Roman Italic.ttf',
                    'B' => 'Times New Roman Bold.ttf',
                ],
            ],
            'default_font' => 'times',
            'tempDir' => storage_path('app/temp/mpdf'),
            'orientation' => 'P',
            'use_kwt' => true, // Keep with table
            'use_substitutions' => true,
            'shrink_tables_to_fit' => 1, // Shrink tables to fit on page
        ]);

        // Set document information
        $mpdf->SetTitle('NG-CDF Kitui Rural Report');
        $mpdf->SetAuthor('NG-CDF Kitui Rural');
        $mpdf->SetCreator('NG-CDF Kitui Rural');

        return $mpdf;
    }

    /**
     * Get standard footer HTML
     */
    private function getFooterHtml()
    {
        return '<img src="https://i.ibb.co/HfWN0jC9/footer.png" alt="" style="width: 100%;">';
    }
}