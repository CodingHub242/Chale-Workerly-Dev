<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Models\TimeSheet;
use App\Models\Client;
use App\Models\Temp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class InvoicePreviewController extends Controller
{
    /**
     * Generate invoice preview from approved timesheets
     * This version fetches temp data through timesheet relationships
     */
    public function previewInvoice(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:clients,id',
            'timesheet_ids' => 'required|array|min:1',
            'timesheet_ids.*' => 'exists:timesheets,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Validation failed', 'details' => $validator->errors()], 422);
        }

        try {
            // Get timesheets with temp relationships
            $timesheets = TimeSheet::whereIn('id', $request->timesheet_ids)
                ->where('status', 'approved')
                ->whereNull('invoice_id') // Only non-invoiced timesheets
                ->with(['temp']) // Load temp relationship
                ->get();

            if ($timesheets->isEmpty()) {
                return response()->json(['error' => 'No eligible timesheets found'], 400);
            }

            // Get client information
            $client = Client::findOrFail($request->client_id);

            // Calculate preview totals and prepare timesheet data
            $subtotal = 0;
            $totalHours = 0;
            $timesheetData = [];

            foreach ($timesheets as $timesheet) {
                // Get temp info through timesheet relationship
                $temp = $timesheet->temp;
                
                if (!$temp) {
                    continue; // Skip if temp not found
                }

                $tempName = trim($temp->firstName . ' ' . $temp->lastName);
                
                // Calculate period display
                $periodStart = $timesheet->period_start_date ? 
                    Carbon::parse($timesheet->period_start_date)->format('M j') : 'N/A';
                $periodEnd = $timesheet->period_end_date ? 
                    Carbon::parse($timesheet->period_end_date)->format('M j, Y') : 'N/A';
                $period = $periodStart . ' - ' . $periodEnd;

                // Get hourly rate (from temp model or timesheet)
                $hourlyRate = $temp->basePay ?? $temp->hourlyRate ?? 15.00; // Default fallback
                
                // Use timesheet totals or calculate from hours and rate
                $hours = $timesheet->totalHours ?? 0;
                $amount = $timesheet->totalPay ?? ($hours * $hourlyRate);

                $subtotal += $amount;
                $totalHours += $hours;

                // Prepare timesheet data for preview
                $timesheetData[] = [
                    'id' => $timesheet->id,
                    'temp_id' => $temp->id,
                    'temp_name' => $tempName,
                    'period' => $period,
                    'period_start' => $timesheet->period_start_date,
                    'period_end' => $timesheet->period_end_date,
                    'hours' => $hours,
                    'rate' => $hourlyRate,
                    'amount' => $amount,
                    'description' => $this->generateTimesheetDescription($timesheet, $temp),
                    'shifts_info' => $this->getShiftsInfo($timesheet)
                ];
            }

            // Calculate tax and total
            $taxRate = config('invoice.default_tax_rate', 0.10); // 10% default
            $taxAmount = $subtotal * $taxRate;
            $totalAmount = $subtotal + $taxAmount;

            // Prepare preview response
            $preview = [
                'client' => [
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email ?? '',
                    'address' => $client->address ?? ''
                ],
                'timesheets' => $timesheetData,
                'summary' => [
                    'total_hours' => round($totalHours, 2),
                    'subtotal' => round($subtotal, 2),
                    'tax_rate' => $taxRate,
                    'tax_amount' => round($taxAmount, 2),
                    'total_amount' => round($totalAmount, 2),
                    'timesheet_count' => count($timesheetData)
                ],
                'temp_summary' => $this->getTempSummary($timesheetData),
                'period_range' => $this->getPeriodRange($timesheets)
            ];

            return response()->json($preview);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate preview',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate description for timesheet line item
     */
    private function generateTimesheetDescription(TimeSheet $timesheet, Temp $temp)
    {
        $tempName = trim($temp->firstName . ' ' . $temp->lastName);
        
        $periodStart = $timesheet->period_start_date ? 
            Carbon::parse($timesheet->period_start_date)->format('M j') : '';
        $periodEnd = $timesheet->period_end_date ? 
            Carbon::parse($timesheet->period_end_date)->format('M j, Y') : '';
        
        $period = $periodStart && $periodEnd ? "({$periodStart} - {$periodEnd})" : '';
        
        $description = "Temporary staffing services - {$tempName} {$period}";
        
        // Add shift information if available
        $shiftsInfo = $this->getShiftsInfo($timesheet);
        if (!empty($shiftsInfo['jobs'])) {
            $jobs = implode(', ', array_unique($shiftsInfo['jobs']));
            $description .= " - {$jobs}";
        }
        
        return $description;
    }

    /**
     * Get shifts information from timesheet
     */
    private function getShiftsInfo(TimeSheet $timesheet)
    {
        $shiftsInfo = [
            'jobs' => [],
            'clients' => [],
            'total_shifts' => 0
        ];

        // Handle JSON shifts structure (current system)
        if ($timesheet->shifts && is_array($timesheet->shifts)) {
            $shiftsInfo['total_shifts'] = count($timesheet->shifts);
            
            foreach ($timesheet->shifts as $shift) {
                if (isset($shift['job_title'])) {
                    $shiftsInfo['jobs'][] = $shift['job_title'];
                }
                if (isset($shift['client_name'])) {
                    $shiftsInfo['clients'][] = $shift['client_name'];
                }
            }
        }

        // Remove duplicates
        $shiftsInfo['jobs'] = array_unique($shiftsInfo['jobs']);
        $shiftsInfo['clients'] = array_unique($shiftsInfo['clients']);

        return $shiftsInfo;
    }

    /**
     * Get summary by temp worker
     */
    private function getTempSummary($timesheetData)
    {
        $tempSummary = [];
        
        foreach ($timesheetData as $timesheet) {
            $tempId = $timesheet['temp_id'];
            $tempName = $timesheet['temp_name'];
            
            if (!isset($tempSummary[$tempId])) {
                $tempSummary[$tempId] = [
                    'temp_id' => $tempId,
                    'temp_name' => $tempName,
                    'total_hours' => 0,
                    'total_amount' => 0,
                    'timesheet_count' => 0,
                    'average_rate' => 0
                ];
            }
            
            $tempSummary[$tempId]['total_hours'] += $timesheet['hours'];
            $tempSummary[$tempId]['total_amount'] += $timesheet['amount'];
            $tempSummary[$tempId]['timesheet_count']++;
        }
        
        // Calculate average rates
        foreach ($tempSummary as &$summary) {
            if ($summary['total_hours'] > 0) {
                $summary['average_rate'] = round($summary['total_amount'] / $summary['total_hours'], 2);
            }
            $summary['total_hours'] = round($summary['total_hours'], 2);
            $summary['total_amount'] = round($summary['total_amount'], 2);
        }
        
        return array_values($tempSummary);
    }

    /**
     * Get the overall period range for all timesheets
     */
    private function getPeriodRange($timesheets)
    {
        $startDates = [];
        $endDates = [];
        
        foreach ($timesheets as $timesheet) {
            if ($timesheet->period_start_date) {
                $startDates[] = Carbon::parse($timesheet->period_start_date);
            }
            if ($timesheet->period_end_date) {
                $endDates[] = Carbon::parse($timesheet->period_end_date);
            }
        }
        
        if (empty($startDates) || empty($endDates)) {
            return null;
        }
        
        $earliestStart = min($startDates);
        $latestEnd = max($endDates);
        
        return [
            'start_date' => $earliestStart->format('Y-m-d'),
            'end_date' => $latestEnd->format('Y-m-d'),
            'start_formatted' => $earliestStart->format('M j, Y'),
            'end_formatted' => $latestEnd->format('M j, Y'),
            'duration_days' => $earliestStart->diffInDays($latestEnd) + 1
        ];
    }

    /**
     * Get detailed temp information for specific timesheets
     */
    public function getTempDetails(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'timesheet_ids' => 'required|array|min:1',
            'timesheet_ids.*' => 'exists:timesheets,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Validation failed', 'details' => $validator->errors()], 422);
        }

        try {
            $timesheets = TimeSheet::whereIn('id', $request->timesheet_ids)
                ->with(['temp'])
                ->get();

            $tempDetails = [];
            
            foreach ($timesheets as $timesheet) {
                $temp = $timesheet->temp;
                
                if ($temp) {
                    $tempId = $temp->id;
                    
                    if (!isset($tempDetails[$tempId])) {
                        $tempDetails[$tempId] = [
                            'temp_id' => $temp->id,
                            'first_name' => $temp->firstName,
                            'last_name' => $temp->lastName,
                            'full_name' => trim($temp->firstName . ' ' . $temp->lastName),
                            'email' => $temp->email ?? '',
                            'phone' => $temp->phone ?? '',
                            'base_pay' => $temp->basePay ?? 0,
                            'hourly_rate' => $temp->hourlyRate ?? $temp->basePay ?? 0,
                            'skills' => $temp->skills ?? [],
                            'timesheets' => []
                        ];
                    }
                    
                    $tempDetails[$tempId]['timesheets'][] = [
                        'timesheet_id' => $timesheet->id,
                        'period_start' => $timesheet->period_start_date,
                        'period_end' => $timesheet->period_end_date,
                        'total_hours' => $timesheet->totalHours,
                        'total_pay' => $timesheet->totalPay,
                        'status' => $timesheet->status
                    ];
                }
            }

            return response()->json([
                'temp_details' => array_values($tempDetails),
                'total_temps' => count($tempDetails)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get temp details',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available temps for timesheet selection
     */
    public function getAvailableTemps(Request $request)
    {
        try {
            // Get temps who have approved timesheets that haven't been invoiced
            $temps = Temp::whereHas('timesheets', function ($query) {
                $query->where('status', 'approved')
                      ->whereNull('invoice_id');
            })
            ->with(['timesheets' => function ($query) {
                $query->where('status', 'approved')
                      ->whereNull('invoice_id')
                      ->orderBy('period_start_date', 'desc');
            }])
            ->get();

            $tempData = [];
            
            foreach ($temps as $temp) {
                $totalHours = $temp->timesheets->sum('totalHours');
                $totalPay = $temp->timesheets->sum('totalPay');
                
                $tempData[] = [
                    'temp_id' => $temp->id,
                    'first_name' => $temp->firstName,
                    'last_name' => $temp->lastName,
                    'full_name' => trim($temp->firstName . ' ' . $temp->lastName),
                    'email' => $temp->email ?? '',
                    'base_pay' => $temp->basePay ?? 0,
                    'available_timesheets' => $temp->timesheets->count(),
                    'total_hours' => $totalHours,
                    'total_pay' => $totalPay,
                    'latest_timesheet_date' => $temp->timesheets->first()?->period_end_date
                ];
            }

            // Sort by latest timesheet date
            usort($tempData, function ($a, $b) {
                return strcmp($b['latest_timesheet_date'] ?? '', $a['latest_timesheet_date'] ?? '');
            });

            return response()->json([
                'available_temps' => $tempData,
                'total_temps' => count($tempData)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get available temps',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}