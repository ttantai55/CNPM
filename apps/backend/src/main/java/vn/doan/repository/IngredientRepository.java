package vn.doan.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.doan.domain.Ingredient;
import java.util.List;
import java.util.Optional;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Ingredient i where i.id = :id")
    Optional<Ingredient> findByIdForUpdate(@Param("id") String id);

    // Tìm kiếm nguyên liệu theo tên (hỗ trợ tìm gần đúng)
    List<Ingredient> findByNameContainingIgnoreCase(String name);

@Query("SELECT i FROM Ingredient i WHERE i.currentStock <= i.minAlertThreshold")
List<Ingredient> findLowStockIngredients();
}