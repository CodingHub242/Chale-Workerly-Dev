<?php

/*
|--------------------------------------------------------------------------
| Invoice Preview API Routes - Laravel Implementation
|--------------------------------------------------------------------------
|
| These routes handle invoice preview functionality with proper temp
| data fetching through timesheet relationships.
|
| Add these routes to your routes/api.php file within the v1 group.
|
*/

use App\Http\Controllers\api\v1\InvoicePreviewController;

Route::prefix('v1')->group(function () {
    
    // Invoice Preview Routes
    Route::prefix('invoices')->group(function () {
        
        // Generate invoice preview from timesheets (with temp data through relationships)
        Route::post('/preview-detailed', [InvoicePreviewController::class, 'previewInvoice']);
        
        // Get detailed temp information for specific timesheets
        Route::post('/temp-details', [InvoicePreviewController::class, 'getTempDetails']);
        
        // Get available temps who have uninvoiced approved timesheets
        Route::get('/available-temps', [InvoicePreviewController::class, 'getAvailableTemps']);
        
    });
    
    // Alternative route structure (if you prefer different organization)
    Route::prefix('preview')->group(function () {
        
        // Generate detailed invoice preview
        Route::post('/invoice', [InvoicePreviewController::class, 'previewInvoice']);
        
        // Get temp details for timesheets
        Route::post('/temp-details', [InvoicePreviewController::class, 'getTempDetails']);
        
        // Get available temps for invoice generation
        Route::get('/available-temps', [InvoicePreviewController::class, 'getAvailableTemps']);
        
    });
    
});

/*
|--------------------------------------------------------------------------
| Usage Examples
|--------------------------------------------------------------------------
|
| Here are examples of how to use these endpoints:
|
*/

/**
 * Example 1: Generate Invoice Preview
 * 
 * POST /api/v1/invoices/preview-detailed
 * Content-Type: application/json
 * 
 * {
 *   "client_id": 1,
 *   "timesheet_ids": [1, 2, 3]
 * }
 * 
 * Response:
 * {
 *   "client": {
 *     "id": 1,
 *     "name": "ABC Company",
 *     "email": "billing@abc.com",
 *     "address": "123 Main St"
 *   },
 *   "timesheets": [
 *     {
 *       "id": 1,
 *       "temp_id": 5,
 *       "temp_name": "John Doe",
 *       "period": "Jan 1 - Jan 7, 2024",
 *       "hours": 40,
 *       "rate": 15.00,
 *       "amount": 600.00,
 *       "description": "Temporary staffing services - John Doe (Jan 1 - Jan 7, 2024)"
 *     }
 *   ],
 *   "summary": {
 *     "total_hours": 120.00,
 *     "subtotal": 1800.00,
 *     "tax_rate": 0.10,
 *     "tax_amount": 180.00,
 *     "total_amount": 1980.00,
 *     "timesheet_count": 3
 *   },
 *   "temp_summary": [
 *     {
 *       "temp_id": 5,
 *       "temp_name": "John Doe",
 *       "total_hours": 80.00,
 *       "total_amount": 1200.00,
 *       "timesheet_count": 2,
 *       "average_rate": 15.00
 *     }
 *   ],
 *   "period_range": {
 *     "start_date": "2024-01-01",
 *     "end_date": "2024-01-21",
 *     "start_formatted": "Jan 1, 2024",
 *     "end_formatted": "Jan 21, 2024",
 *     "duration_days": 21
 *   }
 * }
 */

/**
 * Example 2: Get Temp Details
 * 
 * POST /api/v1/invoices/temp-details
 * Content-Type: application/json
 * 
 * {
 *   "timesheet_ids": [1, 2, 3]
 * }
 * 
 * Response:
 * {
 *   "temp_details": [
 *     {
 *       "temp_id": 5,
 *       "first_name": "John",
 *       "last_name": "Doe",
 *       "full_name": "John Doe",
 *       "email": "john.doe@email.com",
 *       "phone": "+1234567890",
 *       "base_pay": 15.00,
 *       "hourly_rate": 15.00,
 *       "skills": ["General Labor", "Warehouse"],
 *       "timesheets": [
 *         {
 *           "timesheet_id": 1,
 *           "period_start": "2024-01-01",
 *           "period_end": "2024-01-07",
 *           "total_hours": 40,
 *           "total_pay": 600.00,
 *           "status": "approved"
 *         }
 *       ]
 *     }
 *   ],
 *   "total_temps": 2
 * }
 */

/**
 * Example 3: Get Available Temps
 * 
 * GET /api/v1/invoices/available-temps
 * 
 * Response:
 * {
 *   "available_temps": [
 *     {
 *       "temp_id": 5,
 *       "first_name": "John",
 *       "last_name": "Doe",
 *       "full_name": "John Doe",
 *       "email": "john.doe@email.com",
 *       "base_pay": 15.00,
 *       "available_timesheets": 3,
 *       "total_hours": 120.00,
 *       "total_pay": 1800.00,
 *       "latest_timesheet_date": "2024-01-21"
 *     }
 *   ],
 *   "total_temps": 5
 * }
 */

/*
|--------------------------------------------------------------------------
| Frontend Integration Examples
|--------------------------------------------------------------------------
|
| Here's how to integrate these endpoints with your Angular service:
|
*/

/**
 * Angular Service Methods
 */
/*
// Add these methods to your InvoiceService

generateDetailedInvoicePreview(request: InvoicePreviewRequest): Observable<any> {
  return this.http.post(`${this.apiUrl}/preview-detailed`, request)
    .pipe(
      catchError(error => {
        console.error('Error generating detailed invoice preview:', error);
        throw error;
      })
    );
}

getTempDetails(timesheetIds: number[]): Observable<any> {
  return this.http.post(`${this.apiUrl}/temp-details`, { timesheet_ids: timesheetIds })
    .pipe(
      catchError(error => {
        console.error('Error fetching temp details:', error);
        throw error;
      })
    );
}

getAvailableTemps(): Observable<any> {
  return this.http.get(`${this.apiUrl}/available-temps`)
    .pipe(
      catchError(error => {
        console.error('Error fetching available temps:', error);
        throw error;
      })
    );
}
*/

/**
 * Component Usage Example
 */
/*
// In your TimesheetsPage component

previewDetailedInvoice(timesheetIds: number[], clientId: number) {
  this.invoiceService.generateDetailedInvoicePreview({
    client_id: clientId,
    timesheet_ids: timesheetIds
  }).subscribe({
    next: (preview) => {
      this.showDetailedInvoicePreview(preview);
    },
    error: (error) => {
      console.error('Error generating detailed preview:', error);
      this.showErrorToast('Failed to generate detailed invoice preview');
    }
  });
}

async showDetailedInvoicePreview(preview: any) {
  let message = `<strong>Detailed Invoice Preview</strong><br><br>`;
  message += `<strong>Client:</strong> ${preview.client.name}<br><br>`;
  
  // Summary information
  message += `<strong>Summary:</strong><br>`;
  message += `Total Hours: ${preview.summary.total_hours}<br>`;
  message += `Subtotal: $${preview.summary.subtotal.toFixed(2)}<br>`;
  message += `Tax (${(preview.summary.tax_rate * 100).toFixed(1)}%): $${preview.summary.tax_amount.toFixed(2)}<br>`;
  message += `<strong>Total: $${preview.summary.total_amount.toFixed(2)}</strong><br><br>`;
  
  // Temp summary
  if (preview.temp_summary && preview.temp_summary.length > 0) {
    message += `<strong>Workers:</strong><br>`;
    preview.temp_summary.forEach((temp: any) => {
      message += `• ${temp.temp_name}: ${temp.total_hours}h @ avg $${temp.average_rate}/hr = $${temp.total_amount.toFixed(2)}<br>`;
    });
    message += `<br>`;
  }
  
  // Period range
  if (preview.period_range) {
    message += `<strong>Period:</strong> ${preview.period_range.start_formatted} to ${preview.period_range.end_formatted}<br>`;
    message += `<strong>Duration:</strong> ${preview.period_range.duration_days} days<br>`;
  }

  const alert = await this.alertController.create({
    header: 'Detailed Invoice Preview',
    message: message,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Generate Invoice',
        handler: () => {
          this.createInvoice(preview.timesheets.map((t: any) => t.id), preview.client.id);
        }
      }
    ]
  });

  await alert.present();
}
*/