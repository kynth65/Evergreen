<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_payment_id',
        'amount',
        'payment_date',
        'payment_method',
        'payment_for',
        'receipt_number',
        'remarks',
    ];

    protected $casts = [
        'payment_date' => 'date',
    ];

    /**
     * Get the client payment that this history belongs to.
     */
    public function clientPayment()
    {
        return $this->belongsTo(ClientPayment::class);
    }
}