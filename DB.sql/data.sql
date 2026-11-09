UPDATE orders SET status = 'COMPLETED' WHERE status = 'READY';
ALTER TABLE products DROP COLUMN IF EXISTS stock_quantity;

INSERT INTO customers (id, name, gender, phone)
VALUES ('CUST_DEMO', 'Khách hàng Demo', FALSE, '0900000001')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    gender = EXCLUDED.gender,
    phone = EXCLUDED.phone;

INSERT INTO users
    (id, username, hash_password, role, email, phone, full_name, position, customer_id, created_at, updated_at)
VALUES
    ('USER_DEMO_CUSTOMER', 'demo-customer', '$2a$10$YkAeIhMYVYxH8slwxnNqYuy8hLtB0g7hPSJVweKZnJc./MIrMkaw6', 'ROLE_CUSTOMER', 'user@brewlite.vn', '0900000001', 'Khách hàng Demo', NULL, 'CUST_DEMO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('USER_DEMO_STAFF', 'demo-staff', '$2a$10$YkAeIhMYVYxH8slwxnNqYuy8hLtB0g7hPSJVweKZnJc./MIrMkaw6', 'STAFF', 'staff@brewlite.vn', '0900000002', 'Nhân viên Demo', 'PHUC_VU', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('USER_DEMO_MANAGER', 'demo-manager', '$2a$10$YkAeIhMYVYxH8slwxnNqYuy8hLtB0g7hPSJVweKZnJc./MIrMkaw6', 'ROLE_MANAGER', 'manager@brewlite.vn', '0900000003', 'Quản lý Demo', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    hash_password = EXCLUDED.hash_password,
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    full_name = EXCLUDED.full_name,
    position = EXCLUDED.position,
    customer_id = EXCLUDED.customer_id;

INSERT INTO baristas (id, name)
SELECT 'STAFF_MIG_' || u.id, COALESCE(NULLIF(u.full_name, ''), u.username)
FROM users u
WHERE upper(COALESCE(u.role, '')) LIKE '%STAFF%'
  AND u.barista_id IS NULL
ON CONFLICT (id) DO NOTHING;

UPDATE users
SET barista_id = 'STAFF_MIG_' || id
WHERE upper(COALESCE(role, '')) LIKE '%STAFF%'
  AND barista_id IS NULL
  AND EXISTS (SELECT 1 FROM baristas b WHERE b.id = 'STAFF_MIG_' || users.id);

INSERT INTO categories (id, name, slug, description, is_active)
VALUES
    ('CAT_0001', 'Cà phê', 'coffee', 'Cà phê pha mới mỗi ngày', TRUE),
    ('CAT_0002', 'Trà sữa', 'milk-tea', 'Trà sữa và trà trái cây', TRUE),
    ('CAT_0003', 'Nước ép', 'juice', 'Nước ép trái cây tươi', TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

INSERT INTO products
    (id, name, price, description, image_url, status, category_id, rating, weekly_sales_count)
VALUES
    ('PROD_0001', 'Latte Kem Sữa Tây Ban Nha', 56000, 'Espresso đậm vị, sữa đặc và lớp kem sữa béo mịn', '/images/latte-kem-sua.png', TRUE, 'CAT_0001', 4.9, 128),
    ('PROD_0002', 'Cold Brew Đường Nâu', 58000, 'Ủ lạnh 18 giờ, ngọt dịu đường nâu và hậu vị caramel', '/images/cold-brew.png', TRUE, 'CAT_0001', 4.8, 112),
    ('PROD_0003', 'Mocha Caramel Nướng', 62000, 'Cacao đậm, caramel nướng thơm và espresso rang vừa', '/images/mocha-caramel.png', TRUE, 'CAT_0001', 4.7, 96),
    ('PROD_0004', 'Trà Sữa Trân Châu Đường Đen', 45000, 'Hồng trà đậm, sữa tươi và trân châu đường đen dẻo', '/images/tra-sua-tran-chau.png', TRUE, 'CAT_0002', 4.9, 184),
    ('PROD_0005', 'Matcha Latte Kem Muối', 49000, 'Matcha Uji thanh mát, sữa tươi và kem muối mằn mặn', '/images/tra-sua-matcha.png', TRUE, 'CAT_0002', 4.6, 103),
    ('PROD_0006', 'Trà Sữa Khoai Môn', 47000, 'Khoai môn nghiền bùi béo cùng lớp kem phô mai', '/images/tra-sua-khoai-mon.png', FALSE, 'CAT_0002', 4.5, 72),
    ('PROD_0007', 'Thanh Long Xoài Lấp Lánh', 56000, 'Thanh long ép lạnh, xoài chín và nước khoáng có ga', '/images/thanh-long-xoai.png', TRUE, 'CAT_0003', 4.9, 156),
    ('PROD_0008', 'Bưởi Hồng Ép Lạnh', 52000, 'Bưởi hồng, mật ong hoa tự nhiên và hạt chia', '/images/buoi-hong.png', TRUE, 'CAT_0003', 4.7, 91),
    ('PROD_0009', 'Dưa Hấu Chanh Bạc Hà', 50000, 'Dưa hấu tươi, chanh xanh và bạc hà nghiền mát lạnh', '/images/dua-hau.png', TRUE, 'CAT_0003', 4.9, 142),
    ('PROD_0010', 'Chanh Dây Gừng Nghệ', 48000, 'Chanh dây, gừng tươi, chanh vàng và nghệ nguyên chất', '/images/chanh-day.png', TRUE, 'CAT_0003', 4.8, 87),
    ('PROD_0011', 'Nước Ép Xanh Thanh Lọc', 54000, 'Táo xanh, dưa leo, cải bó xôi, cần tây và táo xoắn', '/images/xanh-thanh-loc.png', TRUE, 'CAT_0003', 4.6, 65)
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
    ('TOP_0001', 'Trân châu đường đen', 10000, TRUE),
    ('TOP_0002', 'Sương sáo', 6000, TRUE),
    ('TOP_0003', 'Kem phô mai biển', 12000, TRUE),
    ('TOP_0004', 'Thạch cà phê', 8000, TRUE),
    ('TOP_0005', 'Nha đam', 6000, TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    is_available = EXCLUDED.is_available;

INSERT INTO ingredients (id, name, unit, current_stock, min_alert_threshold)
VALUES
    ('ING_0001', 'Hạt cà phê Arabica', 'PACK', 20, 5),
    ('ING_0002', 'Sữa tươi', 'BOX', 30, 8),
    ('ING_0003', 'Trà đen', 'PACK', 18, 5),
    ('ING_0004', 'Đường nâu', 'PACK', 15, 4)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    unit = EXCLUDED.unit,
    current_stock = EXCLUDED.current_stock,
    min_alert_threshold = EXCLUDED.min_alert_threshold;

INSERT INTO promotions
    (id, voucher_code, description, discount_type, discount_value, start_date, end_date, usage_limit, used_count, is_active)
VALUES
    ('PROMO_DEMO_001', 'TAIDEPTRAI', 'Nhóm trưởng quá đẹp trai đi', 'PERCENTAGE', 50, CURRENT_DATE, CURRENT_DATE + 30, 100, 2, TRUE),
    ('PROMO_DEMO_002', 'HUNGGAY', 'thghunghgay', 'PERCENTAGE', 10, CURRENT_DATE, CURRENT_DATE + 30, 100, 0, TRUE),
    ('PROMO_DEMO_003', 'CONCHOBAO', '7gao', 'PERCENTAGE', 10, CURRENT_DATE, CURRENT_DATE + 30, 100, 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
    voucher_code = EXCLUDED.voucher_code,
    description = EXCLUDED.description,
    discount_type = EXCLUDED.discount_type,
    discount_value = EXCLUDED.discount_value,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    usage_limit = EXCLUDED.usage_limit,
    used_count = EXCLUDED.used_count,
    is_active = EXCLUDED.is_active;
