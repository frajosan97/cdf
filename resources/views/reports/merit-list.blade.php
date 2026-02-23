<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NG-CDF Merit List – Kitui Rural</title>
    <style>
        /* mPDF requires inline styles - no external CSS */
        body {
            font-family: "Times New Roman", Times, serif;
            padding: 0;
            margin: 0;
            font-size: 14px;
            line-height: 1.5;
            color: #000;
        }

        /* Letterhead styling */
        .letterhead-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0;
            border: none;
        }

        .letterhead-table td {
            border: none;
            vertical-align: middle;
            padding: 0;
        }

        .logo-cell {
            width: 25%;
            text-align: left;
        }

        .logo-cell img {
            max-width: 140px;
            height: auto;
            display: block;
        }

        .contact-cell {
            width: 25%;
            text-align: right;
        }

        .contact-item {
            margin: 2px 0;
            padding: 0;
            font-weight: bold;
            line-height: 1.4;
            font-size: 14px;
        }

        .title-cell {
            width: 50%;
            text-align: center;
        }

        /* Border styling */
        .border-container {
            width: 100%;
            margin: 5px 0 15px 0;
        }

        .border-thin {
            border-bottom: 1px solid #000;
            width: 100%;
            margin: 0;
        }

        .border-thick {
            border-bottom: 4px solid #000;
            width: 100%;
            margin: 2px 0 0 0;
        }

        /* Date styling */
        .date-section {
            text-align: right;
            margin: 20px 0 25px 0;
            font-weight: normal;
        }

        .date-text {
            font-size: 16px;
            margin: 0;
            font-weight: bold;
        }

        .address-section h4 {
            margin: 5px 0;
            font-weight: bold;
            font-size: 16px;
            text-transform: uppercase;
        }

        /* Subject line */
        .subject-line {
            font-weight: bold;
            text-decoration: underline;
            font-size: 16px;
            margin: 15px 0 15px 0;
            text-transform: uppercase;
        }

        /* Introduction paragraph */
        .intro-paragraph {
            text-align: justify;
            line-height: 1.6;
            margin: 15px 0 15px 0;
        }

        /* Table styling - Enhanced borders for mPDF */
        .applicants-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            margin: 15px 0 15px 0;
            page-break-inside: auto;
        }

        .applicants-table thead {
            display: table-header-group;
        }

        .applicants-table tbody {
            display: table-row-group;
        }

        .applicants-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }

        .applicants-table th {
            background-color: #f2f2f2;
            border: 1.5px solid #000;
            text-align: left;
            font-weight: bold;
            padding: 6px 4px;
            background-color: #e6e6e6;
        }

        .applicants-table td {
            border: 1.5px solid #000;
            vertical-align: top;
            padding: 4px;
        }

        .applicants-table tbody tr td:first-child {
            text-align: center;
            width: 8%;
        }

        .applicants-table tbody tr td:nth-child(2) {
            width: 47%;
        }

        .applicants-table tbody tr td:nth-child(3) {
            width: 25%;
        }

        .applicants-table tbody tr td:last-child {
            width: 20%;
            text-align: right;
            font-weight: bold;
            padding-right: 8px;
        }

        /* Amount column in header */
        .amount-header {
            text-align: center;
        }

        .amount-value {
            text-align: right;
        }

        /* Empty state styling */
        .empty-state {
            text-align: center;
            padding: 20px;
            font-style: italic;
        }

        /* Page break */
        .page-break {
            page-break-after: always;
            margin: 0;
            padding: 0;
        }

        /* Total row styling */
        .total-row td {
            font-weight: bold;
            background-color: #f2f2f2 !important;
            border-top: 2px solid #000;
        }

        .total-row td:last-child {
            text-align: right;
            padding-right: 8px;
        }

        /* Signature section */
        .signature-section {
            margin-top: 40px;
            page-break-inside: avoid;
        }

        .signature-section p {
            margin: 0;
            line-height: 1.8;
        }

        .signature-section strong {
            font-weight: bold;
        }

        .signature-line {
            width: 250px;
            border-bottom: 1px solid #000;
            margin: 5px 0;
        }

        /* mPDF specific optimizations */
        .no-break {
            page-break-inside: avoid;
        }

        .keep-together {
            page-break-inside: avoid;
        }

        /* Ensure tables don't break badly */
        table {
            page-break-inside: auto;
        }

        tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }

        thead {
            display: table-header-group;
        }

        tfoot {
            display: table-footer-group;
        }

        /* Print optimization */
        @media print {
            body {
                margin: 0;
                padding: 0;
            }

            .applicants-table th {
                background-color: #e6e6e6 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .total-row td {
                background-color: #f2f2f2 !important;
            }
        }

        /* mPDF background color fix */
        .bg-light {
            background-color: #f2f2f2;
        }
    </style>
</head>

<body>
    <!-- Letterhead Section -->
    <table class="letterhead-table" style="border: none;">
        <tr>
            <td class="logo-cell" style="border: none;">
                <img src="https://i.ibb.co/27GM3qQ3/ngcdf.png" alt="NGCDF Logo" style="max-width: 140px;" />
            </td>
            <td class="title-cell" style="border: none;">
                <h1>{{ $title }}</h1>
                <h3>{{ $subtitle }}</h3>
            </td>
            <td class="contact-cell" style="border: none;">
                <p class="contact-item">National Government Constituencies Development Fund</p>
                <p class="contact-item">Kitui Rural Constituency</p>
                <p class="contact-item">P.O. BOX 1422-90200</p>
                <p class="contact-item">Kitui-Kenya</p>
                <p class="contact-item">Office Contact: 0723 636 367</p>
                <p class="contact-item">Email: cdfkituirural@cdf.go.ke</p>
            </td>
        </tr>
    </table>

    <!-- Border Section -->
    <div class="border-container">
        <div class="border-thin"></div>
        <div class="border-thick"></div>
    </div>

    <!-- Introduction Paragraph -->
    <div class="intro-paragraph">
        The following <strong>{{ count($applicants) }}</strong> applicants from
        <strong>{{ $title }}</strong> successfully met all the minimum requirements
        set by the NG-CDF Kitui Rural Board during the
        <strong>{{ $financial_year }}</strong> bursary application process and have
        therefore been approved as successful beneficiaries.
    </div>

    <!-- Applicants Table - Well Bordered -->
    <table class="applicants-table" repeat_header="1" repeat_footer="1">
        <thead>
            <tr>
                <th style="text-align: center;">S/NO</th>
                <th>INSTITUTION</th>
                <th>NAME OF STUDENT</th>
                <th>REG / ADM</th>
                <th class="amount-header">AMOUNT</th>
            </tr>
        </thead>
        <tbody>
            @forelse($applicants as $index => $applicant)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}.</td>
                    <td>{{ strtoupper($applicant->institution->name) }}</td>
                    <td>{{ strtoupper($applicant->student_name) }}</td>
                    <td>{{ $applicant->admission_number ?? '—' }}</td>
                    <td style="text-align: right;">{{ number_format($applicant->amount ?? 0, 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" class="empty-state" style="text-align: center; padding: 20px;">
                        No approved applicants for {{ $title }}
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- notes -->
    <h4>Notes:</h4>
    <ol>
        <li>ID attached <strong>MUST</strong> be a voter in Kitui Rural Constituency</li>
        <li>All required fields/Attachments (Institution, Student Name, Admission Number, Parent Phone and Parent ID)
            <strong>MUST</strong> be filled
        </li>
        <li>Single applicant per parent ID (With an exception of Orphans & Special)</li>
        <li>Any body who applied more than once was rejected</li>
    </ol>
</body>

</html>