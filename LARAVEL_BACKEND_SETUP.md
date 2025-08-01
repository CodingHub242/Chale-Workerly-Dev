# Laravel Backend Setup for Timesheet Features

This document explains how to set up and use the Laravel backend components for the timesheet features implemented in the frontend.

## Table of Contents
1. [Database Migrations](#database-migrations)
2. [Models](#models)
3. [Controllers](#controllers)
4. [Routes](#routes)
5. [Notifications](#notifications)
6. [Seeders](#seeders)
7. [API Endpoints](#api-endpoints)

## Database Migrations

Two migration files have been created:

1. `database/migrations/2023_07_31_000000_create_timesheets_table.php` - Creates the timesheets table
2. `database/migrations/2023_07_31_000001_create_temps_table.php` - Creates the temps table

To run the migrations:
```bash
php artisan migrate
```

## Models

Two Eloquent models have been created:

1. `app/Models/Temp.php` - Represents a temporary worker
2. `app/Models/Timesheet.php` - Represents a timesheet entry

## Controllers

Two controllers handle the API requests:

1. `app/Http/Controllers/api/v1/TimesheetController.php` - Handles timesheet operations
2. `app/Http/Controllers/api/v1/ReportController.php` - Handles reporting operations

## Routes

The API routes are defined in `routes/api.php` with the following endpoints:

- `/api/v1/timesheets` - Get all timesheets
- `/api/v1/timesheets` (POST) - Create a new timesheet
- `/api/v1/timesheets/{id}` - Get a specific timesheet
- `/api/v1/timesheets/{id}` (PUT) - Update a timesheet
- `/api/v1/timesheets/{id}/submit` - Submit a timesheet for approval
- `/api/v1/timesheets/{id}/approve` - Approve a timesheet
- `/api/v1/timesheets/{id}/reject` - Reject a timesheet
- `/api/v1/reports/timesheets` - Get timesheet report data
- `/api/v1/reports/status-distribution` - Get status distribution data
- `/api/v1/reports/export` - Export timesheet data as CSV

## Notifications

A notification system has been implemented:

- `app/Notifications/TimesheetStatusNotification.php` - Handles timesheet status notifications

## Seeders

A seeder has been created for testing:

- `database/seeders/TimesheetSeeder.php` - Seeds sample data

To run the seeder:
```bash
php artisan db:seed --class=TimesheetSeeder
```

## API Endpoints

### Timesheet Endpoints

#### Get All Timesheets
```
GET /api/v1/timesheets
```
Optional query parameters:
- `temp_id` - Filter by temp ID
- `status` - Filter by status

#### Create Timesheet
```
POST /api/v1/timesheets
```
Request body:
```json
{
  "temp_id": 1,
  "total_hours": 40.00,
  "total_pay": 1000.00,
  "period_start_date": "2023-07-01",
  "period_end_date": "2023-07-15",
  "entries": [
    {
      "date": "2023-07-01",
      "start_time": "09:00",
      "end_time": "17:00",
      "break_duration": 60,
      "notes": "Regular work day"
    }
  ]
}
```

#### Get Specific Timesheet