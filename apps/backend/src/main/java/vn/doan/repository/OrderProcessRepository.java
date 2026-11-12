package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.Order;
import vn.doan.domain.OrderProcess;
import vn.doan.domain.enums.OrderStatus;

import java.util.List;

@Repository
public interface OrderProcessRepository extends JpaRepository<OrderProcess, String> {

    // 1. Lấy toàn bộ lịch sử tiến trình của một đơn hàng, sắp xếp theo thời gian cập nhật tăng dần
    List<OrderProcess> findByOrderOrderByUpdateAtAsc(Order order);

    // 2. Tìm tất cả các tiến trình theo một trạng thái cụ thể
    List<OrderProcess> findByStatus(OrderStatus status);

    // 3. Tìm tiến trình theo Order và Status cụ thể
    List<OrderProcess> findByOrderAndStatus(Order order, OrderStatus status);
}