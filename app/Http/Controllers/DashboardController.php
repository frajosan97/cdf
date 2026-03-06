<?php

namespace App\Http\Controllers;

use App\Models\Applicant;
use App\Models\Institution;
use App\Models\Voter;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // ==============================
        // General Stats Cards
        // ==============================
        $totalApplicants = Applicant::count();
        $successFullApplicants = Applicant::where('decision', 'approved')->count();
        $unsuccessFullApplicants = Applicant::where('decision', 'rejected')->count();

        $statsCards = [
            [
                'title' => 'Institutions',
                'value' => number_format(Institution::count()),
                'icon' => '🏫',
                'link' => route('institution.index'),
                'color' => 'primary',
                'description' => 'Registered institutions',
            ],
            [
                'title' => 'Applicants',
                'value' => number_format($totalApplicants),
                'icon' => '👥',
                'link' => route('applicant.index'),
                'color' => 'info',
                'description' =>
                    '<p class="m-0 p-0 text-success">✅ Successful: ' . number_format($successFullApplicants) . '</p> 
                    <p class="m-0 p-0 text-danger">❌ Unsuccessful: ' . number_format($unsuccessFullApplicants) . '</p>',
            ],
            [
                'title' => 'Voters',
                'value' => number_format(Voter::count()),
                'icon' => '👥',
                'link' => route('voter.index'),
                'color' => 'warning',
                'description' => 'Registered voters',
            ],
            [
                'title' => 'Total Funds',
                'value' => number_format(Applicant::sum('amount')),
                'icon' => '💰',
                'link' => '#',
                'color' => 'success',
                'description' => 'Total funds allocated',
            ],
        ];

        // ==============================
        // Category Statistics
        // ==============================
        $categories = config('app.categories') ?? [];

        $categoryStats = collect($categories)->map(function ($category) {

            $query = Applicant::whereHas('institution', function ($q) use ($category) {
                $q->where('category', $category);
            });

            return [
                'category' => ucfirst($category),
                'applicants' => $query->count(),
                'amount' => $query->sum('amount'),
                'icon' => '💰',
            ];
        })->values(); // Important: ensures proper indexed array

        return Inertia::render('Admin/Dashboard', [
            'dashboardData' => [
                'statsCards' => $statsCards,
                'categoryStats' => $categoryStats,
            ],
        ]);
    }
}