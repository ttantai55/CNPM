UPDATE public.orders
SET status = 'PREPARING'
WHERE status = 'PROCESSING';

UPDATE public.order_processes
SET status = 'PREPARING'
WHERE status = 'PROCESSING';

UPDATE public.payments
SET payment_status = 'SUCCESS'
WHERE payment_status = 'PAID';

UPDATE public.payments
SET payment_method = CASE upper(payment_method)
    WHEN 'CASH' THEN 'MOMO'
    WHEN 'VN_PAY' THEN 'VIET_QR'
    WHEN 'VIETQR' THEN 'VIET_QR'
END
WHERE upper(payment_method) IN ('CASH', 'VN_PAY', 'VIETQR');

UPDATE public.ingredients
SET unit = CASE lower(unit)
    WHEN 'kg' THEN 'KG'
    WHEN 'lít' THEN 'BOX'
    WHEN 'gói' THEN 'PACK'
    ELSE unit
END
WHERE lower(unit) IN ('kg', 'lít', 'gói');
