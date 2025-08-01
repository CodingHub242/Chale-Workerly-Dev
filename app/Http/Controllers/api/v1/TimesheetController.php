<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Models\Timesheet;
use App\Models\Temp;
use App\Notifications\TimesheetStatusNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;

class TimesheetController extends Controller
{
    /**
     * Get all timesheets with optional filtering
     */
    public function index(Request $request)
    {
        $tempId = $request->input('temp_id');
        $status = $request->input('status');
        
        $query = Timesheet::query();
        
        if ($tempId) {
            $query->where('temp_id', $tempId);
        }
        
        if ($status) {
            $query->where('status', $status);
        }
        
        $timesheets = $query->get();
        
        return response()->json($timesheets);
    }
    
    /**
     * Get a specific timesheet
     */
    public function show($id)
    {
        $timesheet = Timesheet::find($id);
        if (!$timesheet) {
            return response()->json(['error' => 'Timesheet not found'], 404);
        }
        
        return response()->json($timesheet);
    }
    
    /**
     * Create a new timesheet
     */
    public function store(Request $request)
    {
        $data = $request->all();
        
        // Handle entries - if they're sent as a JSON string, decode them
        if (isset($data['entries']) && is_string($data['entries'])) {
            $data['entries'] = json_decode($data['entries'], true);
        }
        
        // Create the timesheet with entries
        $timesheet = Timesheet::create($data);
        
        return response()->json($timesheet, 201);
    }
    
    /**
     * Update a timesheet
     */
    public function update(Request $request, $id)
    {
        $timesheet = Timesheet::find($id);
        if (!$timesheet) {
            return response()->json(['error' => 'Timesheet not found'], 404);
        }
        
        $data = $request->all();
        
        // Handle entries - if they're sent as a JSON string, decode them
        if (isset($data['entries']) && is_string($data['entries'])) {
            $data['entries'] = json_decode($data['entries'], true);
        }
        
        // Update the timesheet with all data including entries
        $timesheet->update($data);
        
        return response()->json($timesheet);
    }
    
    /**
     * Submit timesheet for approval
     */
    public function submit($id)
    {
        $timesheet = Timesheet::find($id);
        if (!$timesheet) {
            return response()->json(['error' => 'Timesheet not found'], 404);
        }

        if ($timesheet->status !== 'draft') {
            return response()->json(['error' => 'Only draft timesheets can be submitted'], 400);
        }

        $timesheet->status = 'submitted';
        $timesheet->submittedDate = now();
        $timesheet->save();

        return response()->json(['message' => 'Timesheet submitted for approval', 'timesheet' => $timesheet]);
    }

    /**
     * Approve timesheet
     */
    public function approve(Request $request, $id)
    {
        $timesheet = Timesheet::find($id);
        if (!$timesheet) {
            return response()->json(['error' => 'Timesheet not found'], 404);
        }

        if ($timesheet->status !== 'submitted') {
            return response()->json(['error' => 'Only submitted timesheets can be approved'], 400);
        }

        $approverId = $request->input('approverId');
        $timesheet->status = 'approved';
        $timesheet->approvedBy = $approverId;
        $timesheet->approvedDate = now();
        $timesheet->save();

        // Notify temp about approval
        $temp = Temp::find($timesheet->temp_id);
        if ($temp) {
            Notification::send($temp, new TimesheetStatusNotification($timesheet, 'approved'));
        }

        return response()->json(['message' => 'Timesheet approved', 'timesheet' => $timesheet]);
    }

    /**
     * Reject timesheet
     */
    public function reject(Request $request, $id)
    {
        $timesheet = Timesheet::find($id);
        if (!$timesheet) {
            return response()->json(['error' => 'Timesheet not found'], 404);
        }

        if ($timesheet->status !== 'submitted') {
            return response()->json(['error' => 'Only submitted timesheets can be rejected'], 400);
        }

        $rejectionReason = $request->input('rejectionReason');
        $timesheet->status = 'rejected';
        $timesheet->rejectionReason = $rejectionReason;
        $timesheet->approvedBy = null;
        $timesheet->approvedDate = null;
        $timesheet->save();

        // Notify temp about rejection
        $temp = Temp::find($timesheet->temp_id);
        if ($temp) {
            Notification::send($temp, new TimesheetStatusNotification($timesheet, 'rejected', $rejectionReason));
        }

        return response()->json(['message' => 'Timesheet rejected', 'timesheet' => $timesheet]);
    }
}
