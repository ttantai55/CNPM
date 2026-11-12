package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.OrderItemTopping;
import java.util.List;

@Repository
public interface OrderItemToppingRepository extends JpaRepository<OrderItemTopping, String> {

    // Lấy danh sách các topping đi kèm của một dòng chi tiết đơn hàng
    List<OrderItemTopping> findByOrderItemId(String orderItemId);
}