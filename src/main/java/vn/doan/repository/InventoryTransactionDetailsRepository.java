package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.InventoryTransactionDetails;
import java.util.List;

@Repository
public interface InventoryTransactionDetailsRepository extends JpaRepository<InventoryTransactionDetails, String> {

    // Lấy danh sách chi tiết giao dịch theo mã nguyên liệu
    List<InventoryTransactionDetails> findByIngredientId(String ingredientId);
}