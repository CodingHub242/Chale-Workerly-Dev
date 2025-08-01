<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\v1\TimesheetController;
use App\Http\Controllers\api\v1\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::prefix('v1')->group(function () {
    // Timesheet routes
    Route::get('/timesheets', [TimesheetController::class, 'index']);
    Route::post('/timesheets', [TimesheetController::class, 'store']);
    Route::get('/timesheets/{id}', [TimesheetController::class, 'show']);
    Route::put('/timesheets/{id}', [TimesheetController::class, 'update']);
    Route::post('/timesheets/{id}/submit', [TimesheetController::class, 'submit']);
    Route::post('/timesheets/{id}/approve', [TimesheetController::class, 'approve']);
    Route::post('/timesheets/{id}/reject', [TimesheetController::class, 'reject']);
    
    // Report routes
    Route::get('/reports/timesheets', [ReportController::class, 'getTimesheetReport']);
    Route::get('/reports/status-distribution', [ReportController::class, 'getStatusDistribution']);
    Route::get('/reports/export', [ReportController::class, 'exportTimesheetData']);
});