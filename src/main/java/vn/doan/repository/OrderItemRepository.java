package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.Order;
import vn.doan.domain.OrderItem;
import vn.doan.domain.Product;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, String> {

    // 1. Lấy toàn bộ danh sách các món thuộc về một đơn hàng cụ thể
    List<OrderItem> findByOrder(Order order);

    // 2. Tìm các OrderItem liên quan đến một sản phẩm cụ thể (hữu ích cho thống kê sản phẩm đã bán)
    List<OrderItem> findByProduct(Product product);

    // 3. Xóa tất cả các item thuộc về một đơn hàng
    void deleteByOrder(Order order);
}