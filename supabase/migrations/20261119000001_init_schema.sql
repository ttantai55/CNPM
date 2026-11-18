CREATE TABLE public.customers (
  id character varying NOT NULL,
  name character varying NOT NULL,
  date_of_birth date,
  gender boolean NOT NULL DEFAULT false,
  address character varying,
  phone character varying,
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);

CREATE TABLE public.baristas (
  id character varying NOT NULL,
  name character varying NOT NULL,
  phone character varying,
  status character varying DEFAULT 'OFFLINE'::character varying,
  CONSTRAINT baristas_pkey PRIMARY KEY (id)
);

CREATE TABLE public.categories (
  id character varying NOT NULL,
  name character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

CREATE TABLE public.inventories (
  id character varying NOT NULL,
  CONSTRAINT inventories_pkey PRIMARY KEY (id)
);

CREATE TABLE public.promotions (
  id character varying NOT NULL,
  voucher_code character varying NOT NULL UNIQUE,
  description character varying,
  discount_type character varying NOT NULL,
  discount_value bigint NOT NULL,
  start_date date,
  end_date date,
  usage_limit bigint,
  used_count bigint,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT promotions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.products (
  id character varying NOT NULL,
  name character varying NOT NULL,
  price bigint NOT NULL,
  description character varying,
  image_url character varying,
  status boolean NOT NULL DEFAULT true,
  rating double precision,
  weekly_sales_count integer NOT NULL DEFAULT 0,
  category_id character varying,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES public.categories(id)
);

CREATE TABLE public.toppings (
  id character varying NOT NULL,
  name character varying NOT NULL,
  price bigint NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  CONSTRAINT toppings_pkey PRIMARY KEY (id)
);

CREATE TABLE public.users (
  id character varying NOT NULL,
  username character varying NOT NULL UNIQUE,
  hash_password character varying NOT NULL,
  role character varying,
  email character varying NOT NULL UNIQUE,
  customer_id character varying UNIQUE,
  avatar_url text,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone,
  barista_id character varying UNIQUE,
  position character varying,
  loyalty_points integer NOT NULL DEFAULT 0,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT fk_users_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT fk_users_barista FOREIGN KEY (barista_id) REFERENCES public.baristas(id)
);
CREATE TABLE public.orders (
  id character varying NOT NULL,
  customer_id character varying,
  total_amount bigint NOT NULL DEFAULT 0,
  promotion_id character varying,
  final_amount bigint NOT NULL DEFAULT 0,
  status character varying NOT NULL DEFAULT 'PENDING'::character varying,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  prepared_at timestamp without time zone,
  completed_at timestamp without time zone,
  paid_at timestamp without time zone,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT fk_orders_promotion FOREIGN KEY (promotion_id) REFERENCES public.promotions(id)
);

CREATE TABLE public.carts (
  id character varying NOT NULL,
  user_id character varying NOT NULL UNIQUE,
  CONSTRAINT carts_pkey PRIMARY KEY (id),
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.ingredients (
  id character varying NOT NULL,
  name character varying NOT NULL,
  unit character varying NOT NULL,
  current_stock integer NOT NULL,
  min_alert_threshold double precision NOT NULL,
  inventory_id character varying,
  CONSTRAINT ingredients_pkey PRIMARY KEY (id),
  CONSTRAINT fk_ingredients_inventory FOREIGN KEY (inventory_id) REFERENCES public.inventories(id)
);

CREATE TABLE public.inventory_transactions (
  id character varying NOT NULL,
  type character varying NOT NULL,
  create_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  note character varying,
  barista_id character varying NOT NULL,
  CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT fk_inventory_transactions_barista FOREIGN KEY (barista_id) REFERENCES public.baristas(id)
);

CREATE TABLE public.order_items (
  id character varying NOT NULL,
  order_id character varying NOT NULL,
  product_id character varying NOT NULL,
  quantity bigint NOT NULL,
  unit_price bigint NOT NULL,
  note character varying,
  size character varying,
  sugar_percent integer,
  ice_percent integer,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES public.products(id)
);

CREATE TABLE public.payments (
  id character varying NOT NULL,
  order_id character varying NOT NULL UNIQUE,
  total_amount bigint NOT NULL,
  payment_method character varying NOT NULL,
  payment_status character varying NOT NULL,
  payment_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES public.orders(id)
);

CREATE TABLE public.invoices (
  id character varying NOT NULL,
  invoice_number character varying NOT NULL UNIQUE,
  order_id character varying NOT NULL UNIQUE,
  total_paid bigint NOT NULL,
  issued_date timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT fk_invoices_order FOREIGN KEY (order_id) REFERENCES public.orders(id)
);

CREATE TABLE public.loyalty_transactions (
  id character varying NOT NULL,
  user_id character varying NOT NULL,
  order_id character varying,
  transaction_type character varying NOT NULL,
  points integer NOT NULL,
  balanced_after integer NOT NULL,
  description character varying,
  create_date date,
  CONSTRAINT loyalty_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT fk_loyalty_transactions_user FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT fk_loyalty_transactions_order FOREIGN KEY (order_id) REFERENCES public.orders(id)
);

CREATE TABLE public.cart_items (
  id character varying NOT NULL,
  cart_id character varying NOT NULL,
  product_id character varying NOT NULL,
  quantity integer NOT NULL,
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES public.carts(id),
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES public.products(id)
);

CREATE TABLE public.inventory_transaction_details (
  id character varying NOT NULL,
  transaction_id character varying NOT NULL UNIQUE,
  ingredient_id character varying NOT NULL,
  quantity double precision NOT NULL,
  price bigint NOT NULL,
  CONSTRAINT inventory_transaction_details_pkey PRIMARY KEY (id),
  CONSTRAINT fk_inventory_transaction_details_transaction FOREIGN KEY (transaction_id) REFERENCES public.inventory_transactions(id),
  CONSTRAINT fk_inventory_transaction_details_ingredient FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id)
);

CREATE TABLE public.order_item_toppings (
  id character varying NOT NULL,
  order_item_id character varying NOT NULL,
  topping_id character varying NOT NULL,
  quantity integer NOT NULL,
  price bigint NOT NULL,
  CONSTRAINT order_item_toppings_pkey PRIMARY KEY (id),
  CONSTRAINT fk_order_item_toppings_item FOREIGN KEY (order_item_id) REFERENCES public.order_items(id),
  CONSTRAINT fk_order_item_toppings_topping FOREIGN KEY (topping_id) REFERENCES public.toppings(id)
);

CREATE TABLE public.order_processes (
  id character varying NOT NULL,
  order_id character varying NOT NULL,
  status character varying NOT NULL,
  update_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT order_processes_pkey PRIMARY KEY (id),
  CONSTRAINT fk_order_processes_order FOREIGN KEY (order_id) REFERENCES public.orders(id)
);

CREATE TABLE public.order_item_custom_toppings (
  order_item_id character varying NOT NULL,
  topping character varying,
  CONSTRAINT fk_order_item_custom_toppings_item FOREIGN KEY (order_item_id) REFERENCES public.order_items(id)
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at timestamp without time zone;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS prepared_at timestamp without time zone;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at timestamp without time zone;
ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_points integer NOT NULL DEFAULT 0;