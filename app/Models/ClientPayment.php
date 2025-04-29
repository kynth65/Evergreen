<?php
// app/Models/ClientPayment.php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
class ClientPayment extends Model
{
    use HasFactory;
    protected $fillable = [
        'client_name',
        'contact_number',
        'email',
        'address',
        'payment_type',
        'installment_years',
        'start_date',
        'next_payment_date',
        'completed_payments',
        'total_amount',
        'payment_status',
        'payment_notes',
        'user_id',  // Add this to fillable
    ];
    protected $casts = [
        'start_date' => 'date',
        'next_payment_date' => 'date',
    ];
    /**
     * Get the user that owns this payment.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    /**
     * Get the lots associated with this payment.
     */
    public function lots()
    {
        return $this->belongsToMany(Lot::class, 'client_lots')
            ->withPivot('custom_price')
            ->withTimestamps();
    }
    /**
     * Get the payment schedules for this payment.
     */
    public function paymentSchedules()
    {
        return $this->hasMany(PaymentSchedule::class);
    }
    /**
     * Get the payment transactions for this payment.
     */
    public function paymentTransactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }
    /**
     * Check if payment is late.
     */
    public function getIsLateAttribute()
    {
        if ($this->payment_status === 'COMPLETED' || $this->payment_type === 'spot_cash') {
            return false;
        }
        if (!$this->next_payment_date) {
            return false;
        }
        return Carbon::now()->gt($this->next_payment_date);
    }
    /**
     * Get days late.
     */
    public function getDaysLateAttribute()
    {
        if (!$this->is_late) {
            return 0;
        }
        return Carbon::now()->diffInDays($this->next_payment_date);
    }
    /**
     * Get payment status with late indicator.
     */
    public function getPaymentStatusWithLateIndicatorAttribute()
    {
        if ($this->payment_status === 'COMPLETED') {
            return 'COMPLETED';
        }
        if ($this->is_late) {
            return $this->days_late > 30 ? 'SUPER LATE' : 'LATE';
        }
        return 'CURRENT';
    }
}