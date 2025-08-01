<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Temp extends Model
{
    protected $fillable = [
        'title',
        'first_name',
        'last_name',
        'phone',
        'email',
        'experience',
        'base_pay',
        'status'
    ];
    
    protected $casts = [
        'experience' => 'integer',
        'base_pay' => 'decimal:2'
    ];
    
    /**
     * Get timesheets for this temp
     */
    public function timesheets()
    {
        return $this->hasMany(Timesheet::class);
    }
}