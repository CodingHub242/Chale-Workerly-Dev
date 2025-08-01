# Laravel Backend Invoice System Implementation

This directory contains Laravel backend samples showing how invoice details will be saved and managed in the database. The implementation provides a complete invoice generation system that integrates with the existing timesheet management.

## Overview

The invoice system allows administrators to:
- Generate invoices from approved timesheets
- Preview invoices before creation
- Track invoice status (pending, sent, paid, overdue, cancelled)
- Associate invoices with clients
- Manage invoice items and calculate totals automatically
- Generate reports and statistics

## Database Structure

### Tables

#### 1. `invoices` Table
Stores main invoice information:
- `id` - Primary key
- `invoice_number` - Unique invoice identifier (auto-generated)
- `client_id` - Foreign key to clients table
- `issue_date` - Date invoice was created
- `due_date` - Payment due date
- `subtotal` - Total before tax
- `tax_rate` - Tax percentage (e.g., 0.1000 for 10%)
- `tax_amount` - Calculated tax amount
- `total_amount` - Final total including tax
- `total_hours` - Sum of all hours from timesheet items
- `status` - Invoice status (pending, sent, paid, overdue, cancelled)
- `notes` - Optional notes
- `paid_at` - Timestamp when marked as paid
- `created_by` - User who created the invoice
- `updated_by` - User who last updated the invoice

#### 2. `invoice_items` Table
Stores individual line items for each invoice:
- `id` - Primary key
- `invoice_id` - Foreign key to invoices table
- `timesheet_id` - Foreign key to timesheets table
- `description` - Item description (auto-generated from timesheet)
- `hours` - Hours worked
- `rate` - Hourly rate
- `amount` - Total amount (hours × rate)
- `temp_name` - Temporary worker name
- `period_start` - Work period start date
- `period_end` - Work period end date

#### 3. Updated `timesheets` Table
Added fields to track invoice association:
- `invoice_id` - Foreign key to invoices table (nullable)
- `invoiced_at` - Timestamp when timesheet was invoiced

## Models

### Invoice Model (`Invoice.php`)
- Handles invoice business logic
- Provides status management methods
- Calculates totals automatically
- Includes helpful accessors and scopes
- Manages relationships with clients, items, and users

### InvoiceItem Model (`InvoiceItem.php`)
- Manages individual invoice line items
- Auto-calculates amounts based on hours and rates
- Updates parent invoice totals when changed
- Provides formatted display methods

## Controller

### InvoiceController (`InvoiceController.php`)
Provides comprehensive API endpoints:

#### Core Invoice Operations
- `generateInvoice()` - Create invoice from approved timesheets
- `previewInvoice()` - Preview invoice before creation
- `index()` - List invoices with filtering and pagination
- `show()` - Get single invoice details
- `updateStatus()` - Update invoice status

#### Additional Methods (see routes file)
- `markAsPaid()` - Mark invoice as paid
- `cancel()` - Cancel invoice and release timesheets
- `getStatistics()` - Get invoice statistics and metrics
- `getAvailableTimesheets()` - Get timesheets available for invoicing
- `getOverdueInvoices()` - Get overdue invoices

## API Routes

The system provides RESTful API endpoints:

```php
// Core invoice management
GET    /api/invoices                    - List invoices
GET    /api/invoices/{id}               - Get invoice details
POST   /api/invoices/preview            - Preview invoice
POST   /api/invoices/generate           - Generate invoice
PATCH  /api/invoices/{id}/status        - Update status

// Additional operations
PATCH  /api/invoices/{id}/mark-paid     - Mark as paid
PATCH  /api/invoices/{id}/cancel        - Cancel invoice
GET    /api/invoices/stats/overview     - Get statistics
GET    /api/invoices/status/overdue     - Get overdue invoices

// Timesheet integration
GET    /api/timesheets/available-for-invoice - Available timesheets
GET    /api/timesheets/invoiced              - Invoiced timesheets
```

## Key Features

### 1. Invoice Generation Workflow
```php
// 1. Preview invoice
POST /api/invoices/preview
{
    "client_id": 1,
    "timesheet_ids": [1, 2, 3]
}

// 2. Generate actual invoice
POST /api/invoices/generate
{
    "client_id": 1,
    "timesheet_ids": [1, 2, 3],
    "due_date": "2024-02-15",
    "notes": "Monthly staffing services"
}
```

### 2. Automatic Calculations
- Subtotal calculated from timesheet amounts
- Tax calculated based on configurable rate
- Total hours summed from all timesheets
- Invoice numbers auto-generated with format: `INV-YYYYMM0001`

### 3. Status Management
- **Pending**: Newly created invoice
- **Sent**: Invoice sent to client
- **Paid**: Payment received
- **Overdue**: Past due date and unpaid
- **Cancelled**: Invoice cancelled, timesheets released

### 4. Data Integrity
- Prevents invoicing already-invoiced timesheets
- Validates timesheet approval status
- Maintains referential integrity with foreign keys
- Automatic total recalculation when items change

### 5. Business Logic
- Only approved timesheets can be invoiced
- Timesheets are marked as invoiced to prevent duplicates
- Cancelled invoices release associated timesheets
- Overdue status automatically applied based on due date

## Installation Steps

1. **Run Migrations**
```bash
php artisan migrate
```

2. **Create Migration Files**
```bash
php artisan make:migration create_invoices_table
php artisan make:migration create_invoice_items_table
php artisan make:migration add_invoice_fields_to_timesheets_table
```

3. **Create Models**
```bash
php artisan make:model Invoice
php artisan make:model InvoiceItem
```

4. **Create Controller**
```bash
php artisan make:controller InvoiceController
```

5. **Add Routes**
Add the routes from `invoice-routes.php` to your `routes/api.php` file.

## Configuration

Add to your `config/invoice.php`:
```php
<?php

return [
    'default_tax_rate' => env('INVOICE_TAX_RATE', 0.10), // 10%
    'invoice_prefix' => env('INVOICE_PREFIX', 'INV'),
    'default_due_days' => env('INVOICE_DUE_DAYS', 30),
];
```

## Usage Examples

### Generate Invoice from Frontend
```typescript
// Angular service call
generateInvoice(clientId: number, timesheetIds: number[], notes?: string) {
  return this.http.post('/api/invoices/generate', {
    client_id: clientId,
    timesheet_ids: timesheetIds,
    notes: notes
  });
}
```

### Get Invoice Statistics
```typescript
getInvoiceStats() {
  return this.http.get('/api/invoices/stats/overview');
}
```

## Security Considerations

- All routes protected by authentication middleware
- User permissions should be checked for admin operations
- Input validation on all endpoints
- SQL injection protection through Eloquent ORM
- Foreign key constraints maintain data integrity

## Performance Optimizations

- Database indexes on frequently queried fields
- Eager loading of relationships to prevent N+1 queries
- Pagination for large result sets
- Caching for statistics and reports (recommended)

This implementation provides a robust, scalable invoice system that integrates seamlessly with the existing timesheet management system while maintaining data integrity and providing comprehensive business functionality.