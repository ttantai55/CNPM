-- PostgreSQL schema matching the Spring Data JPA entities.

CREATE TABLE IF NOT EXISTS customers (
    id varchar(255) PRIMARY KEY,
    name varchar(100) NOT NULL,
    date_of_birth date,
    gender boolean NOT NULL DEFAULT false,
    address varchar(255),
    phone varchar(20)
);

CREATE TABLE IF NOT EXISTS baristas (
    id varchar(255) PRIMARY KEY,
    name varchar(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id varchar(255) PRIMARY KEY,
    name varchar(100) NOT NULL,
    slug varchar(120) NOT NULL UNIQUE,
    description text,
    is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS inventories (
    id varchar(255) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS promotions (
    id varchar(255) PRIMARY KEY,
    voucher_code varchar(50) NOT NULL UNIQUE,
    description varchar(255),
    discount_type varchar(255) NOT NULL,
    discount_value bigint NOT NULL,
    start_date date,
    end_date date,
    usage_limit bigint,
    used_count bigint,
    is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS products (
    id varchar(255) PRIMARY KEY,
    name varchar(100) NOT NULL,
    price bigint NOT NULL,
    description varchar(255),
    image_url varchar(255),
    status boolean NOT NULL DEFAULT true,
    rating double precision,
    weekly_sales_count integer NOT NULL DEFAULT 0,
    category_id varchar(255),
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE IF NOT EXISTS toppings (
    id varchar(255) PRIMARY KEY,
    name varchar(100) NOT NULL,
    price bigint NOT NULL,
    is_available boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS users (
    id varchar(255) PRIMARY KEY,
    username varchar(50) NOT NULL UNIQUE,
    hash_password varchar(255) NOT NULL,
    role varchar(30),
    email varchar(100) NOT NULL UNIQUE,
    customer_id varchar(255) UNIQUE,
    avatar_url text,
    created_at timestamp without time zone NOT NULL DEFAULT current_timestamp,
    updated_at timestamp without time zone,
    barista_id varchar(255) UNIQUE,
    phone varchar(255),
    full_name varchar(255),
    position varchar(20),
    CONSTRAINT fk_users_customer
        FOREIGN KEY (customer_id) REFERENCES customers (id),
    CONSTRAINT fk_users_barista
        FOREIGN KEY (barista_id) REFERENCES baristas (id)
);

CREATE TABLE IF NOT EXISTS orders (
    id varchar(255) PRIMARY KEY,
    customer_id varchar(255),
    total_amount bigint NOT NULL DEFAULT 0,
    promotion_id varchar(255),
    final_amount bigint NOT NULL DEFAULT 0,
    status varchar(255) NOT NULL DEFAULT 'PENDING',
    created_at timestamp without time zone NOT NULL DEFAULT current_timestamp,
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customers (id),
    CONSTRAINT fk_orders_promotion
        FOREIGN KEY (promotion_id) REFERENCES promotions (id)
);

CREATE TABLE IF NOT EXISTS carts (
    id varchar(255) PRIMARY KEY,
    user_id varchar(255) NOT NULL UNIQUE,
    CONSTRAINT fk_carts_user
        FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS ingredients (
    id varchar(255) PRIMARY KEY,
    name varchar(100) NOT NULL,
    unit varchar(255) NOT NULL,
    current_stock integer NOT NULL,
    min_alert_threshold double precision NOT NULL,
    inventory_id varchar(255),
    CONSTRAINT fk_ingredients_inventory
        FOREIGN KEY (inventory_id) REFERENCES inventories (id)
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id varchar(255) PRIMARY KEY,
    type varchar(255) NOT NULL,
    create_at timestamp without time zone NOT NULL DEFAULT current_timestamp,
    note varchar(255),
    barista_id varchar(255) NOT NULL,
    CONSTRAINT fk_inventory_transactions_barista
        FOREIGN KEY (barista_id) REFERENCES baristas (id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id varchar(255) PRIMARY KEY,
    order_id varchar(255) NOT NULL,
    product_id varchar(255) NOT NULL,
    quantity bigint NOT NULL,
    unit_price bigint NOT NULL,
    note varchar(255),
    size varchar(255),
    sugar_percent integer,
    ice_percent integer,
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders (id),
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE IF NOT EXISTS payments (
    id varchar(255) PRIMARY KEY,
    order_id varchar(255) NOT NULL UNIQUE,
    total_amount bigint NOT NULL,
    payment_method varchar(255) NOT NULL,
    payment_status varchar(255) NOT NULL,
    payment_date timestamp without time zone NOT NULL DEFAULT current_timestamp,
    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id) REFERENCES orders (id)
);

CREATE TABLE IF NOT EXISTS invoices (
    id varchar(255) PRIMARY KEY,
    invoice_number varchar(50) NOT NULL UNIQUE,
    order_id varchar(255) NOT NULL UNIQUE,
    total_paid bigint NOT NULL,
    issued_date timestamp without time zone NOT NULL DEFAULT current_timestamp,
    CONSTRAINT fk_invoices_order
        FOREIGN KEY (order_id) REFERENCES orders (id)
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id varchar(255) PRIMARY KEY,
    user_id varchar(255) NOT NULL,
    order_id varchar(255),
    transaction_type varchar(255) NOT NULL,
    points integer NOT NULL,
    balanced_after integer NOT NULL,
    description varchar(255),
    create_date date,
    CONSTRAINT fk_loyalty_transactions_user
        FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_loyalty_transactions_order
        FOREIGN KEY (order_id) REFERENCES orders (id)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id varchar(255) PRIMARY KEY,
    cart_id varchar(255) NOT NULL,
    product_id varchar(255) NOT NULL,
    quantity integer NOT NULL,
    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id) REFERENCES carts (id),
    CONSTRAINT fk_cart_items_product
        FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE IF NOT EXISTS inventory_transaction_details (
    id varchar(255) PRIMARY KEY,
    transaction_id varchar(255) NOT NULL UNIQUE,
    ingredient_id varchar(255) NOT NULL,
    quantity double precision NOT NULL,
    price bigint NOT NULL,
    CONSTRAINT fk_inventory_transaction_details_transaction
        FOREIGN KEY (transaction_id) REFERENCES inventory_transactions (id),
    CONSTRAINT fk_inventory_transaction_details_ingredient
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
);

CREATE TABLE IF NOT EXISTS order_item_toppings (
    id varchar(255) PRIMARY KEY,
    order_item_id varchar(255) NOT NULL,
    topping_id varchar(255) NOT NULL,
    quantity integer NOT NULL,
    price bigint NOT NULL,
    CONSTRAINT fk_order_item_toppings_item
        FOREIGN KEY (order_item_id) REFERENCES order_items (id),
    CONSTRAINT fk_order_item_toppings_topping
        FOREIGN KEY (topping_id) REFERENCES toppings (id)
);

CREATE TABLE IF NOT EXISTS order_processes (
    id varchar(255) PRIMARY KEY,
    order_id varchar(255) NOT NULL,
    status varchar(255) NOT NULL,
    update_at timestamp without time zone NOT NULL DEFAULT current_timestamp,
    CONSTRAINT fk_order_processes_order
        FOREIGN KEY (order_id) REFERENCES orders (id)
);

CREATE TABLE IF NOT EXISTS order_item_custom_toppings (
    order_item_id varchar(255) NOT NULL,
    topping varchar(255),
    CONSTRAINT fk_order_item_custom_toppings_item
        FOREIGN KEY (order_item_id) REFERENCES order_items (id)
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_created
    ON orders (customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created
    ON orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order
    ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created
    ON inventory_transactions (create_at DESC);