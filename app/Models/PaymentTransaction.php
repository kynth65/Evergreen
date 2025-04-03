<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_payment_id',
        'amount',
        'payment_date',
        'payment_method',
        'payment_number',
        'reference_number',
        'payment_notes',
    ];

    protected $casts = [
        'payment_date' => 'date',
    ];

    /**
     * Get the client payment that owns this transaction.
     */
    public function clientPayment()
    {
        return $this->belongsTo(ClientPayment::class);
    }
}