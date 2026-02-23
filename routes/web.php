<?php

use App\Http\Controllers\ApplicantController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InstitutionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\VoterController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resources([
        'voter' => VoterController::class,
        'institution' => InstitutionController::class,
        'applicant' => ApplicantController::class
    ]);

    Route::group(['prefix' => 'excel'], function () {
        Route::post('/institutions/bulk-import', [InstitutionController::class, 'bulkImport'])->name('import.institutions');
        Route::get('/institutions/export', [InstitutionController::class, 'export'])->name('export.institutions');
        Route::get('/institutions/template', [InstitutionController::class, 'downloadTemplate'])->name('template.institutions');

        Route::post('/applicants/bulk-import', [ApplicantController::class, 'bulkImport'])->name('import.applicants');
        Route::get('/applicants/export', [ApplicantController::class, 'export'])->name('export.applicants');
        Route::get('/applicants/template', [ApplicantController::class, 'downloadTemplate'])->name('template.applicants');
    });

    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::get('/voucher', [ReportController::class, 'voucher'])->name('voucher');
        Route::get('/forwarding', [ReportController::class, 'previewForwardingLetter'])->name('forwarding');
        Route::get('/forwarding/letter', [ReportController::class, 'forwardingLetter'])->name('forwarding.letter');
        Route::get('/forwarding/letter/{institution?}', [ReportController::class, 'forwardingLetter'])->name('institution.forwarding.letter');
        Route::get('/wards', [ReportController::class, 'wardsList'])->name('wards');
        Route::get('/locations', [ReportController::class, 'locationsList'])->name('locations');
    });

    Route::get('/settings', function () {
        return Inertia::render('Admin/Setting');
    })->name('settings');
});

require __DIR__ . '/auth.php';