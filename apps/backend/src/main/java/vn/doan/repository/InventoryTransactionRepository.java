package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.InventoryTransaction;
import vn.doan.domain.enums.InventoryTransactionType;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, String> {

    // Tìm lịch sử giao dịch theo loại (IMPORT, EXPORT, ADJUSTMENT)
    List<InventoryTransaction> findByType(InventoryTransactionType type);

    // Tìm lịch sử giao dịch do một nhân viên pha chế thực hiện
    List<InventoryTransaction> findByBaristaId(String baristaId);
}