<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_name',
        'contact_number',
        'email',
        'address',
        'lot_id',
        'installment_years',
        'total_payments',
        'completed_payments',
        'payment_status',
        'start_date',
        'next_payment_date',
        'payment_notes',
        'payment_type', // Add this new field
    ];

    protected $casts = [
        'start_date' => 'date',
        'next_payment_date' => 'date',
    ];

    /**
     * Get the lot that the client payment belongs to.
     */
    public function lot()
    {
        return $this->belongsTo(Lot::class);
    }

    /**
     * Get payment history for this client payment.
     */
    public function paymentHistory()
    {
        return $this->hasMany(PaymentHistory::class);
    }

    /**
     * Update payment status based on completed payments and payment type.
     */
    public function updatePaymentStatus()
    {
        // For spot cash, handle status differently
        if ($this->payment_type === 'spot_cash') {
            $this->payment_status = $this->completed_payments > 0 
                ? 'COMPLETED' 
                : 'NOT_STARTED';
            return $this;
        }

        // Existing installment logic
        if ($this->completed_payments >= $this->total_payments) {
            $this->payment_status = 'COMPLETED';
        } elseif ($this->completed_payments > 0) {
            $this->payment_status = 'IN_PROGRESS';
        } elseif ($this->next_payment_date && $this->next_payment_date < now()) {
            $this->payment_status = 'OVERDUE';
        } else {
            $this->payment_status = 'NOT_STARTED';
        }
        
        return $this;
    }
}