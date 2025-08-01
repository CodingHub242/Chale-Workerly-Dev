<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Timesheet extends Model
{
    protected $fillable = [
            'temp_id',
            'total_hours',
            'total_pay',
            'submitted_date',
            'status',
            'approved_by',
            'approved_date',
            'rejection_reason',
            'period_start_date',
            'period_end_date',
            'entries'
        ];
    
    protected $casts = [
            'total_hours' => 'decimal:2',
            'total_pay' => 'decimal:2',
            'submitted_date' => 'datetime',
            'approved_date' => 'datetime',
            'period_start_date' => 'date',
            'period_end_date' => 'date',
            'entries' => 'array'
        ];
    
    /**
     * Get the temp that owns this timesheet
     */
    public function temp()
    {
        return $this->belongsTo(Temp::class);
    }
}