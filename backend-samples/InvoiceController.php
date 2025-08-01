<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\TimeSheet;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    /**
     * Generate invoice from approved timesheets
     */
    public function generateInvoice(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:clients,id',
            'timesheet_ids' => 'required|array|min:1',
            'timesheet_ids.*' => 'exists:timesheets,id',
            'due_date' => 'nullable|date|after:today',
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Verify all timesheets are approved and not already invoiced
            $timesheets = Timesheet::whereIn('id', $request->timesheet_ids)
                ->where('status', 'approved')
                ->whereNull('invoice_id')
                ->with(['temp', 'shifts.job'])
                ->get();

            if ($timesheets->count() !== count($request->timesheet_ids)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some timesheets are not available for invoicing'
                ], 400);
            }

            // Get client information
            $client = Client::findOrFail($request->client_id);

            // Generate invoice number
            $invoiceNumber = $this->generateInvoiceNumber();

            // Calculate totals
            $subtotal = 0;
            $totalHours = 0;

            foreach ($timesheets as $timesheet) {
                $subtotal += $timesheet->total_pay;
                $totalHours += $timesheet->total_hours;
            }

            $taxRate = config('invoice.default_tax_rate', 0.10); // 10% default tax
            $taxAmount = $subtotal * $taxRate;
            $total = $subtotal + $taxAmount;

            // Create invoice
            $invoice = Invoice::create([
                'invoice_number' => $invoiceNumber,
                'client_id' => $request->client_id,
                'issue_date' => Carbon::now(),
                'due_date' => $request->due_date ? Carbon::parse($request->due_date) : Carbon::now()->addDays(30),
                'subtotal' => $subtotal,
                'tax_rate' => $taxRate,
                'tax_amount' => $taxAmount,
                'total_amount' => $total,
                'total_hours' => $totalHours,
                'status' => 'pending',
                'notes' => $request->notes,
                'created_by' => auth()->id()
            ]);

            // Create invoice items from timesheets
            foreach ($timesheets as $timesheet) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'timesheet_id' => $timesheet->id,
                    'description' => $this->generateItemDescription($timesheet),
                    'hours' => $timesheet->total_hours,
                    'rate' => $timesheet->hourly_rate,
                    'amount' => $timesheet->total_pay,
                    'temp_name' => $timesheet->temp->firstName . ' ' . $timesheet->temp->lastName,
                    'period_start' => $timesheet->week_start,
                    'period_end' => $timesheet->week_end
                ]);

                // Mark timesheet as invoiced
                $timesheet->update([
                    'invoice_id' => $invoice->id,
                    'invoiced_at' => Carbon::now()
                ]);
            }

            DB::commit();

            // Load the complete invoice with relationships
            $invoice->load(['client', 'items.timesheet.temp', 'createdBy']);

            return response()->json([
                'success' => true,
                'message' => 'Invoice generated successfully',
                'data' => [
                    'invoice' => $invoice,
                    'invoice_url' => route('invoices.show', $invoice->id)
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get invoice preview before generation
     */
    public function previewInvoice(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:clients,id',
            'timesheet_ids' => 'required|array|min:1',
            'timesheet_ids.*' => 'exists:timesheets,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Get timesheets with related data
            $timesheets = Timesheet::whereIn('id', $request->timesheet_ids)
                ->where('status', 'approved')
                ->whereNull('invoice_id')
                ->with(['temp', 'shifts.job'])
                ->get();

            if ($timesheets->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No eligible timesheets found'
                ], 400);
            }

            $client = Client::findOrFail($request->client_id);

            // Calculate preview totals
            $subtotal = $timesheets->sum('total_pay');
            $totalHours = $timesheets->sum('total_hours');
            $taxRate = config('invoice.default_tax_rate', 0.10);
            $taxAmount = $subtotal * $taxRate;
            $total = $subtotal + $taxAmount;

            // Prepare preview data
            $preview = [
                'client' => $client,
                'timesheets' => $timesheets->map(function ($timesheet) {
                    return [
                        'id' => $timesheet->id,
                        'temp_name' => $timesheet->temp->firstName . ' ' . $timesheet->temp->lastName,
                        'period' => $timesheet->week_start . ' to ' . $timesheet->week_end,
                        'hours' => $timesheet->total_hours,
                        'rate' => $timesheet->hourly_rate,
                        'amount' => $timesheet->total_pay,
                        'description' => $this->generateItemDescription($timesheet)
                    ];
                }),
                'summary' => [
                    'total_hours' => $totalHours,
                    'subtotal' => $subtotal,
                    'tax_rate' => $taxRate,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $total,
                    'timesheet_count' => $timesheets->count()
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $preview
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate preview',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all invoices with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Invoice::with(['client', 'items', 'createdBy']);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('client_id')) {
                $query->where('client_id', $request->client_id);
            }

            if ($request->has('date_from')) {
                $query->whereDate('issue_date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->whereDate('issue_date', '<=', $request->date_to);
            }

            // Search by invoice number or client name
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('invoice_number', 'like', "%{$search}%")
                      ->orWhereHas('client', function ($clientQuery) use ($search) {
                          $clientQuery->where('name', 'like', "%{$search}%");
                      });
                });
            }

            $invoices = $query->orderBy('created_at', 'desc')
                             ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $invoices
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch invoices',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single invoice details
     */
    public function show($id): JsonResponse
    {
        try {
            $invoice = Invoice::with([
                'client',
                'items.timesheet.temp',
                'items.timesheet.shifts.job',
                'createdBy'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $invoice
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update invoice status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,sent,paid,overdue,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $invoice = Invoice::findOrFail($id);
            
            $invoice->update([
                'status' => $request->status,
                'updated_by' => auth()->id()
            ]);

            // If marking as paid, record payment date
            if ($request->status === 'paid' && !$invoice->paid_at) {
                $invoice->update(['paid_at' => Carbon::now()]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Invoice status updated successfully',
                'data' => $invoice->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update invoice status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate unique invoice number
     */
    private function generateInvoiceNumber(): string
    {
        $prefix = 'INV';
        $year = Carbon::now()->year;
        $month = Carbon::now()->format('m');
        
        // Get the last invoice number for this month
        $lastInvoice = Invoice::where('invoice_number', 'like', "{$prefix}-{$year}{$month}%")
                             ->orderBy('invoice_number', 'desc')
                             ->first();

        if ($lastInvoice) {
            $lastNumber = (int) substr($lastInvoice->invoice_number, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return "{$prefix}-{$year}{$month}{$newNumber}";
    }

    /**
     * Generate item description from timesheet
     */
    private function generateItemDescription(Timesheet $timesheet): string
    {
        $tempName = $timesheet->temp->firstName . ' ' . $timesheet->temp->lastName;
        $period = Carbon::parse($timesheet->week_start)->format('M j') . ' - ' . 
                 Carbon::parse($timesheet->week_end)->format('M j, Y');
        
        $jobs = $timesheet->shifts->pluck('job.title')->unique()->implode(', ');
        
        return "Temporary staffing services - {$tempName} ({$period})" . 
               ($jobs ? " - {$jobs}" : '');
    }
}