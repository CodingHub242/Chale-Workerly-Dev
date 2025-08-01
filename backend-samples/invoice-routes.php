<?php

use App\Http\Controllers\InvoiceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Invoice API Routes
|--------------------------------------------------------------------------
|
| Here are the API routes for the invoice management system.
| These routes are protected by authentication middleware.
|
*/

Route::middleware(['auth:sanctum'])->group(function () {
    
    // Invoice Management Routes
    Route::prefix('invoices')->group(function () {
        
        // Get all invoices with filtering and pagination
        Route::get('/', [InvoiceController::class, 'index']);
        
        // Get single invoice details
        Route::get('/{id}', [InvoiceController::class, 'show']);
        
        // Generate invoice preview from timesheets
        Route::post('/preview', [InvoiceController::class, 'previewInvoice']);
        
        // Generate invoice from approved timesheets
        Route::post('/generate', [InvoiceController::class, 'generateInvoice']);
        
        // Update invoice status
        Route::patch('/{id}/status', [InvoiceController::class, 'updateStatus']);
        
        // Mark invoice as paid
        Route::patch('/{id}/mark-paid', [InvoiceController::class, 'markAsPaid']);
        
        // Cancel invoice
        Route::patch('/{id}/cancel', [InvoiceController::class, 'cancel']);
        
        // Get invoice PDF
        Route::get('/{id}/pdf', [InvoiceController::class, 'generatePDF']);
        
        // Send invoice via email
        Route::post('/{id}/send', [InvoiceController::class, 'sendInvoice']);
        
        // Get invoice statistics
        Route::get('/stats/overview', [InvoiceController::class, 'getStatistics']);
        
        // Get overdue invoices
        Route::get('/status/overdue', [InvoiceController::class, 'getOverdueInvoices']);
        
        // Bulk operations
        Route::post('/bulk/mark-sent', [InvoiceController::class, 'bulkMarkAsSent']);
        Route::post('/bulk/mark-paid', [InvoiceController::class, 'bulkMarkAsPaid']);
        
    });
    
    // Invoice Items Routes (if needed for individual item management)
    Route::prefix('invoice-items')->group(function () {
        
        // Get items for specific invoice
        Route::get('/invoice/{invoiceId}', [InvoiceController::class, 'getInvoiceItems']);
        
    });
    
    // Timesheet Invoice Status Routes
    Route::prefix('timesheets')->group(function () {
        
        // Get approved timesheets available for invoicing
        Route::get('/available-for-invoice', [InvoiceController::class, 'getAvailableTimesheets']);
        
        // Get invoiced timesheets
        Route::get('/invoiced', [InvoiceController::class, 'getInvoicedTimesheets']);
        
        // Remove timesheet from invoice (if invoice is still editable)
        Route::delete('/{id}/remove-from-invoice', [InvoiceController::class, 'removeTimesheetFromInvoice']);
        
    });
    
});

/*
|--------------------------------------------------------------------------
| Additional Invoice Controller Methods
|--------------------------------------------------------------------------
|
| Here are additional methods you would add to the InvoiceController
| to support the routes above:
|
*/

// Add these methods to InvoiceController.php:

/*
public function markAsPaid($id): JsonResponse
{
    try {
        $invoice = Invoice::findOrFail($id);
        
        if ($invoice->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Invoice is already marked as paid'
            ], 400);
        }
        
        $invoice->markAsPaid();
        
        return response()->json([
            'success' => true,
            'message' => 'Invoice marked as paid successfully',
            'data' => $invoice->fresh()
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to mark invoice as paid',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function cancel($id): JsonResponse
{
    try {
        $invoice = Invoice::findOrFail($id);
        
        if (!$invoice->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice cannot be cancelled'
            ], 400);
        }
        
        $invoice->update(['status' => 'cancelled']);
        
        // Remove invoice reference from timesheets
        $invoice->timesheets()->update([
            'invoice_id' => null,
            'invoiced_at' => null
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Invoice cancelled successfully',
            'data' => $invoice->fresh()
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to cancel invoice',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function getStatistics(): JsonResponse
{
    try {
        $stats = [
            'total_invoices' => Invoice::count(),
            'pending_invoices' => Invoice::pending()->count(),
            'paid_invoices' => Invoice::paid()->count(),
            'overdue_invoices' => Invoice::overdue()->count(),
            'total_revenue' => Invoice::paid()->sum('total_amount'),
            'pending_revenue' => Invoice::whereIn('status', ['pending', 'sent'])->sum('total_amount'),
            'overdue_revenue' => Invoice::overdue()->sum('total_amount'),
            'current_month_revenue' => Invoice::paid()
                ->whereMonth('paid_at', Carbon::now()->month)
                ->whereYear('paid_at', Carbon::now()->year)
                ->sum('total_amount'),
            'average_invoice_amount' => Invoice::avg('total_amount')
        ];
        
        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to get statistics',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function getAvailableTimesheets(): JsonResponse
{
    try {
        $timesheets = Timesheet::where('status', 'approved')
            ->whereNull('invoice_id')
            ->with(['temp', 'shifts.job', 'shifts.client'])
            ->orderBy('week_end', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $timesheets
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to get available timesheets',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function getOverdueInvoices(): JsonResponse
{
    try {
        $overdueInvoices = Invoice::overdue()
            ->with(['client', 'items'])
            ->orderBy('due_date', 'asc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $overdueInvoices
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to get overdue invoices',
            'error' => $e->getMessage()
        ], 500);
    }
}
*/