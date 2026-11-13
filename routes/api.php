<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\v1\TimesheetController;
use App\Http\Controllers\api\v1\ReportController;
use App\Http\Controllers\api\v1\WorkerController;

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
    ///////////////WORKERLY CLIENT CALLS/////////////////////////////////////
    Route::get('/clients',[v1\WorkerController::class, 'getClients']);
    Route::post('/clients',[v1\WorkerController::class, 'AddClient']);
    Route::get('/clients/{id}',[v1\WorkerController::class, 'getClient']);
    Route::put('/clients/{id}',[v1\WorkerController::class, 'UpdateClient']);

    //////////SHIFTS CALLS
    //Route::get('/clients',[v1\WorkerController::class, 'getClients']);
    Route::post('/shifts',[v1\WorkerController::class, 'AddShift']);
    Route::get('/shifts',[v1\WorkerController::class, 'getShifts']);
    Route::get('/shifts/{id}',[v1\WorkerController::class, 'getShift']);
    Route::put('/shifts/{id}',[v1\WorkerController::class, 'UpdateShift']);
    Route::put('/updateStat/{id}',[v1\WorkerController::class, 'UpdateShiftStat']);
    Route::put('/updateStat/tstat/{shift}',[v1\WorkerController::class, 'UpdateShiftTStat']);
    Route::get('/shifts/temp/{tempId}',[v1\WorkerController::class, 'getTempShifts']);
    Route::get('/shifts/job/{jobId}/date/{date}', [v1\WorkerController::class, 'getShiftsByJobAndDate']);

     //////////JOBS CALLS
    Route::post('/jobs',[v1\WorkerController::class, 'AddJob']);
    Route::get('/jobs',[v1\WorkerController::class, 'getJobs']);
    Route::get('/jobs/{id}',[v1\WorkerController::class, 'getJob']);
    Route::put('/jobs/{id}',[v1\WorkerController::class, 'UpdateJob']);
    Route::put('/updateJobStat/{id}',[v1\WorkerController::class, 'UpdateJobStat']);
    Route::get('/jobs/client/{clientId}',[v1\WorkerController::class, 'getClientJobs']);
    Route::post('/jobs/{job}/attachments', [v1\WorkerController::class, 'addAttachments']);
    Route::delete('/jobs/{job}/attachments/{attachment}', [v1\WorkerController::class, 'deleteAttachment']);
    Route::post('/jobs/attachments/send-email', [v1\WorkerController::class, 'sendAttachmentByEmail']);

     ///////TEMPS CALLS
    Route::post('/temps',[v1\WorkerController::class, 'AddTemp']);
    Route::get('/temps',[v1\WorkerController::class, 'getTemps']);
    Route::get('/temps/{id}',[v1\WorkerController::class, 'getTemp']);
    Route::put('/temps/{id}',[v1\WorkerController::class, 'UpdateTemp']);
    Route::post('/temps/{id}/upload-profile-picture',[v1\WorkerController::class, 'uploadProfilePicture']);
    Route::get('/temps/{id}/approve',[v1\WorkerController::class, 'approveTemp']);
    Route::get('/temps/{id}/decline',[v1\WorkerController::class, 'declineTemp']);

    ////////WORKERLY AUTHENTICATION
    Route::post('/workerly/login', [v1\WorkerController::class, 'signin']);
    Route::post('/workerly/signup', [v1\WorkerController::class, 'signup']);
    Route::post('/workerly/loginTemp', [v1\WorkerController::class, 'loginTemp']);
    Route::post('/workerly/signTemp', [v1\WorkerController::class, 'signTemp']);
    Route::post('/workerly/forgot-password', [v1\WorkerController::class, 'forgot_password']);
    Route::post('/workerly/reset-password', [v1\WorkerController::class, 'reset_password']);
});
