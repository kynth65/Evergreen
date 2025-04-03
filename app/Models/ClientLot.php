<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientLot extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_payment_id',
        'lot_id',
        'custom_price',
    ];

    /**
     * Get the client payment that owns this relationship.
     */
    public function clientPayment()
    {
        return $this->belongsTo(ClientPayment::class);
    }

    /**
     * Get the lot associated with this relationship.
     */
    public function lot()
    {
        return $this->belongsTo(Lot::class);
    }
}