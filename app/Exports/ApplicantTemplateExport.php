<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ApplicantTemplateExport implements FromArray, WithHeadings, WithStyles, ShouldAutoSize
{
    /**
     * @return array
     */
    public function array(): array
    {
        // Return empty array - no data rows
        return [];
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'WARD',
            'LOCATION',
            'INSTITUTION',
            'CATEGORY',
            'TYPE',
            'STUDENT_NAME',
            'ADMISSION_NUMBER',
            'PARENT_STATUS',
            'PARENT_PHONE',
            'PARENT_ID',
            'AMOUNT',
        ];
    }

    /**
     * @param Worksheet $sheet
     */
    public function styles(Worksheet $sheet)
    {
        // Make headings bold and add background color
        $sheet->getStyle('A1:K1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '0D6EFD']
            ]
        ]);

        return $sheet;
    }
}