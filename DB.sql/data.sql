-- ==============================================================
-- 1. ĐỊNH NGHĨA CÁC KIỂU ENUM
-- ==============================================================
CREATE TYPE order_status AS ENUM (
    'PENDING', 
    'COMPLETED', 
    'CANCELED', 
    'CONFIRM', 
    'PREPARING', 
    'READY'
);

CREATE TYPE payment_method AS ENUM (
    'MOMO', 
    'BANK_TRANSFER'
);

CREATE TYPE payment_status AS ENUM (
    'PENDING', 
    'SUCCESS', 
    'FAILED', 
    'CANCELLED'
);

CREATE TYPE discount_type AS ENUM (
    'PERCENTAGE', 
    'FIX_AMOUNT'
);

CREATE TYPE inventory_transaction_type AS ENUM (
    'IMPORT', 
    'EXPORT', 
    'ADJUSTMENT'
);

CREATE TYPE unit_type AS ENUM (
    'PACK', 
    'CAN', 
    'BOX', 
    'PIECE'
);


-- ==============================================================
-- 1. TÀI KHOẢN, KHÁCH HÀNG & PHÂN QUYỀN
-- ==============================================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    hash_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    customer_id VARCHAR(36) UNIQUE REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE customers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender BOOLEAN,
    address TEXT,
    phone VARCHAR(20),
);

CREATE TABLE baristas (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id VARCHAR(36) UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

-- ==============================================================
-- 2. THỰC ĐƠN, SẢN PHẨM & TOPPING (CATALOG)
-- ==============================================================
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price BIGINT NOT NULL DEFAULT 0,
    category_id VARCHAR(36) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE toppings (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price BIGINT NOT NULL DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE product_toppings (
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    topping_id VARCHAR(36) NOT NULL REFERENCES toppings(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, topping_id)
);

-- ==============================================================
-- 3. KHUYẾN MÃI (PROMOTION)
-- ==============================================================
CREATE TABLE promotions (
    id VARCHAR(36) PRIMARY KEY,
    voucher_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIX_AMOUNT')),
    discount_value BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    usage_limit BIGINT DEFAULT 0,
    used_count BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- ==============================================================
-- 4. GIỎ HÀNG (CART)
-- ==============================================================
CREATE TABLE carts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    id VARCHAR(36) PRIMARY KEY,
    cart_id VARCHAR(36) NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1
);

-- ==============================================================
-- 5. ĐƠN HÀNG, TIẾN TRÌNH & HÓA ĐƠN
-- ==============================================================
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) REFERENCES customers(id) ON DELETE SET NULL,
    barista_id VARCHAR(36) REFERENCES baristas(id) ON DELETE SET NULL,
    promotion_id VARCHAR(36) REFERENCES promotions(id) ON DELETE SET NULL,
    total_amount BIGINT NOT NULL DEFAULT 0,
    discount_amount BIGINT DEFAULT 0,
    final_amount BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELED', 'CONFIRM', 'PREPARING', 'READY')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity BIGINT NOT NULL DEFAULT 1,
    unit_price BIGINT NOT NULL DEFAULT 0,
    note TEXT
);

CREATE TABLE order_item_toppings (
    id VARCHAR(36) PRIMARY KEY,
    order_item_id VARCHAR(36) NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    topping_id VARCHAR(36) REFERENCES toppings(id) ON DELETE RESTRICT,
    quantity INT NOT NULL DEFAULT 1,
    price BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE order_processes (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL 
        CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELED', 'CONFIRM', 'PREPARING', 'READY')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    total_paid BIGINT NOT NULL DEFAULT 0,
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    total_amount BIGINT NOT NULL DEFAULT 0,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('MOMO', 'BANK_TRANSFER')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE loyalty_transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id VARCHAR(36) REFERENCES orders(id) ON DELETE SET NULL,
    points INT NOT NULL DEFAULT 0,
    balance_after INT NOT NULL DEFAULT 0,
    description TEXT,
    created_date DATE DEFAULT CURRENT_DATE
);

-- ==============================================================
-- 6. NGUYÊN LIỆU VÀ KHO HÀNG (INVENTORY)
-- ==============================================================
CREATE TABLE ingredients (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('PACK', 'CAN', 'BOX', 'PIECE')),
    current_stock DOUBLE PRECISION NOT NULL DEFAULT 0,
    min_alert_threshold DOUBLE PRECISION NOT NULL DEFAULT 0
);

CREATE TABLE inventory_transactions (
    id VARCHAR(36) PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('IMPORT', 'EXPORT', 'ADJUSTMENT')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE inventory_transaction_details (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(36) NOT NULL REFERENCES inventory_transactions(id) ON DELETE CASCADE,
    ingredient_id VARCHAR(36) NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity DOUBLE PRECISION NOT NULL,
    price BIGINT NOT NULL DEFAULT 0
);

-- ==============================================================
-- 7. DỮ LIỆU SEED MẪU (DÙNG ID TỰ CUNG CẤP)
-- ==============================================================
INSERT INTO categories (id, name, description) VALUES
('cat-01', 'Trà Sữa Truyền Thống', 'Đậm vị trà, béo ngậy vị sữa'),
('cat-02', 'Trà Trái Cây Tươi', 'Thanh mát, giải nhiệt');

INSERT INTO products (id, name, description, price, category_id, is_available) VALUES
('prod-01', 'Trà Sữa Ô Long Nướng', 'Vị khói đặc trưng từ lá trà nướng', 35000, 'cat-01', true),
('prod-02', 'Trà Đào Cam Sả', 'Trà thanh mát với đào tươi giòn', 40000, 'cat-02', true);

INSERT INTO toppings (id, name, price, is_available) VALUES
('top-01', 'Trân Châu Đen', 5000, true),
('top-02', 'Trân Châu Trắng', 7000, true);

INSERT INTO ingredients (id, name, unit, current_stock, min_alert_threshold) VALUES
('ing-01', 'Hạt Trân Châu', 'PACK', 20, 5),
('ing-02', 'Sữa Tươi', 'CAN', 50, 10);