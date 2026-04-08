<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StatementOfAccount extends Model
{
    protected $fillable = [
        'user_id',
        'batch_id',
        'declared_owner',
        'location',
        'block_lot_no',
        'tax_dec_no',
        'kind',
        'assessed_value',
        'payment_year',
        'no_of_years',
        'full_payment',
        'penalty_discount',
        'total',
        'envi_fee',
        'grand_total',
        'prepared_by',
        'certified_by',
        'isUnderlined',
        'penaltyDiscountType'
    ];

    protected $casts = [
        'assessed_value' => 'decimal:2',
        'full_payment' => 'decimal:2',
        'penalty_discount' => 'decimal:2',
        'total' => 'decimal:2',
        'envi_fee' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'isUnderlined' => 'boolean'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
    