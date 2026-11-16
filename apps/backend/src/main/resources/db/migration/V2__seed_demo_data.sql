INSERT INTO customers (id, name, gender, phone)
VALUES ('CUST_DEMO', 'Khách hàng Demo', false, '0900000001')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    gender = EXCLUDED.gender,
    phone = EXCLUDED.phone;

INSERT INTO baristas (id, name)
VALUES ('STAFF_DEMO', 'Nhân viên Demo')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO users
    (id, username, hash_password, role, email, phone, full_name, position, customer_id, barista_id, created_at, updated_at)
VALUES
    ('USER_DEMO_CUSTOMER', 'demo-customer', '$2a$10$YkAeIhMYVYxH8slwxnNqYuy8hLtB0g7hPSJVweKZnJc./MIrMkaw6', 'ROLE_CUSTOMER', 'user@brewlite.vn', '0900000001', 'Khách hàng Demo', NULL, 'CUST_DEMO', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('USER_DEMO_STAFF', 'demo-staff', '$2a$10$YkAeIhMYVYxH8slwxnNqYuy8hLtB0g7hPSJVweKZnJc./MIrMkaw6', 'STAFF', 'staff@brewlite.vn', '0900000002', 'Nhân viên Demo', 'PHUC_VU', NULL, 'STAFF_DEMO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('USER_DEMO_MANAGER', 'demo-manager', '$2a$10$YkAeIhMYVYxH8slwxnNqYuy8hLtB0g7hPSJVweKZnJc./MIrMkaw6', 'ROLE_MANAGER', 'manager@brewlite.vn', '0900000003', 'Quản lý Demo', NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    hash_password = EXCLUDED.hash_password,
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    full_name = EXCLUDED.full_name,
    position = EXCLUDED.position,
    customer_id = EXCLUDED.customer_id,
    barista_id = EXCLUDED.barista_id;

INSERT INTO categories (id, name, slug, description, is_active)
VALUES
    ('CAT_0001', 'Cà phê', 'coffee', 'Cà phê pha mới mỗi ngày', true),
    ('CAT_0002', 'Trà sữa', 'milk-tea', 'Trà sữa và trà trái cây', true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

INSERT INTO products
    (id, name, price, description, image_url, status, category_id, rating, weekly_sales_count)
VALUES
    ('PROD_0001', 'Latte Kem Sữa Tây Ban Nha', 56000, 'Espresso đậm vị, sữa đặc và lớp kem sữa béo mịn', '/images/latte-kem-sua.png', true, 'CAT_0001', 4.9, 128),
    ('PROD_0002', 'Cold Brew Đường Nâu', 58000, 'Ủ lạnh 18 giờ, ngọt dịu đường nâu và hậu vị caramel', '/images/cold-brew.png', true, 'CAT_0001', 4.8, 112),
    ('PROD_0003', 'Trà Sữa Trân Châu Đường Đen', 45000, 'Hồng trà đậm, sữa tươi và trân châu đường đen dẻo', '/images/tra-sua-tran-chau.png', true, 'CAT_0002', 4.9, 184)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    category_id = EXCLUDED.category_id,
    rating = EXCLUDED.rating,
    weekly_sales_count = EXCLUDED.weekly_sales_count;

INSERT INTO toppings (id, name, price, is_available)
VALUES
    ('TOP_0001', 'Trân châu đường đen', 10000, true),
    ('TOP_0002', 'Sương sáo', 6000, true),
    ('TOP_0003', 'Kem phô mai biển', 12000, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    is_available = EXCLUDED.is_available;
