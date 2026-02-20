<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NG-CDF Bursary Letter – Kitui Rural</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            font-family: 'DejaVu Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #1e1e1e;
            background: #fff;
            padding: 40px 35px;
            max-width: 900px;
            margin: 0 auto;
        }

        .letterhead {
            border-bottom: 2px solid #0a4b7a;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .letterhead h2 {
            color: #0a4b7a;
            font-size: 22px;
            font-weight: 600;
            letter-spacing: 0.3px;
            margin: 0;
        }

        .letterhead .office {
            font-weight: 500;
            color: #2d2d2d;
            font-size: 13px;
        }

        .letterhead .contact-line {
            font-size: 11px;
            color: #3d3d3d;
        }

        .date {
            text-align: right;
            font-weight: 500;
            margin: 25px 0 15px;
            font-size: 12.5px;
        }

        .recipient {
            margin: 15px 0 20px;
        }

        .recipient p {
            margin: 2px 0;
        }

        .subject-line {
            font-weight: 600;
            margin: 15px 0 10px;
            text-decoration: underline;
            text-underline-offset: 3px;
            font-size: 13px;
        }

        .enclosure {
            margin: 12px 0 16px;
        }

        .enclosure p {
            margin: 3px 0;
        }

        /* Custom table styling with Bootstrap overrides */
        .table-bursary {
            margin: 20px 0 15px;
            font-size: 12px;
        }

        .table-bursary th {
            background-color: #0a4b7a !important;
            color: white;
            font-weight: 500;
            padding: 8px 5px;
            border: 1px solid #0a4b7a !important;
            vertical-align: middle;
        }

        .table-bursary td {
            padding: 7px 5px;
            border: 1px solid #aaa !important;
        }

        .table-bursary tbody tr:nth-child(even) {
            background-color: #f2f7fc;
        }

        .table-bursary .total-row {
            background-color: #dde9f5 !important;
            font-weight: 600;
        }

        .table-bursary .total-row td {
            background-color: #dde9f5;
            border-color: #7f9fb5 !important;
        }

        .amount-cell {
            text-align: right;
            padding-right: 15px !important;
        }

        .signature-block {
            margin-top: 45px;
        }

        .signature-name {
            font-weight: 600;
            margin: 5px 0 0;
        }

        .signature-title {
            margin: 2px 0;
            font-style: normal;
        }

        .acknowledge {
            margin: 22px 0 5px;
            font-style: italic;
        }

        .footer-note {
            margin-top: 25px;
            border-top: 1px dashed #ccc;
            padding-top: 12px;
            font-size: 10.5px;
            color: #3f3f3f;
        }

        .cheque-placeholder {
            border-bottom: 1px dotted black;
            display: inline-block;
            width: 120px;
            margin: 0 8px;
        }

        /* Bootstrap overrides for print */
        @media print {
            body {
                padding: 0.5in;
                max-width: 100%;
            }

            .table-bursary th {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .table-bursary tbody tr:nth-child(even),
            .table-bursary .total-row td {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }

        /* Custom spacing utilities */
        .text-primary-navy {
            color: #0a4b7a;
        }
    </style>
</head>

<body>

    <!-- Letterhead using Bootstrap grid -->
    <table class="table">
        <tr>
            <td><img src="https://i.ibb.co/27GM3qQ3/ngcdf.png" alt=""></td>
            <td>
                <p>National Government Constituencies Development Fund</p>
                <p>Kitui Rural Constituency</p>
                <p>P.O BOX 1422-90200</p>
                <p>Kitui-Kenya</p>
                <p>Office Contact: 0723636367</p>
                <p>Email: cdfkituirural@cdf.go.ke</p>
            </td>
        </tr>
    </table>

    <!-- DATE -->
    <div class="date">
        20th Mar, 2024
    </div>

    <!-- RECIPIENT -->
    <div class="recipient">
        <p class="fw-bold mb-0">THE FINANCE OFFICER,</p>
        <p class="mb-0">AGA KHAN UNIVERSITY</p>
    </div>

    <!-- SUBJECT LINE -->
    <div class="subject-line">
        RE: NG-CDF KITUI RURAL BURSARY 2023/2024 LIST OF BENEFICIARIES.
    </div>

    <!-- ENCLOSURE TEXT -->
    <div class="enclosure">
        <p>Enclosed herein please find bursary cheque No.
            <span class="cheque-placeholder"></span>
            Of Ksh. 4,000.00
        </p>
        <p>for the following No. 1 beneficiary in your institution.</p>
    </div>

    <!-- Bootstrap Table -->
    <table class="table table-bordered table-bursary">
        <thead>
            <tr>
                <th scope="col" style="width: 10%">S/NO</th>
                <th scope="col" style="width: 45%">NAME</th>
                <th scope="col" style="width: 25%">REG/ADM NUMBER</th>
                <th scope="col" style="width: 20%">AMOUNT</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1.</td>
                <td>ANNET KAVATA KALWA</td>
                <td>606995</td>
                <td class="amount-cell">4,000.00</td>
            </tr>
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="3" class="text-end fw-bold">TOTAL</td>
                <td class="amount-cell fw-bold">4,000.00</td>
            </tr>
        </tfoot>
    </table>

    <!-- ACKNOWLEDGE REQUEST -->
    <div class="acknowledge">
        <p class="mb-0">Please acknowledge the receipt of this cheque.</p>
    </div>

    <!-- SIGNATURE BLOCK -->
    <div class="signature-block">
        <p class="signature-name mb-0">Ezekiel K. Mwangangi,</p>
        <p class="signature-title mb-0">NG-CDF FUND ACCOUNT MANAGER</p>
        <p class="signature-title">KITUI RURAL</p>
    </div>

    <!-- FOOTER -->
    <div class="footer-note text-center">
        <span class="text-secondary">◆ Official bursary list – Kitui Rural Constituency ◆</span>
    </div>

    <!-- Optional: Bootstrap JS bundle (not needed for static display but included for completeness) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>

</body>

</html>