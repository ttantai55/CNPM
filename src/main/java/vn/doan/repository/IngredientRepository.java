package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.Ingredient;
import java.util.List;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, String> {

    // Tìm kiếm nguyên liệu theo tên (hỗ trợ tìm gần đúng)
    List<Ingredient> findByNameContainingIgnoreCase(String name);
}