<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'client_id',
        'issue_date',
        'due_date',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'total_amount',
        'total_hours',
        'status',
        'notes',
        'paid_at',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'paid_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'tax_rate' => 'decimal:4',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'total_hours' => 'decimal:2'
    ];

    protected $appends = [
        'is_overdue',
        'days_until_due',
        'formatted_total',
        'status_color'
    ];

    /**
     * Invoice statuses
     */
    const STATUS_PENDING = 'pending';
    const STATUS_SENT = 'sent';
    const STATUS_PAID = 'paid';
    const STATUS_OVERDUE = 'overdue';
    const STATUS_CANCELLED = 'cancelled';

    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING => 'Pending',
            self::STATUS_SENT => 'Sent',
            self::STATUS_PAID => 'Paid',
            self::STATUS_OVERDUE => 'Overdue',
            self::STATUS_CANCELLED => 'Cancelled'
        ];
    }

    /**
     * Relationships
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function timesheets(): HasMany
    {
        return $this->hasMany(Timesheet::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Accessors
     */
    public function getIsOverdueAttribute(): bool
    {
        return $this->status !== self::STATUS_PAID && 
               $this->status !== self::STATUS_CANCELLED && 
               $this->due_date < Carbon::now();
    }

    public function getDaysUntilDueAttribute(): int
    {
        if ($this->status === self::STATUS_PAID || $this->status === self::STATUS_CANCELLED) {
            return 0;
        }

        return Carbon::now()->diffInDays($this->due_date, false);
    }

    public function getFormattedTotalAttribute(): string
    {
        return '$' . number_format($this->total_amount, 2);
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'warning',
            self::STATUS_SENT => 'primary',
            self::STATUS_PAID => 'success',
            self::STATUS_OVERDUE => 'danger',
            self::STATUS_CANCELLED => 'medium',
            default => 'medium'
        };
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeSent($query)
    {
        return $query->where('status', self::STATUS_SENT);
    }

    public function scopePaid($query)
    {
        return $query->where('status', self::STATUS_PAID);
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', '!=', self::STATUS_PAID)
                    ->where('status', '!=', self::STATUS_CANCELLED)
                    ->where('due_date', '<', Carbon::now());
    }

    public function scopeForClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('issue_date', [$startDate, $endDate]);
    }

    /**
     * Methods
     */
    public function markAsPaid(): bool
    {
        return $this->update([
            'status' => self::STATUS_PAID,
            'paid_at' => Carbon::now()
        ]);
    }

    public function markAsOverdue(): bool
    {
        if ($this->is_overdue && $this->status !== self::STATUS_PAID) {
            return $this->update(['status' => self::STATUS_OVERDUE]);
        }

        return false;
    }

    public function calculateTotals(): void
    {
        $this->subtotal = $this->items->sum('amount');
        $this->tax_amount = $this->subtotal * $this->tax_rate;
        $this->total_amount = $this->subtotal + $this->tax_amount;
        $this->total_hours = $this->items->sum('hours');
        $this->save();
    }

    public function canBeEdited(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_SENT]);
    }

    public function canBeCancelled(): bool
    {
        return $this->status !== self::STATUS_PAID && $this->status !== self::STATUS_CANCELLED;
    }

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-update overdue status
        static::retrieved(function ($invoice) {
            if ($invoice->is_overdue && $invoice->status === self::STATUS_SENT) {
                $invoice->update(['status' => self::STATUS_OVERDUE]);
            }
        });
    }
}