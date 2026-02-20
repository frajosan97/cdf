<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Wards List Report</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            line-height: 1.4;
            margin: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }

        .header h1 {
            margin: 0;
            font-size: 20px;
            color: #333;
            text-transform: uppercase;
        }

        .header h3 {
            margin: 5px 0;
            color: #666;
            font-weight: normal;
            font-size: 14px;
        }

        .header p {
            margin: 5px 0;
            color: #888;
            font-size: 12px;
        }

        .summary {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }

        .summary table {
            width: 100%;
            border-collapse: collapse;
        }

        .summary td {
            padding: 5px;
            font-size: 12px;
        }

        .summary .label {
            font-weight: bold;
            width: 150px;
        }

        table.data {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 10px;
        }

        table.data th {
            background-color: #2196F3;
            color: white;
            font-weight: bold;
            padding: 8px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
        }

        table.data td {
            border: 1px solid #ddd;
            padding: 6px;
        }

        table.data tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        table.data tr:hover {
            background-color: #f5f5f5;
        }

        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 5px;
        }

        .page-number {
            text-align: right;
            font-size: 9px;
            color: #666;
        }

        .total-row {
            font-weight: bold;
            background-color: #e0e0e0 !important;
        }

        .stats-card {
            display: inline-block;
            width: 23%;
            margin: 1%;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 5px;
            text-align: center;
        }

        .stats-number {
            font-size: 18px;
            font-weight: bold;
            color: #2196F3;
        }

        .stats-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>KITUI RURAL CONSTITUENCY</h1>
        <h3>WARDS LIST REPORT</h3>
        <p>Generated on: {{ date('d F Y, h:i A') }}</p>
    </div>

    <!-- Stats Cards -->
    <div style="margin-bottom: 20px;">
        <div class="stats-card">
            <div class="stats-number">{{ $wards->count() }}</div>
            <div class="stats-label">Total Wards</div>
        </div>
        <div class="stats-card">
            <div class="stats-number">{{ $wards->sum(function ($ward) {
    return $ward->locations->count(); }) }}</div>
            <div class="stats-label">Total Locations</div>
        </div>
        <div class="stats-card">
            <div class="stats-number">{{ $wards->sum(function ($ward) {
    return $ward->applicants->count(); }) }}</div>
            <div class="stats-label">Total Applicants</div>
        </div>
        <div class="stats-card">
            <div class="stats-number">KES
                {{ number_format($wards->sum(function ($ward) {
    return $ward->applicants->where('decision', 'approved')->sum('amount'); }), 0) }}
            </div>
            <div class="stats-label">Total Bursary</div>
        </div>
    </div>

    <table class="data" width="100%" cellspacing="0" cellpadding="5">
        <thead>
            <tr>
                <th width="5%">#</th>
                <th width="15%">WARD NAME</th>
                <th width="10%">LOCATIONS</th>
                <th width="10%">TOTAL APPS</th>
                <th width="10%">APPROVED</th>
                <th width="10%">PENDING</th>
                <th width="10%">REJECTED</th>
                <th width="15%">TOTAL AMOUNT</th>
                <th width="15%">CREATED</th>
            </tr>
        </thead>
        <tbody>
            @foreach($wards as $index => $ward)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td><strong>{{ strtoupper($ward->name) }}</strong></td>
                    <td style="text-align: center;">{{ $ward->locations->count() }}</td>
                    <td style="text-align: center;">{{ $ward->applicants->count() }}</td>
                    <td style="text-align: center; color: #28a745;">
                        {{ $ward->applicants->where('decision', 'approved')->count() }}</td>
                    <td style="text-align: center; color: #ffc107;">
                        {{ $ward->applicants->where('decision', 'pending')->count() }}</td>
                    <td style="text-align: center; color: #dc3545;">
                        {{ $ward->applicants->where('decision', 'rejected')->count() }}</td>
                    <td style="text-align: right;">KES
                        {{ number_format($ward->applicants->where('decision', 'approved')->sum('amount'), 2) }}</td>
                    <td style="text-align: center;">{{ $ward->created_at->format('d/m/Y') }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="2" style="text-align: right;"><strong>TOTALS:</strong></td>
                <td style="text-align: center;">
                    <strong>{{ $wards->sum(function ($ward) {
    return $ward->locations->count(); }) }}</strong></td>
                <td style="text-align: center;">
                    <strong>{{ $wards->sum(function ($ward) {
    return $ward->applicants->count(); }) }}</strong></td>
                <td style="text-align: center;">
                    <strong>{{ $wards->sum(function ($ward) {
    return $ward->applicants->where('decision', 'approved')->count(); }) }}</strong>
                </td>
                <td style="text-align: center;">
                    <strong>{{ $wards->sum(function ($ward) {
    return $ward->applicants->where('decision', 'pending')->count(); }) }}</strong>
                </td>
                <td style="text-align: center;">
                    <strong>{{ $wards->sum(function ($ward) {
    return $ward->applicants->where('decision', 'rejected')->count(); }) }}</strong>
                </td>
                <td style="text-align: right;"><strong>KES
                        {{ number_format($wards->sum(function ($ward) {
    return $ward->applicants->where('decision', 'approved')->sum('amount'); }), 2) }}</strong>
                </td>
                <td></td>
            </tr>
        </tfoot>
    </table>

    <!-- Locations Summary per Ward -->
    @foreach($wards as $ward)
        @if($ward->locations->count() > 0)
            <div style="margin-top: 30px; page-break-inside: avoid;">
                <h4 style="background-color: #f0f0f0; padding: 8px; margin-bottom: 10px;">
                    LOCATIONS IN {{ strtoupper($ward->name) }} WARD
                </h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
                    <thead>
                        <tr style="background-color: #e0e0e0;">
                            <th style="padding: 5px; border: 1px solid #ccc;">#</th>
                            <th style="padding: 5px; border: 1px solid #ccc;">LOCATION</th>
                            <th style="padding: 5px; border: 1px solid #ccc;">TOTAL APPS</th>
                            <th style="padding: 5px; border: 1px solid #ccc;">APPROVED</th>
                            <th style="padding: 5px; border: 1px solid #ccc;">PENDING</th>
                            <th style="padding: 5px; border: 1px solid #ccc;">REJECTED</th>
                            <th style="padding: 5px; border: 1px solid #ccc;">AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($ward->locations as $locIndex => $location)
                            <tr>
                                <td style="padding: 4px; border: 1px solid #ccc; text-align: center;">{{ $locIndex + 1 }}</td>
                                <td style="padding: 4px; border: 1px solid #ccc;">{{ strtoupper($location->name) }}</td>
                                <td style="padding: 4px; border: 1px solid #ccc; text-align: center;">
                                    {{ $location->applicants->count() }}</td>
                                <td style="padding: 4px; border: 1px solid #ccc; text-align: center;">
                                    {{ $location->applicants->where('decision', 'approved')->count() }}</td>
                                <td style="padding: 4px; border: 1px solid #ccc; text-align: center;">
                                    {{ $location->applicants->where('decision', 'pending')->count() }}</td>
                                <td style="padding: 4px; border: 1px solid #ccc; text-align: center;">
                                    {{ $location->applicants->where('decision', 'rejected')->count() }}</td>
                                <td style="padding: 4px; border: 1px solid #ccc; text-align: right;">KES
                                    {{ number_format($location->applicants->where('decision', 'approved')->sum('amount'), 2) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    @endforeach

    <div class="footer">
        <p>This is a computer generated report. For official use only.</p>
        <div class="page-number">Page {PAGE_NUM} of {PAGE_COUNT}</div>
    </div>
</body>

</html>