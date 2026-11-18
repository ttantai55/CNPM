UPDATE public.promotions
SET discount_type = 'FIX_AMOUNT'
WHERE discount_type = 'FIXED_AMOUNT';
