<?php

namespace App\Http\Controllers;

use App\Exports\VoucherExport;
use App\Models\Applicant;
use App\Models\Institution;
use App\Models\Ward;
use App\Models\Location;
use Illuminate\Http\Request;
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
            $wards = Ward::with('locations')
                ->withCount('applicants')
                ->get(['id', 'name']);

            return Inertia::render('Admin/Report/Index', [
                'wards' => $wards,
                'stats' => [
                    'total_approved' => Applicant::where('decision', 'approved')->count(),
                    'total_pending' => Applicant::where('decision', 'pending')->count(),
                    'total_rejected' => Applicant::where('decision', 'rejected')->count(),
                    'total_bursary' => Applicant::where('decision', 'approved')->sum('amount'),
                ]
            ]);
        } catch (\Throwable $th) {
            Log::error('Report Index Error: ' . $th->getMessage());
            return redirect()->back()->with('error', 'Something went wrong. Please try again.');
        }
    }

    /**
     *  Generate merit lists
     */
    public function merit(Request $request)
    {
        ini_set('pcre.backtrack_limit', '10000000'); // 10M
        ini_set('pcre.recursion_limit', '10000000'); // 10M

        try {
            $validated = $request->validate([
                'id' => 'nullable|string',
                'type' => 'required|string|in:constituency,ward,location',
                'format' => 'required|string|in:pdf,excel',
            ]);

            if ($validated['format'] === 'excel') {
                // generate excel
            }

            $query = Applicant::query()
                ->select('applicants.*')
                ->join(
                    'institutions',
                    'applicants.institution_id',
                    '=',
                    'institutions.id'
                )
                ->where('applicants.decision', 'approved')
                ->with(['ward', 'location', 'institution'])
                ->orderBy('institutions.name', 'asc')
                ->orderBy('applicants.student_name', 'asc')
                ->orderBy('applicants.admission_number', 'asc');

            // Apply type-specific filters and get title/description
            $title = '';
            $subtitle = '';
            $applicants = [];

            switch ($validated['type']) {
                case 'constituency':
                    $title = 'KITUI RURAL CONSTITUENCY';
                    $subtitle = 'SUCCESSFULL APPLICANTS MERIT LIST';
                    $applicants = $query->get();
                    break;

                case 'ward':
                    $ward = Ward::findOrFail($validated['id']);
                    $query->where('ward_id', $validated['id']);
                    $title = strtoupper($ward->name) . ' WARD';
                    $subtitle = 'SUCCESSFULL APPLICANTS MERIT LIST';
                    $applicants = $query->get();
                    break;

                case 'location':
                    $location = Location::with('ward')->findOrFail($validated['id']);
                    $query->where('location_id', $validated['id']);
                    $title = strtoupper($location->name) . ' LOCATION';
                    $subtitle = 'SUCCESSFULL APPLICANTS MERIT LIST';
                    $applicants = $query->get();
                    break;

                default:
                    throw new \InvalidArgumentException('Invalid type specified');
            }

            $data = [
                'title' => $title,
                'subtitle' => $subtitle,
                'applicants' => $applicants,
                'date' => settingInfo()->date,
                'financial_year' => settingInfo()->financialYear,
            ];

            // Load HTML view
            $html = view('reports.merit-list', $data)->render();

            // Configure mPDF with custom fonts and settings
            $mpdf = $this->configureMpdf([
                'orientation' => 'L',
            ]);

            // Add footer that appears on every page
            $mpdf->SetHTMLFooter($this->getMeritListFooter());

            // Write HTML to PDF
            $mpdf->WriteHTML($html);

            // Output as string and encode
            $pdfContent = $mpdf->Output('', 'S');

            return Inertia::render('Admin/Report/MeritList', [
                'data' => $data,
                'pdf' => base64_encode($pdfContent),
                'wards' => Ward::with('locations')->get(['id', 'name']),
            ]);
        } catch (\Throwable $th) {
            Log::error('Report Merit List Error: ' . $th->getMessage());
            return redirect()->back()->with('error', 'Something went wrong. Please try again.');
        }
    }

    /**
     * Generate forwarding letter with mPDF
     */
    public function forwardingLetter(Request $request, $institution_id = null)
    {
        try {
            ini_set('pcre.backtrack_limit', '10000000'); // 10M
            ini_set('pcre.recursion_limit', '10000000'); // 10M

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
                'date' => settingInfo()->date,
                'financial_year' => settingInfo()->financialYear,
            ];

            // Load HTML view
            $html = view('reports.forwarding-letter', $data)->render();

            // Configure mPDF with custom fonts and settings
            $mpdf = $this->configureMpdf([
                'margin_bottom' => 35,
                'margin_footer' => 0
            ]);

            // Add footer that appears on every page
            $mpdf->SetHTMLFooter($this->getForwardLetterFooter());

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
     * Configure mPDF with common settings
     */
    private function configureMpdf($config = null)
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
            'margin_bottom' => $config['margin_bottom'] ?? null,
            'margin_footer' => $config['margin_footer'] ?? null,
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
            'orientation' => $config['orientation'] ?? 'P',
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
    private function getForwardLetterFooter()
    {
        return '<img src="https://i.ibb.co/HfWN0jC9/footer.png" alt="" style="width: 100%;">';
    }

    private function getMeritListFooter()
    {
        return '
        <div class="border-container">
            <div class="border-thick"></div>
        </div>
        <table width="100%">
            <tr>
                <td width="50%" style="text-align: left">
                    <p style="margin: 0">Generated by NG-CDF Kitui Rural</p>
                </td>
                <td width="50%" style="text-align: right">
                    <p style="margin: 0">Page {PAGENO}/{nbpg}</p>
                </td>
            </tr>
        </table>
        ';
    }
}