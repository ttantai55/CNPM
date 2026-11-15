package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.doan.domain.Product;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {

    // 1. Tìm các sản phẩm đang mở bán (status = true)
    List<Product> findByStatusTrue();

    // 2. Tìm sản phẩm theo tên (hỗ trợ tìm kiếm gần đúng, không phân biệt hoa thường)
    List<Product> findByNameContainingIgnoreCase(String name);

    // 3. Tìm tất cả sản phẩm thuộc một Category cụ thể
    List<Product> findByCategoryId(String categoryId);

    @Modifying
    @Query("UPDATE Product p SET p.weeklySalesCount = p.weeklySalesCount + :quantity WHERE p.id = :productId")
    int incrementWeeklySalesCount(@Param("productId") String productId, @Param("quantity") int quantity);

    @Modifying
    @Query("UPDATE Product p SET p.weeklySalesCount = 0")
    int resetWeeklySalesCount();
}