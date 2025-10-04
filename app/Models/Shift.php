<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Job;
use App\Models\Temp;
use App\Models\Client;
use App\Models\TimeSheet;

class Shift extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'job_id',
        'client_id',
        'temp_ids',
        'status',
        'tempStatus',
        'startTime',
        'endTime',
        'notes',
    ];

     protected $casts = [
        'temp_ids' => 'array',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    // public function temps()
    // {
    //     return $this->belongsToMany(Temp::class);
    // }
    public function temps()
    {
        return $this->belongsToMany(Temp::class, 'shift_temps', 'shift_id', 'temp_id')
                    ->withPivot('tempStatus')
                    ->withTimestamps();
    }

    public function timesheets()
    {
        return $this->belongsToMany(TimeSheet::class, 'timesheet_shifts', 'shift_id', 'timesheet_id')
                    ->withPivot(['hours_worked', 'hourly_rate', 'total_pay', 'notes'])
                    ->withTimestamps();
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }


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
