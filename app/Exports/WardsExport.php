<?php

namespace App\Exports;

use App\Models\Ward;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class WardsExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    public function collection()
    {
        return Ward::with(['locations', 'applicants'])->get();
    }

    public function headings(): array
    {
        return [
            'Ward Name',
            'Total Locations',
            'Total Applicants',
            'Approved Applicants',
            'Pending Applicants',
            'Rejected Applicants',
            'Total Bursary Amount',
            'Created Date'
        ];
    }

    public function map($ward): array
    {
        return [
            $ward->name,
            $ward->locations->count(),
            $ward->applicants->count(),
            $ward->applicants->where('decision', 'approved')->count(),
            $ward->applicants->where('decision', 'pending')->count(),
            $ward->applicants->where('decision', 'rejected')->count(),
            'KES ' . number_format($ward->applicants->where('decision', 'approved')->sum('amount'), 2),
            $ward->created_at->format('d/m/Y')
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}