package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.CartItem;
import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, String> {

    // Lấy danh sách các món hàng (CartItem) nằm trong một giỏ hàng (Cart) cụ thể
    List<CartItem> findByCartId(String cartId);
    
    // Tìm một món hàng cụ thể trong giỏ hàng dựa theo ID của Sản phẩm (hỗ trợ việc cộng dồn số lượng nếu khách chọn thêm món đã có)
    CartItem findByCartIdAndProductId(String cartId, String productId);
}