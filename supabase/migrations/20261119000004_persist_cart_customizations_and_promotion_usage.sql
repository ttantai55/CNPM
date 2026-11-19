ALTER TABLE public.cart_items
    ADD COLUMN IF NOT EXISTS size character varying(1) NOT NULL DEFAULT 'M',
    ADD COLUMN IF NOT EXISTS sugar_percent integer NOT NULL DEFAULT 50,
    ADD COLUMN IF NOT EXISTS ice_percent integer NOT NULL DEFAULT 50,
    ADD COLUMN IF NOT EXISTS note character varying(100);

CREATE TABLE IF NOT EXISTS public.cart_item_toppings (
    cart_item_id character varying NOT NULL,
    topping_id character varying NOT NULL,
    position integer NOT NULL,
    CONSTRAINT cart_item_toppings_pkey PRIMARY KEY (cart_item_id, position),
    CONSTRAINT fk_cart_item_toppings_item FOREIGN KEY (cart_item_id)
        REFERENCES public.cart_items(id) ON DELETE CASCADE
);

UPDATE public.promotions SET used_count = 0 WHERE used_count IS NULL;
ALTER TABLE public.promotions ALTER COLUMN used_count SET DEFAULT 0;
ALTER TABLE public.promotions ALTER COLUMN used_count SET NOT NULL;
