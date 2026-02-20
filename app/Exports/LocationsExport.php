<?php

namespace App\Exports;

use App\Models\Location;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LocationsExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    public function collection()
    {
        return Location::with(['ward', 'applicants'])->get();
    }

    public function headings(): array
    {
        return [
            'Location Name',
            'Ward',
            'Total Applicants',
            'Approved Applicants',
            'Pending Applicants',
            'Rejected Applicants',
            'Total Bursary Amount',
            'Created Date'
        ];
    }

    public function map($location): array
    {
        return [
            $location->name,
            $location->ward?->name ?? '-',
            $location->applicants->count(),
            $location->applicants->where('decision', 'approved')->count(),
            $location->applicants->where('decision', 'pending')->count(),
            $location->applicants->where('decision', 'rejected')->count(),
            'KES ' . number_format($location->applicants->where('decision', 'approved')->sum('amount'), 2),
            $location->created_at->format('d/m/Y')
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}