<?php

namespace App\Http\Controllers;

use App\Models\ClientPayment;
use App\Models\ClientLot;
use App\Models\Lot;
use App\Models\PaymentSchedule;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ClientPaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $clientPayments = ClientPayment::with(['lots', 'paymentSchedules'])->get();
        return response()->json($clientPayments);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'payment_type' => 'required|in:spot_cash,installment',
            'installment_years' => 'required|integer|min:1|max:4',
            'start_date' => 'required|date',
            'next_payment_date' => 'nullable|date',
            'completed_payments' => 'required|integer|min:0',
            'payment_notes' => 'nullable|string',
            'lots' => 'required|array|min:1',
            'lots.*.lot_id' => 'required|exists:lots,id',
            'lots.*.custom_price' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            // Create client payment
            $clientPayment = new ClientPayment();
            $clientPayment->client_name = $request->client_name;
            $clientPayment->contact_number = $request->contact_number;
            $clientPayment->email = $request->email;
            $clientPayment->address = $request->address;
            $clientPayment->payment_type = $request->payment_type;
            $clientPayment->installment_years = $request->installment_years;
            $clientPayment->start_date = $request->start_date;
            $clientPayment->next_payment_date = $request->next_payment_date;
            $clientPayment->completed_payments = $request->completed_payments;
            $clientPayment->payment_notes = $request->payment_notes;
            $clientPayment->payment_status = $request->payment_type === 'spot_cash' ? 'COMPLETED' : 'ONGOING';

            // Calculate total amount
            $totalAmount = 0;
            foreach ($request->lots as $lotData) {
                $lot = Lot::find($lotData['lot_id']);
                $price = isset($lotData['custom_price']) ? $lotData['custom_price'] : $lot->total_contract_price;
                $totalAmount += $price;
            }
            $clientPayment->total_amount = $totalAmount;
            $clientPayment->save();

            // Attach lots with custom prices
            foreach ($request->lots as $lotData) {
                $lot = Lot::find($lotData['lot_id']);
                
                // Check if custom price is set
                $price = isset($lotData['custom_price']) ? $lotData['custom_price'] : $lot->total_contract_price;
                
                // Create client lot relationship
                ClientLot::create([
                    'client_payment_id' => $clientPayment->id,
                    'lot_id' => $lotData['lot_id'],
                    'custom_price' => $price,
                ]);
                
                // Update lot status to SOLD if it's AVAILABLE
                if ($lot->status === 'AVAILABLE') {
                    $lot->status = 'SOLD';
                    // Also update the client field in the lot
                    $lot->client = $request->client_name;
                    $lot->save();
                }
            }

            // Create payment schedules
            if ($request->payment_type === 'spot_cash') {
                // For spot cash, create single payment schedule
                PaymentSchedule::create([
                    'client_payment_id' => $clientPayment->id,
                    'payment_number' => 1,
                    'due_date' => $request->start_date,
                    'amount' => $totalAmount,
                    'status' => 'PAID',
                ]);
                
                // Create payment transaction
                PaymentTransaction::create([
                    'client_payment_id' => $clientPayment->id,
                    'amount' => $totalAmount,
                    'payment_date' => $request->start_date,
                    'payment_number' => 1,
                    'payment_notes' => 'Full payment (spot cash)',
                ]);
            } else {
                // For installment, create monthly schedules
                $totalMonths = $request->installment_years * 12;
                $monthlyPayment = (int)($totalAmount / $totalMonths); // Convert to integer
                $dueDate = Carbon::parse($request->start_date);
                
                for ($i = 0; $i < $totalMonths; $i++) {
                    $status = ($i < $request->completed_payments) ? 'PAID' : 'PENDING';
                    
                    // For the last payment, adjust for any rounding issues
                    $amount = ($i === $totalMonths - 1) 
                        ? $totalAmount - ($monthlyPayment * ($totalMonths - 1)) 
                        : $monthlyPayment;
                    
                    PaymentSchedule::create([
                        'client_payment_id' => $clientPayment->id,
                        'payment_number' => $i + 1,
                        'due_date' => $dueDate->format('Y-m-d'),
                        'amount' => $amount,
                        'status' => $status,
                    ]);
                    
                    // Create payment transaction for paid schedules
                    if ($status === 'PAID') {
                        PaymentTransaction::create([
                            'client_payment_id' => $clientPayment->id,
                            'amount' => $amount,
                            'payment_date' => $dueDate->format('Y-m-d'),
                            'payment_number' => $i + 1,
                            'payment_notes' => 'Monthly installment payment #' . ($i + 1),
                        ]);
                    }
                    
                    $dueDate->addMonth();
                }
            }

            DB::commit();
            
            // Return the created payment with related data
            $clientPayment->load(['lots', 'paymentSchedules', 'paymentTransactions']);
            return response()->json($clientPayment, 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create client payment', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $clientPayment = ClientPayment::with(['lots', 'paymentSchedules', 'paymentTransactions'])->findOrFail($id);
        return response()->json($clientPayment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $clientPayment = ClientPayment::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'client_name' => 'sometimes|required|string|max:255',
            'contact_number' => 'sometimes|required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'next_payment_date' => 'nullable|date',
            'completed_payments' => 'sometimes|required|integer|min:0',
            'payment_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            // Update basic information
            $clientPayment->fill($request->only([
                'client_name',
                'contact_number',
                'email',
                'address',
                'next_payment_date',
                'completed_payments',
                'payment_notes',
            ]));
            
            // Check if payment is completed
            if ($clientPayment->payment_type === 'installment') {
                $totalPayments = $clientPayment->installment_years * 12;
                if ($request->completed_payments >= $totalPayments) {
                    $clientPayment->payment_status = 'COMPLETED';
                    $clientPayment->completed_payments = $totalPayments;
                }
            }
            
            $clientPayment->save();
            
            // Update payment schedules if completed_payments changed
            if ($request->has('completed_payments') && $clientPayment->payment_type === 'installment') {
                $schedules = PaymentSchedule::where('client_payment_id', $clientPayment->id)
                    ->orderBy('payment_number')
                    ->get();
                
                foreach ($schedules as $schedule) {
                    if ($schedule->payment_number <= $request->completed_payments) {
                        if ($schedule->status !== 'PAID') {
                            $schedule->status = 'PAID';
                            $schedule->save();
                            
                            // Create transaction record if it doesn't exist
                            $transactionExists = PaymentTransaction::where('client_payment_id', $clientPayment->id)
                                ->where('payment_number', $schedule->payment_number)
                                ->exists();
                                
                            if (!$transactionExists) {
                                PaymentTransaction::create([
                                    'client_payment_id' => $clientPayment->id,
                                    'amount' => $schedule->amount,
                                    'payment_date' => now()->format('Y-m-d'),
                                    'payment_number' => $schedule->payment_number,
                                    'payment_notes' => 'Payment recorded',
                                ]);
                            }
                        }
                    }
                }
            }
            
            DB::commit();
            
            // Return the updated payment with related data
            $clientPayment->load(['lots', 'paymentSchedules', 'paymentTransactions']);
            return response()->json($clientPayment);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to update client payment', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $clientPayment = ClientPayment::findOrFail($id);
        
        DB::beginTransaction();
        try {
            // Get all client lots to update their status
            $clientLots = ClientLot::where('client_payment_id', $id)->get();
            
            foreach ($clientLots as $clientLot) {
                // Update lot status back to AVAILABLE if it was SOLD by this payment
                $lot = Lot::find($clientLot->lot_id);
                if ($lot && $lot->status === 'SOLD') {
                    $lot->status = 'AVAILABLE';
                    $lot->client = null; // Clear the client field
                    $lot->save();
                }
            }
            
            // Delete the client payment (will cascade delete related records due to foreign key constraints)
            $clientPayment->delete();
            
            DB::commit();
            return response()->json(null, 204);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to delete client payment', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Record a payment for an installment plan
     */
    public function recordPayment(Request $request, string $id)
    {
        $clientPayment = ClientPayment::findOrFail($id);
        
        // Check if payment is eligible for new payments
        if ($clientPayment->payment_type === 'spot_cash' || $clientPayment->payment_status === 'COMPLETED') {
            return response()->json(['error' => 'This payment plan is already completed'], 400);
        }
        
        $validator = Validator::make($request->all(), [
            'amount' => 'required|integer|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:CASH,CHECK,BANK_TRANSFER,ONLINE',
            'reference_number' => 'nullable|string',
            'payment_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            // Calculate next payment number
            $nextPaymentNumber = $clientPayment->completed_payments + 1;
            $totalPayments = $clientPayment->installment_years * 12;
            
            // Find the payment schedule
            $schedule = PaymentSchedule::where('client_payment_id', $clientPayment->id)
                ->where('payment_number', $nextPaymentNumber)
                ->first();
                
            if (!$schedule) {
                return response()->json(['error' => 'Invalid payment number'], 400);
            }
            
            // Update the schedule
            $schedule->status = 'PAID';
            $schedule->save();
            
            // Create payment transaction
            PaymentTransaction::create([
                'client_payment_id' => $clientPayment->id,
                'amount' => $request->amount,
                'payment_date' => $request->payment_date,
                'payment_method' => $request->payment_method,
                'payment_number' => $nextPaymentNumber,
                'reference_number' => $request->reference_number,
                'payment_notes' => $request->payment_notes,
            ]);
            
            // Update client payment
            $clientPayment->completed_payments = $nextPaymentNumber;
            
            // Check if this is the last payment
            if ($nextPaymentNumber >= $totalPayments) {
                $clientPayment->payment_status = 'COMPLETED';
                $clientPayment->next_payment_date = null;
            } else {
                // Set next payment date
                $nextSchedule = PaymentSchedule::where('client_payment_id', $clientPayment->id)
                    ->where('payment_number', $nextPaymentNumber + 1)
                    ->first();
                    
                if ($nextSchedule) {
                    $clientPayment->next_payment_date = $nextSchedule->due_date;
                }
            }
            
            $clientPayment->save();
            
            DB::commit();
            
            // Return the updated payment with related data
            $clientPayment->load(['lots', 'paymentSchedules', 'paymentTransactions']);
            return response()->json($clientPayment);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to record payment', 'message' => $e->getMessage()], 500);
        }
    }
    
    public function getTransactions(string $id)
    {
        // Find payment to ensure it exists
        $clientPayment = ClientPayment::findOrFail($id);
        
        // Get the transactions directly from the database
        $transactions = PaymentTransaction::where('client_payment_id', $id)
            ->orderBy('payment_number')
            ->get();
        
        return response()->json($transactions);
    }

    
}