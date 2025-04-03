<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PaymentSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_payment_id',
        'payment_number',
        'due_date',
        'amount',
        'status',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    /**
     * Get the client payment that owns this schedule.
     */
    public function clientPayment()
    {
        return $this->belongsTo(ClientPayment::class);
    }

    /**
     * Check if payment is late.
     */
    public function getIsLateAttribute()
    {
        if ($this->status !== 'PENDING') {
            return false;
        }

        return Carbon::now()->gt($this->due_date);
    }

    /**
     * Get days late.
     */
    public function getDaysLateAttribute()
    {
        if (!$this->is_late) {
            return 0;
        }

        return Carbon::now()->diffInDays($this->due_date);
    }
}