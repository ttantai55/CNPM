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
    ('CAT_0003', 'Nước ép', 'juice', 'Nước ép trái cây tươi', TRUE),
    ('CAT_0004', 'Bánh ngọt', 'banh-ngot', 'Bánh ngọt và bánh nướng dùng kèm thức uống', TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

INSERT INTO products
    (id, name, price, description, image_url, status, category_id, rating, weekly_sales_count, sold_count, created_at)
VALUES
    ('PROD_0001', 'Latte Kem Sữa Tây Ban Nha', 56000, 'Espresso đậm vị, sữa đặc và lớp kem sữa béo mịn', '/images/latte-kem-sua.png', TRUE, 'CAT_0001', 4.9, 128, 0, CURRENT_TIMESTAMP),
    ('PROD_0002', 'Cold Brew Đường Nâu', 58000, 'Ủ lạnh 18 giờ, ngọt dịu đường nâu và hậu vị caramel', '/images/cold-brew.png', TRUE, 'CAT_0001', 4.8, 112, 0, CURRENT_TIMESTAMP),
    ('PROD_0003', 'Mocha Caramel Nướng', 62000, 'Cacao đậm, caramel nướng thơm và espresso rang vừa', '/images/mocha-caramel.png', TRUE, 'CAT_0001', 4.7, 96, 0, CURRENT_TIMESTAMP),
    ('PROD_0004', 'Trà Sữa Trân Châu Đường Đen', 45000, 'Hồng trà đậm, sữa tươi và trân châu đường đen dẻo', '/images/tra-sua-tran-chau.png', TRUE, 'CAT_0002', 4.9, 184, 0, CURRENT_TIMESTAMP),
    ('PROD_0005', 'Matcha Latte Kem Muối', 49000, 'Matcha Uji thanh mát, sữa tươi và kem muối mằn mặn', '/images/tra-sua-matcha.png', TRUE, 'CAT_0002', 4.6, 103, 0, CURRENT_TIMESTAMP),
    ('PROD_0006', 'Trà Sữa Khoai Môn', 47000, 'Khoai môn nghiền bùi béo cùng lớp kem phô mai', '/images/tra-sua-khoai-mon.png', FALSE, 'CAT_0002', 4.5, 72, 0, CURRENT_TIMESTAMP),
    ('PROD_0007', 'Thanh Long Xoài Lấp Lánh', 56000, 'Thanh long ép lạnh, xoài chín và nước khoáng có ga', '/images/thanh-long-xoai.png', TRUE, 'CAT_0003', 4.9, 156, 0, CURRENT_TIMESTAMP),
    ('PROD_0008', 'Bưởi Hồng Ép Lạnh', 52000, 'Bưởi hồng, mật ong hoa tự nhiên và hạt chia', '/images/buoi-hong.png', TRUE, 'CAT_0003', 4.7, 91, 0, CURRENT_TIMESTAMP),
    ('PROD_0009', 'Dưa Hấu Chanh Bạc Hà', 50000, 'Dưa hấu tươi, chanh xanh và bạc hà nghiền mát lạnh', '/images/dua-hau.png', TRUE, 'CAT_0003', 4.9, 142, 0, CURRENT_TIMESTAMP),
    ('PROD_0010', 'Chanh Dây Gừng Nghệ', 48000, 'Chanh dây, gừng tươi, chanh vàng và nghệ nguyên chất', '/images/chanh-day.png', TRUE, 'CAT_0003', 4.8, 87, 0, CURRENT_TIMESTAMP),
    ('PROD_0011', 'Nước Ép Xanh Thanh Lọc', 54000, 'Táo xanh, dưa leo, cải bó xôi, cần tây và táo xoắn', '/images/xanh-thanh-loc.png', TRUE, 'CAT_0003', 4.6, 65, 0, CURRENT_TIMESTAMP),
    ('PROD_0012', 'Espresso Sữa Đá', 42000, 'Espresso rang vừa pha cùng sữa đặc, đậm đà và cân bằng vị ngọt', '/images/latte-kem-sua.png', TRUE, 'CAT_0001', 4.8, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0013', 'Bạc Xỉu Cốt Dừa', 49000, 'Cà phê nhẹ hòa quyện sữa tươi và cốt dừa thơm béo', '/images/tra-sua-khoai-mon.png', TRUE, 'CAT_0001', 4.8, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0014', 'Americano Cam', 52000, 'Americano mát lạnh với nước cam tươi và hương vỏ cam dịu nhẹ', '/images/chanh-day.png', TRUE, 'CAT_0001', 4.7, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0015', 'Cappuccino Quế', 52000, 'Espresso, sữa nóng đánh bọt mịn và chút bột quế thơm', '/images/latte-kem-sua.png', TRUE, 'CAT_0001', 4.8, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0016', 'Cà Phê Muối', 49000, 'Cà phê phin đậm vị phủ lớp kem muối mằn mặn béo mịn', '/images/mocha-caramel.png', TRUE, 'CAT_0001', 4.9, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0017', 'Cold Brew Chanh Vàng', 55000, 'Cà phê ủ lạnh 18 giờ kết hợp chanh vàng tươi mát', '/images/cold-brew.png', TRUE, 'CAT_0001', 4.8, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0018', 'Trà Đào Cam Sả', 48000, 'Trà đen ủ thơm cùng đào vàng, cam tươi và sả', '/images/tra-sua-tran-chau.png', TRUE, 'CAT_0002', 4.9, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0019', 'Trà Vải Hoa Hồng', 49000, 'Trà lài thanh mát, vải ngọt dịu và hương hoa hồng', '/images/tra-sua-matcha.png', TRUE, 'CAT_0002', 4.8, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0020', 'Trà Sen Vàng', 46000, 'Trà xanh ướp sen thoảng hương, hậu vị thanh nhẹ', '/images/tra-sua-matcha.png', TRUE, 'CAT_0002', 4.7, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0021', 'Matcha Dâu Tươi', 56000, 'Matcha Nhật thơm dịu kết hợp sữa tươi và dâu chín', '/images/tra-sua-matcha.png', TRUE, 'CAT_0002', 4.9, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0022', 'Hồng Trà Chanh Mật Ong', 45000, 'Hồng trà đậm vị pha cùng chanh tươi và mật ong', '/images/chanh-day.png', TRUE, 'CAT_0002', 4.7, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0023', 'Trà Oolong Sữa Nướng', 52000, 'Oolong rang thơm, sữa tươi và lớp kem sữa nướng nhẹ', '/images/tra-sua-khoai-mon.png', TRUE, 'CAT_0002', 4.8, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0024', 'Trà Chanh Dây Nha Đam', 49000, 'Trà xanh chanh dây chua ngọt cùng nha đam giòn mát', '/images/chanh-day.png', TRUE, 'CAT_0002', 4.8, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0025', 'Nước Ép Dứa Gừng', 48000, 'Dứa tươi ép lạnh với gừng thơm, vị ngọt thanh tự nhiên', '/images/thanh-long-xoai.png', TRUE, 'CAT_0003', 4.7, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0026', 'Sinh Tố Bơ Sữa Chua', 56000, 'Bơ sáp xay mịn cùng sữa chua và sữa tươi', '/images/xanh-thanh-loc.png', TRUE, 'CAT_0003', 4.8, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0027', 'Croissant Bơ Pháp', 32000, 'Bánh sừng bò nhiều lớp, nướng vàng giòn với bơ thơm', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.9, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0028', 'Pain Au Chocolat', 38000, 'Bánh ngàn lớp giòn xốp cuộn nhân chocolate đắng nhẹ', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.8, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0029', 'Tiramisu Cà Phê', 52000, 'Bánh tiramisu mềm mượt với mascarpone và cà phê espresso', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.9, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0030', 'Cheesecake Chanh Dây', 49000, 'Cheesecake béo mịn, điểm vị chua dịu của chanh dây', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.8, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0031', 'Danish Táo Quế', 39000, 'Bánh Danish giòn thơm với táo nướng và quế', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.7, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0032', 'Bánh Chuối Óc Chó', 35000, 'Bánh chuối mềm ẩm, thêm óc chó rang bùi thơm', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.8, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0033', 'Muffin Việt Quất', 33000, 'Muffin nướng mềm với việt quất chua ngọt trong từng miếng', 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.8, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0034', 'Su Kem Vanilla', 28000, 'Vỏ su nhẹ xốp, nhân kem vanilla mát lạnh', 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.7, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0035', 'Tart Trứng Nướng', 32000, 'Đế tart bơ giòn với nhân trứng sữa nướng vàng', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.8, 0, 0, CURRENT_TIMESTAMP),
    ('PROD_0036', 'Brownie Chocolate', 36000, 'Brownie chocolate đậm vị, mềm ẩm với lớp vỏ nứt nhẹ', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.9, 0, 0, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    category_id = EXCLUDED.category_id,
    rating = EXCLUDED.rating,
    weekly_sales_count = EXCLUDED.weekly_sales_count,
    sold_count = EXCLUDED.sold_count;

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