<?php

namespace App\Http\Controllers;

use App\Models\Lot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LotController extends Controller
{
    /**
     * Display a listing of the lots.
     */
    public function index()
    {
        $lots = Lot::all();
        return response()->json($lots);
    }

    /**
     * Store a newly created lot in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'property_name' => 'required|string|max:255',
            'block_lot_no' => 'required|string|max:255',
            'lot_area' => 'required|integer',
            'total_contract_price' => 'nullable|integer',
            'status' => 'required|in:AVAILABLE,SOLD,EXCLUDED',
            'client' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $lot = Lot::create($request->all());
        return response()->json($lot, 201);
    }

    /**
     * Display the specified lot.
     */
    public function show(Lot $lot)
    {
        return response()->json($lot);
    }

    /**
     * Update the specified lot in storage.
     */
    public function update(Request $request, Lot $lot)
    {
        $validator = Validator::make($request->all(), [
            'property_name' => 'sometimes|required|string|max:255',
            'block_lot_no' => 'sometimes|required|string|max:255',
            'lot_area' => 'sometimes|required|integer',
            'total_contract_price' => 'nullable|integer',
            'status' => 'sometimes|required|in:AVAILABLE,SOLD,EXCLUDED',
            'client' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $lot->update($request->all());
        return response()->json($lot);
    }

    /**
     * Remove the specified lot from storage.
     */
    public function destroy(Lot $lot)
    {
        $lot->delete();
        return response()->json(null, 204);
    }
}