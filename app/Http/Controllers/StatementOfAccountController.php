<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StatementOfAccount;

class StatementOfAccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $statements = StatementOfAccount::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($statements);
    }

    /**
     * Display all statements from all users (shared view)
     */
    public function indexAll(Request $request)
    {
        $statements = StatementOfAccount::orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($statements);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return response()->json(['message' => 'Create form']);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'form_id' => 'nullable|string|max:255',
            'batch_id' => 'nullable|string|max:255',
            'declared_owner' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'block_lot_no' => 'nullable|string|max:255',
            'tax_dec_no' => 'nullable|string|max:255',
            'kind' => 'nullable|string|max:255',
            'assessed_value' => 'nullable|numeric|min:0',
            'payment_year' => 'nullable|string|max:255',
            'no_of_years' => 'nullable|integer|min:1',
            'full_payment' => 'nullable|numeric|min:0',
            'penalty_discount' => 'nullable|numeric',
            'total' => 'nullable|numeric|min:0',
            'envi_fee' => 'nullable|numeric|min:0',
            'grand_total' => 'nullable|numeric|min:0',
            'prepared_by' => 'nullable|string|max:255',
            'certified_by' => 'nullable|string|max:255',
            'isUnderlined' => 'nullable|boolean',
            'penaltyDiscountType' => 'nullable|string|max:255'
        ]);

        $validated['user_id'] = auth()->id();
        $statement = StatementOfAccount::create($validated);

        return response()->json([
            'message' => 'Statement of Account created successfully',
            'data' => $statement
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $statement = StatementOfAccount::with('user')->findOrFail($id);
        return response()->json($statement);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $statement = StatementOfAccount::with('user')->findOrFail($id);
        return response()->json($statement);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $statement = StatementOfAccount::findOrFail($id);

        $validated = $request->validate([
            'batch_id' => 'nullable|string|max:255',
            'declared_owner' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'block_lot_no' => 'nullable|string|max:255',
            'tax_dec_no' => 'nullable|string|max:255',
            'kind' => 'nullable|string|max:255',
            'assessed_value' => 'nullable|numeric|min:0',
            'payment_year' => 'nullable|string|max:255',
            'no_of_years' => 'nullable|integer|min:1',
            'full_payment' => 'nullable|numeric|min:0',
            'penalty_discount' => 'nullable|numeric',
            'total' => 'nullable|numeric|min:0',
            'envi_fee' => 'nullable|numeric|min:0',
            'grand_total' => 'nullable|numeric|min:0',
            'prepared_by' => 'nullable|string|max:255',
            'certified_by' => 'nullable|string|max:255',
            'isUnderlined' => 'nullable|boolean',
            'penaltyDiscountType' => 'nullable|string|max:255'
        ]);

        // Log the received data for debugging
        \Log::info('Update request data:', $validated);
        \Log::info('Prepared by field:', ['prepared_by' => $validated['prepared_by'] ?? 'NOT_SET']);

        $statement->update($validated);

        return response()->json([
            'message' => 'Statement of Account updated successfully',
            'data' => $statement
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $statement = StatementOfAccount::findOrFail($id);
        $statement->delete();

        return response()->json([
            'message' => 'Statement of Account deleted successfully'
        ]);
    }

    /**
     * Store multiple statements at once
     */
    public function storeMultiple(Request $request)
    {
        $validated = $request->validate([
            'statements' => 'required|array',
            'batch_id' => 'nullable|string|max:255',
            'prepared_by' => 'nullable|string|max:255',
            'certified_by' => 'nullable|string|max:255',
            'statements.*.declared_owner' => 'nullable|string|max:255',
            'statements.*.location' => 'nullable|string|max:255',
            'statements.*.block_lot_no' => 'nullable|string|max:255',
            'statements.*.tax_dec_no' => 'nullable|string|max:255',
            'statements.*.kind' => 'nullable|string|max:255',
            'statements.*.assessed_value' => 'nullable|numeric|min:0',
            'statements.*.payment_year' => 'nullable|string|max:255',
            'statements.*.no_of_years' => 'nullable|integer|min:1',
            'statements.*.full_payment' => 'nullable|numeric|min:0',
            'statements.*.penalty_discount' => 'nullable|numeric',
            'statements.*.total' => 'nullable|numeric|min:0',
            'statements.*.envi_fee' => 'nullable|numeric|min:0',
            'statements.*.grand_total' => 'nullable|numeric|min:0',
            'statements.*.isUnderlined' => 'nullable|boolean',
            'statements.*.penaltyDiscountType' => 'nullable|string|max:255'
        ]);

        $statements = [];
        foreach ($validated['statements'] as $statementData) {
            $statementData['user_id'] = auth()->id();
            // Apply batch_id to all statements if provided
            if (isset($validated['batch_id'])) {
                $statementData['batch_id'] = $validated['batch_id'];
            }
            // Apply prepared_by to all statements if provided
            if (isset($validated['prepared_by'])) {
                $statementData['prepared_by'] = $validated['prepared_by'];
            }
            // Apply certified_by to all statements if provided
            if (isset($validated['certified_by'])) {
                $statementData['certified_by'] = $validated['certified_by'];
            }
            $statementData['envi_fee'] = $statementData['envi_fee'] ?? 150; // Default environmental fee
            $statementData['grand_total'] = $statementData['total'] + $statementData['envi_fee'];
            $statements[] = StatementOfAccount::create($statementData);
        }

        return response()->json([
            'message' => 'Statements of Account created successfully',
            'data' => $statements
        ], 201);
    }
}
