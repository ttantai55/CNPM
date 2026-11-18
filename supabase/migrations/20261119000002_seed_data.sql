INSERT INTO customers (id, name, gender, phone)
VALUES ('CUST_DEMO', 'Khách hàng Demo', false, '0900000001')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    gender = EXCLUDED.gender,
    phone = EXCLUDED.phone;

INSERT INTO baristas (id, name, phone, status)
VALUES 
    ('STAFF_DEMO', 'Nhân viên Demo', '0900000002', 'OFFLINE'),
    ('STAFF_DEMO_1', 'nahassjsafkj', '0123456789', 'OFFLINE')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    status = EXCLUDED.status;

INSERT INTO users
    (id, username, hash_password, role, email, position, customer_id, barista_id, created_at, updated_at)
VALUES
    ('USER_DEMO_CUSTOMER', 'demo-customer', '$2a$10$YkAeIhMYVYxH8slwxnNqYuy8hLtB0g7hPSJVweKZnJc./MIrMkaw6', 'ROLE_CUSTOMER', 'user@brewlite.vn', NULL, 'CUST_DEMO', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('USER_DEMO_STAFF', 'demo-staff', '$2a$10$YkAeIhMYVYxH8slwxnNqYuy8hLtB0g7hPSJVweKZnJc./MIrMkaw6', 'STAFF', 'staff@brewlite.vn', 'PHUC_VU', NULL, 'STAFF_DEMO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('USER_DEMO_MANAGER', 'demo-manager', '$2a$10$YkAeIhMYVYxH8slwxnNqYuy8hLtB0g7hPSJVweKZnJc./MIrMkaw6', 'ROLE_MANAGER', 'manager@brewlite.vn', NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    hash_password = EXCLUDED.hash_password,
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    position = EXCLUDED.position,
    customer_id = EXCLUDED.customer_id,
    barista_id = EXCLUDED.barista_id;

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
    ('PROD_0011', 'Nước Ép Xanh Thanh Lọc', 54000, 'Táo xanh, dưa leo, cải bó xôi, cần tây và táo xoắn', '/images/xanh-thanh-loc.png', TRUE, 'CAT_0003', 4.6, 65),
    ('PROD_0012', 'Espresso Sữa Đá', 42000, 'Espresso rang vừa pha cùng sữa đặc, đậm đà và cân bằng vị ngọt', '/images/latte-kem-sua.png', TRUE, 'CAT_0001', 4.8, 0),
    ('PROD_0013', 'Bạc Xỉu Cốt Dừa', 49000, 'Cà phê nhẹ hòa quyện sữa tươi và cốt dừa thơm béo', '/images/tra-sua-khoai-mon.png', TRUE, 'CAT_0001', 4.8, 0),
    ('PROD_0014', 'Americano Cam', 52000, 'Americano mát lạnh với nước cam tươi và hương vỏ cam dịu nhẹ', '/images/chanh-day.png', TRUE, 'CAT_0001', 4.7, 0),
    ('PROD_0015', 'Cappuccino Quế', 52000, 'Espresso, sữa nóng đánh bọt mịn và chút bột quế thơm', '/images/latte-kem-sua.png', TRUE, 'CAT_0001', 4.8, 0),
    ('PROD_0016', 'Cà Phê Muối', 49000, 'Cà phê phin đậm vị phủ lớp kem muối mằn mặn béo mịn', '/images/mocha-caramel.png', TRUE, 'CAT_0001', 4.9, 0),
    ('PROD_0017', 'Cold Brew Chanh Vàng', 55000, 'Cà phê ủ lạnh 18 giờ kết hợp chanh vàng tươi mát', '/images/cold-brew.png', TRUE, 'CAT_0001', 4.8, 0),
    ('PROD_0018', 'Trà Đào Cam Sả', 48000, 'Trà đen ủ thơm cùng đào vàng, cam tươi và sả', '/images/tra-sua-tran-chau.png', TRUE, 'CAT_0002', 4.9, 0),
    ('PROD_0019', 'Trà Vải Hoa Hồng', 49000, 'Trà lài thanh mát, vải ngọt dịu và hương hoa hồng', '/images/tra-sua-matcha.png', TRUE, 'CAT_0002', 4.8, 0),
    ('PROD_0020', 'Trà Sen Vàng', 46000, 'Trà xanh ướp sen thoảng hương, hậu vị thanh nhẹ', '/images/tra-sua-matcha.png', TRUE, 'CAT_0002', 4.7, 0),
    ('PROD_0021', 'Matcha Dâu Tươi', 56000, 'Matcha Nhật thơm dịu kết hợp sữa tươi và dâu chín', '/images/tra-sua-matcha.png', TRUE, 'CAT_0002', 4.9, 0),
    ('PROD_0022', 'Hồng Trà Chanh Mật Ong', 45000, 'Hồng trà đậm vị pha cùng chanh tươi và mật ong', '/images/chanh-day.png', TRUE, 'CAT_0002', 4.7, 0),
    ('PROD_0023', 'Trà Oolong Sữa Nướng', 52000, 'Oolong rang thơm, sữa tươi và lớp kem sữa nướng nhẹ', '/images/tra-sua-khoai-mon.png', TRUE, 'CAT_0002', 4.8, 0),
    ('PROD_0024', 'Trà Chanh Dây Nha Đam', 49000, 'Trà xanh chanh dây chua ngọt cùng nha đam giòn mát', '/images/chanh-day.png', TRUE, 'CAT_0002', 4.8, 0),
    ('PROD_0025', 'Nước Ép Dứa Gừng', 48000, 'Dứa tươi ép lạnh với gừng thơm, vị ngọt thanh tự nhiên', '/images/thanh-long-xoai.png', TRUE, 'CAT_0003', 4.7, 0),
    ('PROD_0026', 'Sinh Tố Bơ Sữa Chua', 56000, 'Bơ sáp xay mịn cùng sữa chua và sữa tươi', '/images/xanh-thanh-loc.png', TRUE, 'CAT_0003', 4.8, 0),
    ('PROD_0027', 'Croissant Bơ Pháp', 32000, 'Bánh sừng bò nhiều lớp, nướng vàng giòn với bơ thơm', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.9, 0),
    ('PROD_0028', 'Pain Au Chocolat', 38000, 'Bánh ngàn lớp giòn xốp cuộn nhân chocolate đắng nhẹ', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.8, 0),
    ('PROD_0029', 'Tiramisu Cà Phê', 52000, 'Bánh tiramisu mềm mượt với mascarpone và cà phê espresso', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.9, 0),
    ('PROD_0030', 'Cheesecake Chanh Dây', 49000, 'Cheesecake béo mịn, điểm vị chua dịu của chanh dây', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.8, 0),
    ('PROD_0031', 'Danish Táo Quế', 39000, 'Bánh Danish giòn thơm với táo nướng và quế', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.7, 0),
    ('PROD_0032', 'Bánh Chuối Óc Chó', 35000, 'Bánh chuối mềm ẩm, thêm óc chó rang bùi thơm', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.8, 0),
    ('PROD_0033', 'Muffin Việt Quất', 33000, 'Muffin nướng mềm với việt quất chua ngọt trong từng miếng', 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.8, 0),
    ('PROD_0034', 'Su Kem Vanilla', 28000, 'Vỏ su nhẹ xốp, nhân kem vanilla mát lạnh', 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.7, 0),
    ('PROD_0035', 'Tart Trứng Nướng', 32000, 'Đế tart bơ giòn với nhân trứng sữa nướng vàng', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.8, 0),
    ('PROD_0036', 'Brownie Chocolate', 36000, 'Brownie chocolate đậm vị, mềm ẩm với lớp vỏ nứt nhẹ', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', TRUE, 'CAT_0004', 4.9, 0)
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

-- 1. Dữ liệu bảng Khuyến mãi (promotions)
INSERT INTO promotions (id, voucher_code, description, discount_type, discount_value, start_date, end_date, usage_limit, used_count, is_active) 
VALUES
    ('PROM_0001', 'WELCOME20', 'Giảm 20% cho thành viên mới', 'PERCENTAGE', 20, '2026-01-01', '2026-12-31', 1000, 45, TRUE),
    ('PROM_0002', 'FREESHIP', 'Giảm 15k phí vận chuyển', 'FIXED_AMOUNT', 15000, '2026-11-01', '2026-11-30', 500, 120, TRUE),
    ('PROM_0003', 'BLACKFRIDAY', 'Giảm 50% tối đa 50k', 'PERCENTAGE', 50, '2026-11-20', '2026-11-30', 200, 0, TRUE),
    ('PROM_0004', 'GIAM30K', 'Giảm 30k cho đơn từ 100k', 'FIXED_AMOUNT', 30000, '2026-11-01', '2026-12-31', 300, 50, TRUE),
    ('PROM_0005', 'HAPPYHOUR', 'Giảm 10% khung giờ vàng', 'PERCENTAGE', 10, '2026-11-01', '2026-12-31', 1000, 200, TRUE)
ON CONFLICT (id) DO UPDATE SET 
    voucher_code = EXCLUDED.voucher_code, description = EXCLUDED.description, discount_type = EXCLUDED.discount_type, 
    discount_value = EXCLUDED.discount_value, is_active = EXCLUDED.is_active;

-- 2. Dữ liệu bảng Kho hàng (inventories)
INSERT INTO inventories (id) 
VALUES 
    ('INV_MAIN_BAR'), 
    ('INV_STORAGE'), 
    ('INV_FRIDGE_01'), 
    ('INV_FRIDGE_02'), 
    ('INV_DISPLAY')
ON CONFLICT (id) DO NOTHING;

-- 3. Dữ liệu bảng Nguyên liệu (ingredients)
INSERT INTO ingredients (id, name, unit, current_stock, min_alert_threshold, inventory_id) 
VALUES
    ('ING_0001', 'Hạt cà phê Arabica', 'kg', 50, 10.0, 'INV_MAIN_BAR'),
    ('ING_0002', 'Sữa tươi thanh trùng', 'lít', 100, 20.0, 'INV_FRIDGE_01'),
    ('ING_0003', 'Đường nước', 'lít', 30, 5.0, 'INV_MAIN_BAR'),
    ('ING_0004', 'Trà đen túi lọc', 'gói', 200, 50.0, 'INV_STORAGE'),
    ('ING_0005', 'Trân châu đen', 'kg', 20, 5.0, 'INV_MAIN_BAR'),
    ('ING_0006', 'Kem phô mai (Macchiato)', 'lít', 15, 3.0, 'INV_FRIDGE_02')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, current_stock = EXCLUDED.current_stock, min_alert_threshold = EXCLUDED.min_alert_threshold;

-- 4. Dữ liệu bảng Đơn hàng (orders) - Trỏ về CUST_DEMO
INSERT INTO orders (id, customer_id, total_amount, promotion_id, final_amount, status, created_at) 
VALUES
    ('ORD_0001', 'CUST_DEMO', 114000, NULL, 114000, 'COMPLETED', '2026-11-15 08:30:00'),
    ('ORD_0002', 'CUST_DEMO', 56000, 'PROM_0001', 44800, 'COMPLETED', '2026-11-16 09:15:00'),
    ('ORD_0003', 'CUST_DEMO', 165000, 'PROM_0004', 135000, 'COMPLETED', '2026-11-17 12:00:00'),
    ('ORD_0004', 'CUST_DEMO', 45000, NULL, 45000, 'PROCESSING', '2026-11-18 10:20:00'),
    ('ORD_0005', 'CUST_DEMO', 105000, 'PROM_0001', 84000, 'PENDING', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET 
    total_amount = EXCLUDED.total_amount, final_amount = EXCLUDED.final_amount, status = EXCLUDED.status;

-- 5. Dữ liệu bảng Chi tiết Đơn hàng (order_items)
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, note, size, sugar_percent, ice_percent) 
VALUES
    ('OI_0001', 'ORD_0001', 'PROD_0001', 1, 56000, 'Không đường', 'M', 0, 50),
    ('OI_0002', 'ORD_0001', 'PROD_0002', 1, 58000, 'Thêm đá', 'L', 100, 100),
    ('OI_0003', 'ORD_0002', 'PROD_0007', 1, 56000, 'Ít đá', 'M', 50, 30),
    ('OI_0004', 'ORD_0003', 'PROD_0004', 3, 45000, 'Nhiều trân châu', 'L', 100, 50),
    ('OI_0005', 'ORD_0004', 'PROD_0022', 1, 45000, NULL, 'M', 100, 100),
    ('OI_0006', 'ORD_0005', 'PROD_0016', 1, 49000, NULL, 'M', 50, 50)
ON CONFLICT (id) DO UPDATE SET 
    quantity = EXCLUDED.quantity, unit_price = EXCLUDED.unit_price, note = EXCLUDED.note;

-- 6. Dữ liệu bảng Lịch sử Thanh toán (payments)
INSERT INTO payments (id, order_id, total_amount, payment_method, payment_status, payment_date) 
VALUES
    ('PAY_0001', 'ORD_0001', 114000, 'CASH', 'PAID', '2026-11-15 08:32:00'),
    ('PAY_0002', 'ORD_0002', 44800, 'VN_PAY', 'PAID', '2026-11-16 09:16:00'),
    ('PAY_0003', 'ORD_0003', 135000, 'MOMO', 'PAID', '2026-11-17 12:01:00'),
    ('PAY_0004', 'ORD_0004', 45000, 'VN_PAY', 'PAID', '2026-11-18 10:21:00'),
    ('PAY_0005', 'ORD_0005', 84000, 'CASH', 'PENDING', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET 
    payment_status = EXCLUDED.payment_status, payment_method = EXCLUDED.payment_method;

-- 7. Dữ liệu bảng Lịch sử tích điểm (loyalty_transactions) - Trỏ về USER_DEMO_CUSTOMER
INSERT INTO loyalty_transactions (id, user_id, order_id, transaction_type, points, balanced_after, description, create_date) 
VALUES
    ('LOY_0001', 'USER_DEMO_CUSTOMER', 'ORD_0001', 'EARN', 11, 11, 'Tích điểm đơn hàng ORD_0001', '2026-11-15'),
    ('LOY_0002', 'USER_DEMO_CUSTOMER', 'ORD_0002', 'EARN', 4, 15, 'Tích điểm đơn hàng ORD_0002', '2026-11-16'),
    ('LOY_0003', 'USER_DEMO_CUSTOMER', 'ORD_0003', 'EARN', 13, 28, 'Tích điểm đơn hàng ORD_0003', '2026-11-17'),
    ('LOY_0004', 'USER_DEMO_CUSTOMER', 'ORD_0004', 'EARN', 4, 32, 'Tích điểm đơn hàng ORD_0004', '2026-11-18'),
    ('LOY_0005', 'USER_DEMO_CUSTOMER', NULL, 'REDEEM', -20, 12, 'Đổi ưu đãi giảm giá thành viên', '2026-11-18')
ON CONFLICT (id) DO UPDATE SET 
    points = EXCLUDED.points, balanced_after = EXCLUDED.balanced_after, description = EXCLUDED.description;
