<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Get timesheet reports with filtering capabilities
     */
    public function getTimesheetReport(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $tempId = $request->input('temp_id');
        
        $query = DB::table('timesheets as t')
            ->join('temps as temp', 't.temp_id', '=', 'temp.id')
            ->select(
                'temp.id as temp_id',
                'temp.first_name',
                'temp.last_name',
                DB::raw('SUM(t.total_hours) as total_hours'),
                DB::raw('SUM(t.total_pay) as total_pay'),
                DB::raw('COUNT(t.id) as timesheet_count')
            )
            ->groupBy('temp.id', 'temp.first_name', 'temp.last_name');
            
        if ($startDate) {
            $query->where('t.period_end_date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('t.period_start_date', '<=', $endDate);
        }
        
        if ($tempId) {
            $query->where('t.temp_id', '=', $tempId);
        }
        
        $results = $query->get();
        
        return response()->json([
            'data' => $results,
            'summary' => [
                'total_hours' => $results->sum('total_hours'),
                'total_pay' => $results->sum('total_pay'),
                'total_temps' => $results->count()
            ]
        ]);
    }
    
    /**
     * Get timesheet status distribution
     */
    public function getStatusDistribution(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        
        $query = DB::table('timesheets')
            ->select(
                'status',
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('status');
            
        if ($startDate) {
            $query->where('period_end_date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('period_start_date', '<=', $endDate);
        }
        
        $results = $query->get();
        
        return response()->json($results);
    }
    
    /**
     * Export timesheet data as CSV
     */
    public function exportTimesheetData(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $tempId = $request->input('temp_id');
        
        $query = DB::table('timesheets as t')
            ->join('temps as temp', 't.temp_id', '=', 'temp.id')
            ->select(
                'temp.first_name',
                'temp.last_name',
                't.period_start_date',
                't.period_end_date',
                't.total_hours',
                't.total_pay',
                't.status'
            )
            ->orderBy('t.period_start_date');
            
        if ($startDate) {
            $query->where('t.period_end_date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('t.period_start_date', '<=', $endDate);
        }
        
        if ($tempId) {
            $query->where('t.temp_id', '=', $tempId);
        }
        
        $results = $query->get();
        
        // Convert to CSV format
        $csvData = "Temp Name,Period Start,Period End,Hours,Pay,Status\n";
        foreach ($results as $row) {
            $csvData .= "\"{$row->first_name} {$row->last_name}\",{$row->period_start_date},{$row->period_end_date},{$row->total_hours},{$row->total_pay},{$row->status}\n";
        }
        
        $filename = "timesheet_report_" . date('Y-m-d') . ".csv";
        
        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}