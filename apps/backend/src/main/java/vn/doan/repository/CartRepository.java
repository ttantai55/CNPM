package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.Cart;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, String> {

    // Tìm giỏ hàng dựa trên ID của User sở hữu
    Optional<Cart> findByUserId(String userId);
}