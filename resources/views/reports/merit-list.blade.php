<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>NG-CDF Merit List – Kitui Rural</title>

    <style>
        body {
            font-family: "Times New Roman", Times, serif;
            margin: 0;
            padding: 0;
            font-size: 14px;
            line-height: 1.5;
            color: #000;
        }

        h1,
        h3,
        h4,
        h5 {
            margin: 3px 0;
        }

        /* LETTERHEAD */
        .letterhead-table {
            width: 100%;
            border-collapse: collapse;
        }

        .letterhead-table td {
            border: none;
            vertical-align: middle;
        }

        .logo-cell {
            width: 25%;
        }

        .logo-cell img {
            max-width: 140px;
        }

        .title-cell {
            width: 50%;
            text-align: center;
        }

        .contact-cell {
            width: 25%;
            text-align: right;
        }

        .contact-item {
            margin: 1px 0;
            font-size: 13px;
            font-weight: bold;
        }

        /* BORDER */
        .border-thin {
            border-bottom: 1px solid #000;
            margin-top: 5px;
        }

        .border-thick {
            border-bottom: 4px solid #000;
            margin-top: 2px;
            margin-bottom: 15px;
        }

        /* INTRO TEXT */
        .intro-paragraph {
            margin: 12px 0;
            text-align: justify;
        }

        /* TABLE */
        .applicants-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            margin-top: 10px;
            page-break-inside: auto;
        }

        .applicants-table thead {
            display: table-header-group;
        }

        .applicants-table tr {
            page-break-inside: avoid;
        }

        .applicants-table th {
            background: #e6e6e6;
            border: 1.5px solid #000;
            font-weight: bold;
            padding: 6px 4px;
            text-align: left;
        }

        .applicants-table td {
            border: 1.5px solid #000;
            padding: 5px;
            vertical-align: top;
        }

        .sn {
            width: 8%;
            text-align: right;
        }

        .amount {
            text-align: right;
            font-weight: bold;
            padding-right: 8px;
        }

        .total-row td {
            font-weight: bold;
            background: #f2f2f2;
        }

        .empty-state {
            text-align: center;
            padding: 15px;
            font-style: italic;
        }

        .reject-reason {
            color: #cc0000;
            font-size: 12px;
            margin-top: 2px;
        }

        .notes {
            margin-top: 25px;
        }

        ol {
            margin-top: 5px;
        }
    </style>

</head>

<body>

    <!-- LETTERHEAD -->
    <table class="letterhead-table">
        <tr>
            <td class="logo-cell">
                <img src="https://i.ibb.co/27GM3qQ3/ngcdf.png">
            </td>

            <td class="title-cell">
                <h1>KITUI RURAL CONSTITUENCY</h1>
                <h1>{{ $title }}</h1>
                <h3>APPLICANTS MERIT LIST</h3>
            </td>

            <td class="contact-cell">
                <p class="contact-item">National Government Constituencies Development Fund</p>
                <p class="contact-item">Kitui Rural Constituency</p>
                <p class="contact-item">P.O. BOX 1422-90200</p>
                <p class="contact-item">Kitui-Kenya</p>
                <p class="contact-item">Office Contact: 0723 636 367</p>
                <p class="contact-item">Email: cdfkituirural@cdf.go.ke</p>
            </td>
        </tr>
    </table>

    <div class="border-thin"></div>
    <div class="border-thick"></div>

    <!-- APPROVED INTRO -->
    <div class="intro-paragraph">
        The following <strong>{{ count($applicants['approved']) }}</strong> applicants from
        <strong>{{ $title }}</strong> met all the minimum requirements set by
        the NG-CDF Kitui Rural Board during the
        <strong>{{ $financial_year }}</strong> bursary application process and have
        therefore been <strong>APPROVED</strong> as <strong>SUCCESSFUL</strong> beneficiaries.
    </div>

    <!-- APPROVED TABLE -->
    <table class="applicants-table">

        <thead>
            <tr>
                <th class="sn">S/NO</th>
                <th class="institution">INSTITUTION</th>
                <th class="student">NAME OF STUDENT</th>
                <th class="reg">REG / ADM</th>
                <th class="amount">AMOUNT</th>
            </tr>
        </thead>

        <tbody>

            @forelse($applicants['approved'] as $index => $applicant)

                <tr>
                    <td class="sn">{{ $index + 1 }}</td>

                    <td class="institution">
                        {{ strtoupper($applicant->institution->name) }}
                    </td>

                    <td class="student">
                        {{ strtoupper($applicant->student_name) }}
                    </td>

                    <td class="reg">
                        {{ $applicant->admission_number ?? '—' }}
                    </td>

                    <td class="amount">
                        {{ number_format($applicant->amount ?? 0, 2) }}
                    </td>
                </tr>

            @empty

                <tr>
                    <td colspan="5" class="empty-state">
                        No approved applicants for {{ $title }}
                    </td>
                </tr>

            @endforelse

            @if(count($applicants['approved']) > 0)

                <tr class="total-row">
                    <td colspan="4">TOTAL APPROVED AMOUNT</td>
                    <td class="amount">
                        {{ number_format($applicants['approved']->sum('amount'), 2) }}
                    </td>
                </tr>

            @endif

        </tbody>

    </table>

    <!-- REJECTED SECTION -->
    @if (count($applicants['rejected']) > 0)

        <div style="page-break-before: always;"></div>

        <div class="intro-paragraph">
            The following <strong>{{ count($applicants['rejected']) }}</strong> applicants from
            <strong>{{ $title }}</strong> did not meet all the minimum requirements
            set by the NG-CDF Kitui Rural Board during the
            <strong>{{ $financial_year }}</strong> bursary application process and have
            therefore been <strong>REJECTED</strong> hence <strong>UNSUCCESSFUL</strong>.
        </div>

        <table class="applicants-table">

            <thead>
                <tr>
                    <th class="sn">S/NO</th>
                    <th class="institution">INSTITUTION</th>
                    <th class="student">NAME OF STUDENT</th>
                    <th class="reg">REG / ADM</th>
                </tr>
            </thead>

            <tbody>

                @foreach($applicants['rejected'] as $index => $applicant)

                    <tr>

                        <td class="sn">{{ $index + 1 }}</td>

                        <td class="institution">
                            {{ strtoupper($applicant->institution->name) }}

                            @if($applicant->decision_reason)
                                <div class="reject-reason">
                                    {{ $applicant->decision_reason }}
                                </div>
                            @endif
                        </td>

                        <td class="student">
                            {{ strtoupper($applicant->student_name) }}
                        </td>

                        <td class="reg">
                            {{ $applicant->admission_number ?? '—' }}
                        </td>

                    </tr>

                @endforeach

            </tbody>

        </table>

    @endif

    <!-- NOTES -->
    <div class="notes">

        <h4>Notes:</h4>

        <ol>
            <li>ID attached <strong>MUST</strong> be a voter in Kitui Rural Constituency</li>

            <li>
                All required fields/Attachments (Institution, Student Name,
                Admission Number, Parent Phone and Parent ID)
                <strong>MUST</strong> be filled
            </li>

            <li>
                Single applicant per parent ID
                (With an exception of Orphans & Special)
            </li>

            <li>
                Anybody who applied more than once was rejected
            </li>
        </ol>

        <h5>Check your application status online:</h5>

        <a href="https://cdf.frajosantech.co.ke/verify">https://cdf.frajosantech.co.ke/verify</a>

    </div>

</body>

</html>