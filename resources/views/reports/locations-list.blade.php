<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Locations List Report</title>
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
            background-color: #4CAF50;
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

        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
        }

        .badge-success {
            background-color: #d4edda;
            color: #155724;
        }

        .badge-warning {
            background-color: #fff3cd;
            color: #856404;
        }

        .badge-danger {
            background-color: #f8d7da;
            color: #721c24;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>KITUI RURAL CONSTITUENCY</h1>
        <h3>LOCATIONS LIST REPORT</h3>
        <p>Generated on: {{ date('d F Y, h:i A') }}</p>
    </div>

    <div class="summary">
        <table>
            <tr>
                <td class="label">Total Locations:</td>
                <td><strong>{{ $locations->count() }}</strong></td>
                <td class="label">Total Applicants:</td>
                <td><strong>{{ $locations->sum(function ($loc) {
    return $loc->applicants->count(); }) }}</strong></td>
            </tr>
            <tr>
                <td class="label">Total Approved:</td>
                <td><strong>{{ $locations->sum(function ($loc) {
    return $loc->applicants->where('decision', 'approved')->count(); }) }}</strong>
                </td>
                <td class="label">Total Bursary:</td>
                <td><strong>KES
                        {{ number_format($locations->sum(function ($loc) {
    return $loc->applicants->where('decision', 'approved')->sum('amount'); }), 2) }}</strong>
                </td>
            </tr>
        </table>
    </div>

    <table class="data" width="100%" cellspacing="0" cellpadding="5">
        <thead>
            <tr>
                <th width="5%">#</th>
                <th width="15%">LOCATION NAME</th>
                <th width="15%">WARD</th>
                <th width="10%">TOTAL APPS</th>
                <th width="10%">APPROVED</th>
                <th width="10%">PENDING</th>
                <th width="10%">REJECTED</th>
                <th width="15%">TOTAL AMOUNT</th>
                <th width="10%">CREATED</th>
            </tr>
        </thead>
        <tbody>
            @foreach($locations as $index => $location)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td><strong>{{ strtoupper($location->name) }}</strong></td>
                    <td>{{ strtoupper($location->ward?->name ?? '-') }}</td>
                    <td style="text-align: center;">{{ $location->applicants->count() }}</td>
                    <td style="text-align: center; color: #28a745;">
                        {{ $location->applicants->where('decision', 'approved')->count() }}</td>
                    <td style="text-align: center; color: #ffc107;">
                        {{ $location->applicants->where('decision', 'pending')->count() }}</td>
                    <td style="text-align: center; color: #dc3545;">
                        {{ $location->applicants->where('decision', 'rejected')->count() }}</td>
                    <td style="text-align: right;">KES
                        {{ number_format($location->applicants->where('decision', 'approved')->sum('amount'), 2) }}</td>
                    <td style="text-align: center;">{{ $location->created_at->format('d/m/Y') }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="3" style="text-align: right;"><strong>TOTALS:</strong></td>
                <td style="text-align: center;">
                    <strong>{{ $locations->sum(function ($loc) {
    return $loc->applicants->count(); }) }}</strong></td>
                <td style="text-align: center;">
                    <strong>{{ $locations->sum(function ($loc) {
    return $loc->applicants->where('decision', 'approved')->count(); }) }}</strong>
                </td>
                <td style="text-align: center;">
                    <strong>{{ $locations->sum(function ($loc) {
    return $loc->applicants->where('decision', 'pending')->count(); }) }}</strong>
                </td>
                <td style="text-align: center;">
                    <strong>{{ $locations->sum(function ($loc) {
    return $loc->applicants->where('decision', 'rejected')->count(); }) }}</strong>
                </td>
                <td style="text-align: right;"><strong>KES
                        {{ number_format($locations->sum(function ($loc) {
    return $loc->applicants->where('decision', 'approved')->sum('amount'); }), 2) }}</strong>
                </td>
                <td></td>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        <p>This is a computer generated report. For official use only.</p>
        <div class="page-number">Page {PAGE_NUM} of {PAGE_COUNT}</div>
    </div>
</body>

</html>