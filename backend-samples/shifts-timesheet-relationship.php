<?php

/*
|--------------------------------------------------------------------------
| Shifts and Timesheet Relationship - Laravel Implementation
|--------------------------------------------------------------------------
|
| This file shows the proper Laravel relationship structure between
| Shifts and Timesheets for the Workerly system.
|
| Current System Analysis:
| - TimeSheet model stores shifts as JSON array in 'shifts' column
| - Shift model exists but no direct relationship to timesheets
| - Need to establish proper many-to-many relationship
|
*/

// =============================================================================
// OPTION 1: Proper Relational Database Structure (Recommended)
// =============================================================================

/**
 * Updated TimeSheet Model with proper relationships
 */
class TimeSheet extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'timesheets';

    protected $fillable = [
        'tempId',
        'totalHours',
        'totalPay',
        'submittedDate',
        'status',
        'approvedBy',
        'approvedDate',
        'rejectionReason',
        'period_start_date',
        'period_end_date',
        'entries',
        // Remove 'shifts' from fillable as it will be a relationship
    ];

    protected $casts = [
        'totalHours' => 'decimal:2',
        'totalPay' => 'decimal:2',
        'submittedDate' => 'datetime',
        'approvedDate' => 'datetime',
        'period_start_date' => 'date',
        'period_end_date' => 'date',
        'entries' => 'array',
        // Remove 'shifts' => 'array' cast
    ];

    /**
     * Get the temp that owns this timesheet
     */
    public function temp()
    {
        return $this->belongsTo(Temp::class, 'tempId');
    }

    /**
     * Get the shifts associated with this timesheet
     * Many-to-Many relationship through pivot table
     */
    public function shifts()
    {
        return $this->belongsToMany(Shift::class, 'timesheet_shifts', 'timesheet_id', 'shift_id')
                    ->withPivot(['hours_worked', 'hourly_rate', 'total_pay', 'notes'])
                    ->withTimestamps();
    }

    /**
     * Get all clients through shifts
     */
    public function clients()
    {
        return $this->hasManyThrough(Client::class, Shift::class, 'id', 'id', 'id', 'client_id')
                    ->join('timesheet_shifts', 'shifts.id', '=', 'timesheet_shifts.shift_id')
                    ->where('timesheet_shifts.timesheet_id', $this->id);
    }

    /**
     * Get all jobs through shifts
     */
    public function jobs()
    {
        return $this->hasManyThrough(Job::class, Shift::class, 'id', 'id', 'id', 'job_id')
                    ->join('timesheet_shifts', 'shifts.id', '=', 'timesheet_shifts.shift_id')
                    ->where('timesheet_shifts.timesheet_id', $this->id);
    }

    /**
     * Calculate total hours from shift relationships
     */
    public function calculateTotalHours()
    {
        return $this->shifts()->sum('timesheet_shifts.hours_worked');
    }

    /**
     * Calculate total pay from shift relationships
     */
    public function calculateTotalPay()
    {
        return $this->shifts()->sum('timesheet_shifts.total_pay');
    }

    /**
     * Get the period as an array (keeping existing functionality)
     */
    public function getPeriodAttribute()
    {
        return [
            'startDate' => $this->period_start_date,
            'endDate' => $this->period_end_date
        ];
    }

    /**
     * Set the period from an array (keeping existing functionality)
     */
    public function setPeriodAttribute($value)
    {
        if (isset($value['startDate'])) {
            $this->period_start_date = $value['startDate'];
        }
        if (isset($value['endDate'])) {
            $this->period_end_date = $value['endDate'];
        }
    }
}

/**
 * Updated Shift Model with timesheet relationship
 */
class Shift extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'job_id',
        'client_id',
        'temp_ids',
        'status',
        'startTime',
        'endTime',
        'notes',
        'hourly_rate',
        'location',
        'requirements'
    ];

    protected $casts = [
        'temp_ids' => 'array',
        'startTime' => 'datetime',
        'endTime' => 'datetime',
        'hourly_rate' => 'decimal:2'
    ];

    /**
     * Get the job this shift belongs to
     */
    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    /**
     * Get the client this shift belongs to
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the temps assigned to this shift
     */
    public function temps()
    {
        return $this->belongsToMany(Temp::class, 'shift_temps', 'shift_id', 'temp_id')
                    ->withTimestamps();
    }

    /**
     * Get the timesheets that include this shift
     * Many-to-Many relationship through pivot table
     */
    public function timesheets()
    {
        return $this->belongsToMany(TimeSheet::class, 'timesheet_shifts', 'shift_id', 'timesheet_id')
                    ->withPivot(['hours_worked', 'hourly_rate', 'total_pay', 'notes'])
                    ->withTimestamps();
    }

    /**
     * Check if shift is included in any timesheet
     */
    public function isInTimesheet()
    {
        return $this->timesheets()->exists();
    }

    /**
     * Get the duration of the shift in hours
     */
    public function getDurationAttribute()
    {
        if ($this->startTime && $this->endTime) {
            return $this->endTime->diffInHours($this->startTime);
        }
        return 0;
    }
}

// =============================================================================
// MIGRATION: Create Pivot Table for Many-to-Many Relationship
// =============================================================================

/**
 * Migration to create timesheet_shifts pivot table
 * Run: php artisan make:migration create_timesheet_shifts_table
 */
class CreateTimesheetShiftsTable extends Migration
{
    public function up()
    {
        Schema::create('timesheet_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('timesheet_id')->constrained('timesheets')->onDelete('cascade');
            $table->foreignId('shift_id')->constrained('shifts')->onDelete('cascade');
            $table->decimal('hours_worked', 8, 2)->default(0);
            $table->decimal('hourly_rate', 8, 2)->default(0);
            $table->decimal('total_pay', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            // Ensure unique combination of timesheet and shift
            $table->unique(['timesheet_id', 'shift_id']);
            
            // Indexes for better performance
            $table->index('timesheet_id');
            $table->index('shift_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('timesheet_shifts');
    }
}

// =============================================================================
// OPTION 2: Working with Current JSON Structure (Backward Compatibility)
// =============================================================================

/**
 * Helper methods to work with existing JSON shifts structure
 * Add these methods to the existing TimeSheet model
 */
class TimeSheetJsonHelper extends Model
{
    /**
     * Get shifts from JSON and convert to Shift models
     */
    public function getShiftModelsAttribute()
    {
        if (!$this->shifts || !is_array($this->shifts)) {
            return collect();
        }

        return collect($this->shifts)->map(function ($shiftData) {
            if (isset($shiftData['id'])) {
                // If shift has ID, load from database
                return Shift::find($shiftData['id']);
            }
            
            // Create temporary Shift model from JSON data
            $shift = new Shift();
            $shift->fill($shiftData);
            return $shift;
        })->filter(); // Remove null values
    }

    /**
     * Add shift to timesheet (JSON approach)
     */
    public function addShift(Shift $shift, $hoursWorked = null, $hourlyRate = null)
    {
        $shifts = $this->shifts ?? [];
        
        $shiftData = [
            'id' => $shift->id,
            'job_id' => $shift->job_id,
            'client_id' => $shift->client_id,
            'startTime' => $shift->startTime,
            'endTime' => $shift->endTime,
            'hours_worked' => $hoursWorked ?? $shift->duration,
            'hourly_rate' => $hourlyRate ?? $shift->hourly_rate,
            'total_pay' => ($hoursWorked ?? $shift->duration) * ($hourlyRate ?? $shift->hourly_rate)
        ];
        
        $shifts[] = $shiftData;
        $this->shifts = $shifts;
        $this->save();
    }

    /**
     * Remove shift from timesheet (JSON approach)
     */
    public function removeShift($shiftId)
    {
        $shifts = $this->shifts ?? [];
        $shifts = array_filter($shifts, function ($shift) use ($shiftId) {
            return $shift['id'] != $shiftId;
        });
        
        $this->shifts = array_values($shifts); // Re-index array
        $this->save();
    }

    /**
     * Get clients from JSON shifts
     */
    public function getClientsFromShifts()
    {
        $clientIds = collect($this->shifts ?? [])
            ->pluck('client_id')
            ->unique()
            ->filter();
            
        return Client::whereIn('id', $clientIds)->get();
    }

    /**
     * Get jobs from JSON shifts
     */
    public function getJobsFromShifts()
    {
        $jobIds = collect($this->shifts ?? [])
            ->pluck('job_id')
            ->unique()
            ->filter();
            
        return Job::whereIn('id', $jobIds)->get();
    }
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/**
 * Example usage of the relationships
 */
class TimesheetShiftExamples
{
    /**
     * Create timesheet with shifts (Relational approach)
     */
    public function createTimesheetWithShifts()
    {
        $timesheet = TimeSheet::create([
            'tempId' => 1,
            'period_start_date' => '2024-01-01',
            'period_end_date' => '2024-01-07',
            'status' => 'draft'
        ]);

        // Attach shifts with pivot data
        $timesheet->shifts()->attach([
            1 => ['hours_worked' => 8, 'hourly_rate' => 15.00, 'total_pay' => 120.00],
            2 => ['hours_worked' => 6, 'hourly_rate' => 15.00, 'total_pay' => 90.00]
        ]);

        // Update totals
        $timesheet->totalHours = $timesheet->calculateTotalHours();
        $timesheet->totalPay = $timesheet->calculateTotalPay();
        $timesheet->save();
    }

    /**
     * Get timesheet with all related data
     */
    public function getTimesheetWithRelations($id)
    {
        return TimeSheet::with([
            'temp',
            'shifts.job',
            'shifts.client',
            'shifts.temps'
        ])->find($id);
    }

    /**
     * Get shifts for invoice generation
     */
    public function getShiftsForInvoice($timesheetId)
    {
        $timesheet = TimeSheet::with('shifts.client', 'shifts.job')->find($timesheetId);
        
        return $timesheet->shifts->map(function ($shift) {
            return [
                'shift_id' => $shift->id,
                'client_name' => $shift->client->name,
                'job_title' => $shift->job->title,
                'hours_worked' => $shift->pivot->hours_worked,
                'hourly_rate' => $shift->pivot->hourly_rate,
                'total_pay' => $shift->pivot->total_pay,
                'date' => $shift->startTime->format('Y-m-d')
            ];
        });
    }

    /**
     * Working with existing JSON structure
     */
    public function workWithJsonShifts($timesheetId)
    {
        $timesheet = TimeSheet::find($timesheetId);
        
        // Get shift models from JSON
        $shiftModels = $timesheet->shift_models;
        
        // Get clients from shifts
        $clients = $timesheet->getClientsFromShifts();
        
        // Add new shift
        $shift = Shift::find(1);
        $timesheet->addShift($shift, 8, 15.00);
    }
}

// =============================================================================
// MIGRATION PLAN
// =============================================================================

/**
 * Step-by-step migration from JSON to relational structure
 */
class MigrationPlan
{
    /**
     * Step 1: Create pivot table
     */
    public function step1_createPivotTable()
    {
        // Run the CreateTimesheetShiftsTable migration above
    }

    /**
     * Step 2: Migrate existing JSON data to relational structure
     */
    public function step2_migrateJsonToRelational()
    {
        TimeSheet::whereNotNull('shifts')->chunk(100, function ($timesheets) {
            foreach ($timesheets as $timesheet) {
                if (is_array($timesheet->shifts)) {
                    foreach ($timesheet->shifts as $shiftData) {
                        if (isset($shiftData['id'])) {
                            $timesheet->shifts()->attach($shiftData['id'], [
                                'hours_worked' => $shiftData['hours_worked'] ?? 0,
                                'hourly_rate' => $shiftData['hourly_rate'] ?? 0,
                                'total_pay' => $shiftData['total_pay'] ?? 0,
                                'notes' => $shiftData['notes'] ?? null
                            ]);
                        }
                    }
                }
            }
        });
    }

    /**
     * Step 3: Remove JSON column (after verification)
     */
    public function step3_removeJsonColumn()
    {
        Schema::table('timesheets', function (Blueprint $table) {
            $table->dropColumn('shifts');
        });
    }
}