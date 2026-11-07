package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.Category;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {

    // 1. Tìm danh mục theo tên chính xác
    Optional<Category> findByName(String name);

    // 2. Tìm danh mục gần đúng theo tên (Hỗ trợ tìm kiếm không phân biệt hoa thường)
    List<Category> findByNameContainingIgnoreCase(String name);

    boolean existsByName(String name);


}
