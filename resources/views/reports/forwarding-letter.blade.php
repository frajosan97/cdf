<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NG-CDF Bursary Letter – Kitui Rural</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        .letterhead {
            width: 100%;
            border-collapse: collapse;
        }

        .letterhead img {
            max-width: 150px;
            height: auto;
        }

        .letterhead p {
            margin: 0;
            padding: 0;
            font-weight: bold;
        }

        .letterhead .left-content {
            text-align: left;
            width: 30%;
        }

        .letterhead .right-content {
            text-align: right;
            width: 70%;
        }

        .border-bottom-1 {
            border-bottom: 1px solid black;
            width: 100%;
            margin: 1px 0;
        }

        .border-bottom-5 {
            border-bottom: 5px solid black;
            width: 100%;
            margin: 1px 0;
        }

        .date {
            text-align: right;
            margin-top: 20px;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>

<body>

    @foreach($institutions as $institution)

        <!-- Letterhead -->
        <table class="table letterhead" style="border: none;">
            <tr>
                <td class="left-content" style="border: none;">
                    <img src="{{ public_path('storage/images/logo.png') }}" alt="NGCDF Logo">
                </td>
                <td class="right-content" style="border: none;">
                    <p>National Government Constituencies Development Fund</p>
                    <p>Kitui Rural Constituency</p>
                    <p>P.O BOX 1422-90200</p>
                    <p>Kitui-Kenya</p>
                    <p>Office Contact: 0723636367</p>
                    <p>Email: cdfkituirural@cdf.go.ke</p>
                </td>
            </tr>
        </table>

        <div class="border-bottom-1"></div>
        <div class="border-bottom-5"></div>

        <!-- Body -->
        <h4 class="date">{{ settingInfo()->date }}</h4>

        <h4>{{ $institution->category === "secondary" ? 'THE PRINCIPAL' : 'THE FINANCE OFFICER' }},</h4>
        <h4>{{ strtoupper($institution->name) }}</h4>
        <h4><u>RE: NG-CDF KITUI RURAL BURSARY {{ settingInfo()->financialYear }} LIST OF BENEFICIARIES.</u></h4>

        <p style="text-align: justify;">
            Enclosed herein, please find bursary cheque
            <strong>No. ................................</strong>
            of Ksh. <strong>{{ number_format($institution->applicants->sum('amount'), 2) }}</strong>
            for the following No:
            <strong>{{ $institution->applicants->count() }}
                {{ $institution->applicants->count() > 1 ? 'beneficiaries' : 'beneficiary' }}</strong> in your institution.
        </p>

        <!-- <table class="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Applicant Name</th>
                                                        <th>Ward</th>
                                                        <th>Location</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    @forelse($institution->applicants as $index => $applicant)
                                                        <tr>
                                                            <td>{{ $index + 1 }}</td>
                                                            <td>{{ $applicant->name }}</td>
                                                            <td>{{ $applicant->ward->name ?? '-' }}</td>
                                                            <td>{{ $applicant->location->name ?? '-' }}</td>
                                                        </tr>
                                                    @empty
                                                        <tr>
                                                            <td colspan="4" class="text-center">No approved applicants</td>
                                                        </tr>
                                                    @endforelse
                                                </tbody>
                                            </table>

                                            <br><br>

                                            <p>
                                                Yours faithfully,
                                            </p>

                                            <br><br>

                                            <p><strong>NG-CDF KITUI RURAL</strong></p> -->

        {{-- Page break only if not last --}}
        @if(!$loop->last)
            <div class="page-break"></div>
        @endif

    @endforeach

</body>

</html>