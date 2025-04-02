<?php

namespace App\Http\Controllers;

use App\Models\ClientPayment;
use App\Models\Lot;
use App\Models\PaymentHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ClientPaymentController extends Controller
{
    /**
     * Display a listing of client payments.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $clientPayments = ClientPayment::with('lot:id,property_name,block_lot_no')->get();
        
        // Format response data to match frontend expectations
        $formattedPayments = $clientPayments->map(function ($payment) {
            return [
                'id' => $payment->id,
                'client_name' => $payment->client_name,
                'contact_number' => $payment->contact_number,
                'email' => $payment->email,
                'address' => $payment->address,
                'lot_id' => $payment->lot_id,
                'lot_details' => [
                    'property_name' => $payment->lot->property_name,
                    'block_lot_no' => $payment->lot->block_lot_no,
                ],
                'installment_years' => $payment->installment_years,
                'total_payments' => $payment->total_payments,
                'completed_payments' => $payment->completed_payments,
                'payment_status' => $payment->payment_status,
                'start_date' => $payment->start_date->format('Y-m-d'),
                'next_payment_date' => $payment->next_payment_date ? $payment->next_payment_date->format('Y-m-d') : null,
                'payment_notes' => $payment->payment_notes,
                'total_contract_price' => $payment->lot->total_contract_price ?? 0,
            ];
        });
        
        return response()->json($formattedPayments);
    }

    /**
     * Store a newly created client payment.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'lot_id' => 'required|exists:lots,id',
            'installment_years' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'next_payment_date' => 'nullable|date',
            'completed_payments' => 'required|integer|min:0',
            'payment_notes' => 'nullable|string',
            'payment_type' => 'required|in:installment,spot_cash',

        ]);
        
        // Calculate total payments based on installment years
        $validated['total_payments'] = $validated['payment_type'] === 'spot_cash' 
        ? 1 
        : ($validated['installment_years'] * 12);
    
        
        // Ensure completed payments don't exceed total payments
        if ($validated['payment_type'] === 'spot_cash') {
            $validated['completed_payments'] = 0;
            $validated['installment_years'] = 1;
        }
        
        // Set payment status based on completed payments
        $clientPayment = new ClientPayment($validated);
        $clientPayment->updatePaymentStatus();
        $clientPayment->save();
        
        return response()->json([
            'message' => 'Client payment record created successfully',
            'client_payment' => $clientPayment
        ], 201);
    }

    /**
     * Display the specified client payment.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $clientPayment = ClientPayment::with(['lot:id,property_name,block_lot_no,total_contract_price', 'paymentHistory'])
            ->findOrFail($id);
        
        $formattedPayment = [
            'id' => $clientPayment->id,
            'client_name' => $clientPayment->client_name,
            'contact_number' => $clientPayment->contact_number,
            'email' => $clientPayment->email,
            'address' => $clientPayment->address,
            'lot_id' => $clientPayment->lot_id,
            'lot_details' => [
                'property_name' => $clientPayment->lot->property_name,
                'block_lot_no' => $clientPayment->lot->block_lot_no,
            ],
            'installment_years' => $clientPayment->installment_years,
            'total_payments' => $clientPayment->total_payments,
            'completed_payments' => $clientPayment->completed_payments,
            'payment_status' => $clientPayment->payment_status,
            'start_date' => $clientPayment->start_date->format('Y-m-d'),
            'next_payment_date' => $clientPayment->next_payment_date ? $clientPayment->next_payment_date->format('Y-m-d') : null,
            'payment_notes' => $clientPayment->payment_notes,
            'total_contract_price' => $clientPayment->lot->total_contract_price ?? 0,
            'payment_history' => $clientPayment->paymentHistory
        ];
        
        return response()->json($formattedPayment);
    }

    /**
     * Update the specified client payment.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $clientPayment = ClientPayment::findOrFail($id);
        
        $validated = $request->validate([
            'client_name' => 'sometimes|required|string|max:255',
            'contact_number' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'lot_id' => 'sometimes|required|exists:lots,id',
            'installment_years' => 'sometimes|required|integer|min:1',
            'start_date' => 'sometimes|required|date',
            'next_payment_date' => 'nullable|date',
            'completed_payments' => 'sometimes|required|integer|min:0',
            'payment_notes' => 'nullable|string',
        ]);
        
        // If installment years changed, update total payments
        if (isset($validated['installment_years']) && $validated['installment_years'] != $clientPayment->installment_years) {
            $validated['total_payments'] = $validated['installment_years'] * 12;
        }
        
        // Ensure completed payments don't exceed total payments
        if (isset($validated['completed_payments'])) {
            $totalPayments = $validated['total_payments'] ?? $clientPayment->total_payments;
            if ($validated['completed_payments'] > $totalPayments) {
                $validated['completed_payments'] = $totalPayments;
            }
        }
        
        $clientPayment->fill($validated);
        $clientPayment->updatePaymentStatus();
        $clientPayment->save();
        
        return response()->json([
            'message' => 'Client payment record updated successfully',
            'client_payment' => $clientPayment
        ]);
    }

    /**
     * Remove the specified client payment.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $clientPayment = ClientPayment::findOrFail($id);
        $clientPayment->delete();
        
        return response()->json([
            'message' => 'Client payment record deleted successfully'
        ]);
    }

    /**
     * Process a payment for the client.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function processPayment(Request $request, $id)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|in:cash,check,bank',
            'payment_for' => 'required|string',
            'remarks' => 'nullable|string',
        ]);
        
        $clientPayment = ClientPayment::findOrFail($id);
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Generate receipt number
            $receiptNumber = 'AR-' . now()->format('Ymd') . '-' . str_pad($clientPayment->id, 4, '0', STR_PAD_LEFT);
            
            // Create payment history record
            $paymentHistory = new PaymentHistory([
                'client_payment_id' => $clientPayment->id,
                'amount' => $validated['amount'],
                'payment_date' => $validated['payment_date'],
                'payment_method' => $validated['payment_method'],
                'payment_for' => $validated['payment_for'],
                'receipt_number' => $receiptNumber,
                'remarks' => $validated['remarks'] ?? null,
            ]);
            
            $paymentHistory->save();
            
            // Update client payment record
            $clientPayment->completed_payments += 1;
            
            // Calculate next payment date (1 month from current payment)
            $paymentDate = Carbon::parse($validated['payment_date']);
            $clientPayment->next_payment_date = $paymentDate->addMonth()->format('Y-m-d');
            
            $clientPayment->updatePaymentStatus();
            $clientPayment->save();
            
            DB::commit();
            
            // Format response data for receipt
            $lot = Lot::find($clientPayment->lot_id);
            $paymentData = [
                'receipt_number' => $receiptNumber,
                'payment_date' => $validated['payment_date'],
                'payment_time' => now()->format('H:i:s'),
                'payment_method' => $validated['payment_method'],
                'amount' => $validated['amount'],
                'payment_for' => $validated['payment_for'],
                'client' => [
                    'client_name' => $clientPayment->client_name,
                    'lot_details' => [
                        'property_name' => $lot->property_name,
                        'block_lot_no' => $lot->block_lot_no,
                    ],
                    'total_payments' => $clientPayment->total_payments,
                ],
                'new_payment_number' => $clientPayment->completed_payments,
            ];
            
            return response()->json([
                'message' => 'Payment processed successfully',
                'payment_data' => $paymentData,
                'client_payment' => $clientPayment
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Error processing payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}