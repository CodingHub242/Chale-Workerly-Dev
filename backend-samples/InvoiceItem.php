<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'timesheet_id',
        'description',
        'hours',
        'rate',
        'amount',
        'temp_name',
        'period_start',
        'period_end'
    ];

    protected $casts = [
        'hours' => 'decimal:2',
        'rate' => 'decimal:2',
        'amount' => 'decimal:2',
        'period_start' => 'date',
        'period_end' => 'date'
    ];

    protected $appends = [
        'formatted_amount',
        'formatted_rate',
        'period_display'
    ];

    /**
     * Relationships
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function timesheet(): BelongsTo
    {
        return $this->belongsTo(Timesheet::class);
    }

    /**
     * Accessors
     */
    public function getFormattedAmountAttribute(): string
    {
        return '$' . number_format($this->amount, 2);
    }

    public function getFormattedRateAttribute(): string
    {
        return '$' . number_format($this->rate, 2) . '/hr';
    }

    public function getPeriodDisplayAttribute(): string
    {
        return $this->period_start->format('M j') . ' - ' . $this->period_end->format('M j, Y');
    }

    /**
     * Methods
     */
    public function calculateAmount(): void
    {
        $this->amount = $this->hours * $this->rate;
        $this->save();
    }

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-calculate amount when creating
        static::creating(function ($item) {
            if (!$item->amount && $item->hours && $item->rate) {
                $item->amount = $item->hours * $item->rate;
            }
        });

        // Recalculate invoice totals when item changes
        static::saved(function ($item) {
            $item->invoice->calculateTotals();
        });

        static::deleted(function ($item) {
            $item->invoice->calculateTotals();
        });
    }
}