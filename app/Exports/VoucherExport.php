<?php

namespace App\Exports;

use App\Models\Applicant;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class VoucherExport implements WithMultipleSheets
{
    protected $filters;
    protected $categories;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
        $this->categories = config('app.categories', [
            'secondary',
            'college',
            'polytechnic',
            'university',
            'special'
        ]);
    }

    public function sheets(): array
    {
        $sheets = [];

        foreach ($this->categories as $category) {
            $sheets[] = new VoucherCategorySheet($category);
        }

        return $sheets;
    }
}

class VoucherCategorySheet implements
    WithTitle,
    WithHeadings,
    WithStyles,
    WithColumnWidths,
    WithEvents
{
    protected $category;
    protected $categoryDisplayName;
    protected $applicants;
    protected $institutionGroups;

    public function __construct($category)
    {
        $this->category = $category;
        $this->categoryDisplayName = $this->formatCategoryName($category);
        $this->loadData();
    }

    protected function formatCategoryName($category)
    {
        $names = [
            'secondary' => 'SECONDARY SCHOOL',
            'college' => 'COLLEGE',
            'polytechnic' => 'POLYTECHNIC',
            'university' => 'UNIVERSITY',
            'special' => 'SPECIAL NEEDS'
        ];

        return $names[$category] ?? strtoupper($category);
    }

    protected function loadData()
    {
        // Get approved applicants where the institution's category matches this sheet's category
        $query = Applicant::with(['ward', 'location', 'institution'])
            ->where('decision', 'approved')
            ->whereHas('institution', function ($q) {
                $q->where('category', $this->category);
            });

        // Get applicants as a collection
        $this->applicants = $query->orderBy('institution_id')->get();
        $this->groupByInstitution();
    }

    protected function groupByInstitution()
    {
        $this->institutionGroups = [];

        foreach ($this->applicants as $applicant) {
            $institutionId = $applicant->institution_id ?? 0;
            $institutionName = $applicant->institution?->name ?? 'OTHER INSTITUTIONS';

            if (!isset($this->institutionGroups[$institutionId])) {
                $this->institutionGroups[$institutionId] = [
                    'name' => strtoupper($institutionName),
                    'applicants' => []
                ];
            }

            $this->institutionGroups[$institutionId]['applicants'][] = $applicant;
        }

        // Sort by institution name
        uasort($this->institutionGroups, function ($a, $b) {
            return strcmp($a['name'], $b['name']);
        });
    }

    public function title(): string
    {
        return strtoupper($this->category);
    }

    public function headings(): array
    {
        return [
            'SNO',
            'WARD',
            'LOCATION',
            'INSTITUTION',
            'CATEGORY',
            'NAME OF STUDENT',
            'ADMISSION NUMBER',
            'TYPE',
            'STATUS',
            'PARENT PHONE',
            'PARENT ID',
            'AMOUNT',
            'TOTAL'
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,   // SNO
            'B' => 20,  // WARD
            'C' => 20,  // LOCATION
            'D' => 30,  // INSTITUTION
            'E' => 20,  // CATEGORY
            'F' => 30,  // NAME OF STUDENT
            'G' => 20,  // ADMISSION NUMBER
            'H' => 15,  // TYPE
            'I' => 15,  // STATUS
            'J' => 20,  // PARENT PHONE
            'K' => 20,  // PARENT ID
            'L' => 15,  // AMOUNT
            'M' => 15,  // TOTAL
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
            2 => ['font' => ['bold' => true]],
            3 => ['font' => ['bold' => true]],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Set title "KITUI RURAL CONSTITUENCY" in row 1
                $sheet->mergeCells('A1:M1');
                $sheet->setCellValue('A1', 'KITUI RURAL CONSTITUENCY');
                $sheet->getStyle('A1')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 20,
                        'name' => 'Arial'
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'E6B800']
                    ]
                ]);
                $sheet->getRowDimension('1')->setRowHeight(35);

                // Set category title in row 2
                $sheet->mergeCells('A2:M2');
                $sheet->setCellValue('A2', $this->categoryDisplayName . ' VOUCHERS');
                $sheet->getStyle('A2')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 18,
                        'name' => 'Arial'
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F2F2F2']
                    ]
                ]);
                $sheet->getRowDimension('2')->setRowHeight(30);

                // Set headers in row 3
                $headers = $this->headings();
                foreach (range('A', 'M') as $index => $column) {
                    $sheet->setCellValue($column . '3', $headers[$index]);
                }

                $sheet->getStyle('A3:M3')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 12,
                        'name' => 'Arial'
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '4CAF50']
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER
                    ]
                ]);
                $sheet->getRowDimension('3')->setRowHeight(25);

                // Check if there are applicants for this category
                if ($this->applicants->isEmpty()) {
                    // Show "No data available" message
                    $sheet->mergeCells('A4:M4');
                    $sheet->setCellValue('A4', 'NO DATA AVAILABLE FOR THIS CATEGORY');
                    $sheet->getStyle('A4')->applyFromArray([
                        'font' => [
                            'bold' => true,
                            'size' => 14,
                            'name' => 'Arial',
                            'color' => ['rgb' => 'FF0000']
                        ],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                            'vertical' => Alignment::VERTICAL_CENTER
                        ]
                    ]);
                    $sheet->getRowDimension('4')->setRowHeight(30);
                    return;
                }

                // Start populating data from row 4
                $currentRow = 4;

                foreach ($this->institutionGroups as $groupId => $group) {
                    $groupStartRow = $currentRow;
                    $groupSno = 1;

                    // Add students for this institution
                    foreach ($group['applicants'] as $applicant) {
                        $sheet->setCellValue('A' . $currentRow, $groupSno++);
                        $sheet->setCellValue('B' . $currentRow, strtoupper($applicant->ward?->name ?? '-'));
                        $sheet->setCellValue('C' . $currentRow, strtoupper($applicant->location?->name ?? '-'));
                        $sheet->setCellValue('D' . $currentRow, strtoupper($applicant->institution?->name ?? '-'));
                        $sheet->setCellValue('E' . $currentRow, $this->categoryDisplayName);
                        $sheet->setCellValue('F' . $currentRow, strtoupper($applicant->student_name));
                        $sheet->setCellValue('G' . $currentRow, strtoupper($applicant->admission_number));
                        $sheet->setCellValue('H' . $currentRow, strtoupper($applicant->type ?? '-'));
                        $sheet->setCellValue('I' . $currentRow, strtoupper($applicant->parent_status ?? '-'));
                        $sheet->setCellValue('J' . $currentRow, strtoupper($applicant->parent_phone_number));
                        $sheet->setCellValue('K' . $currentRow, strtoupper($applicant->parent_id_number));
                        $sheet->setCellValue('L' . $currentRow, $applicant->amount);
                        $sheet->setCellValue('M' . $currentRow, ''); // Empty for student rows
    
                        // Apply borders to cells
                        $sheet->getStyle('A' . $currentRow . ':M' . $currentRow)->applyFromArray([
                            'borders' => [
                                'allBorders' => [
                                    'borderStyle' => Border::BORDER_THIN,
                                    'color' => ['rgb' => '000000']
                                ]
                            ]
                        ]);

                        $currentRow++;
                    }

                    $groupEndRow = $currentRow - 1;

                    // Add total row with SUM formula (NO EXTRA ROW AFTER)
                    $sheet->mergeCells("A{$currentRow}:K{$currentRow}");
                    $sheet->setCellValue("A{$currentRow}", ''); // Empty cell
                    $sheet->setCellValue("L{$currentRow}", ''); // Empty AMOUNT for total row
                    // Use SUM formula for automatic calculation
                    $sheet->setCellValue("M{$currentRow}", "=SUM(L{$groupStartRow}:L{$groupEndRow})");

                    // Style the total row
                    $sheet->getStyle("A{$currentRow}:M{$currentRow}")->applyFromArray([
                        'font' => [
                            'bold' => true,
                            'name' => 'Arial'
                        ],
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => 'FFFF99']
                        ],
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['rgb' => '000000']
                            ]
                        ]
                    ]);

                    $currentRow++;
                    // REMOVED THE EXTRA ROW - now we don't add an empty row after each group
                }

                // Apply formatting to all data rows
                $lastRow = $currentRow - 1;

                // Set column alignments
                // Left align: A, B, C, D, E, F, H, I
                $leftAlignColumns = ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'I'];
                foreach ($leftAlignColumns as $column) {
                    $sheet->getStyle($column . '4:' . $column . $lastRow)
                        ->getAlignment()
                        ->setHorizontal(Alignment::HORIZONTAL_LEFT);
                }

                // Right align: G (Admission Number), J (Parent Phone), L (Amount), M (Total)
                $sheet->getStyle('G4:G' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $sheet->getStyle('J4:J' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $sheet->getStyle('L4:M' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

                // Set column L (AMOUNT) to number format
                $sheet->getStyle('L4:L' . $lastRow)->getNumberFormat()->setFormatCode('#,##0.00');

                // Set column M (TOTAL) to number format
                $sheet->getStyle('M4:M' . $lastRow)->getNumberFormat()->setFormatCode('#,##0.00');

                // Add grand total at the bottom (with 2 rows gap for better visibility)
                $grandTotalRow = $lastRow + 2;
                $sheet->mergeCells("A{$grandTotalRow}:K{$grandTotalRow}");
                $sheet->setCellValue("A{$grandTotalRow}", "GRAND TOTAL");
                $sheet->setCellValue("L{$grandTotalRow}", '');
                // Use SUM formula for grand total
                $sheet->setCellValue("M{$grandTotalRow}", "=SUM(M4:M{$lastRow})");

                // Format grand total with number format
                $sheet->getStyle("M{$grandTotalRow}")->getNumberFormat()->setFormatCode('#,##0.00');

                $sheet->getStyle("A{$grandTotalRow}:M{$grandTotalRow}")->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 14,
                        'name' => 'Arial'
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'E6B800']
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THICK,
                            'color' => ['rgb' => '000000']
                        ]
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_LEFT
                    ]
                ]);

                // Right align the grand total amount
                $sheet->getStyle('M' . $grandTotalRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

                // Freeze the top rows
                $sheet->freezePane('A4');

                // Style the entire sheet
                $sheet->getStyle('A1:M' . $grandTotalRow)->applyFromArray([
                    'alignment' => [
                        'vertical' => Alignment::VERTICAL_CENTER
                    ],
                    'font' => [
                        'name' => 'Arial',
                        'size' => 11
                    ]
                ]);
            },
        ];
    }
}