<?php

namespace App\Exports;

use App\Models\Institution;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class InstitutionsExport implements FromCollection, WithHeadings, WithMapping, WithTitle, ShouldAutoSize, WithStyles
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Institution::query();

        if (!empty($this->filters['category'])) {
            $query->where('category', $this->filters['category']);
        }

        if (isset($this->filters['is_active'])) {
            $query->where('is_active', $this->filters['is_active']);
        }

        return $query->orderBy('name')->get();
    }

    public function headings(): array
    {
        return [
            'Code',
            'Name',
            'Category',
            'Total Applicants',
        ];
    }

    public function map($institution): array
    {
        return [
            $institution->code,
            strtoupper($institution->name),
            $institution->category ? ucfirst($institution->category) : 'N/A',
            $institution->applicants_count ?? 0,
        ];
    }

    public function title(): string
    {
        return 'Institutions Export';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}