<?php

namespace App\Exports;

use App\Models\Applicant;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ApplicantsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $query = Applicant::with(['institution', 'ward', 'location']);

        // Apply filters
        if (!empty($this->filters['type'])) {
            $query->where('type', $this->filters['type']);
        }

        if (!empty($this->filters['decision'])) {
            $query->where('decision', $this->filters['decision']);
        }

        if (!empty($this->filters['institution_id'])) {
            $query->where('institution_id', $this->filters['institution_id']);
        }

        if (!empty($this->filters['ward_id'])) {
            $query->where('ward_id', $this->filters['ward_id']);
        }

        if (!empty($this->filters['location_id'])) {
            $query->where('location_id', $this->filters['location_id']);
        }

        // Date range filters
        if (!empty($this->filters['date_from'])) {
            $query->whereDate('created_at', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('created_at', '<=', $this->filters['date_to']);
        }

        return $query->get();
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Ward',
            'Location',
            'Institution',
            'Category',
            'Type',
            'Student Name',
            'Admission Number',
            'Parent Status',
            'Parent Phone',
            'Parent ID Number',
            'Amount (KES)',
        ];
    }

    /**
     * @param mixed $applicant
     * @return array
     */
    public function map($applicant): array
    {
        return [
            strtoupper($applicant->ward?->name ?? '-'),
            strtoupper($applicant->location?->name ?? '-'),
            strtoupper($applicant->institution?->name ?? '-'),
            strtoupper($applicant->institution?->category ?? '-'),
            strtoupper($applicant->type ?? '-'),
            strtoupper($applicant->student_name ?: '-'),
            strtoupper($applicant->admission_number ?: '-'),
            strtoupper($applicant->parent_status ?: '-'),
            strtoupper($applicant->parent_phone_number ?: '-'),
            strtoupper($applicant->parent_id_number ?: '-'),
            strtoupper($applicant->amount ? number_format($applicant->amount, 2) : '-'),
        ];
    }

    /**
     * @param Worksheet $sheet
     */
    public function styles(Worksheet $sheet)
    {
        // Make headings bold
        $sheet->getStyle('A1:Q1')->getFont()->setBold(true);

        // Auto-size columns
        foreach (range('A', 'Q') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        return $sheet;
    }
}