package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.LoyaltyTransaction;
import vn.doan.domain.enums.LoyalType;
import java.util.List;

@Repository
public interface LoyaltyTransactionRepo extends JpaRepository<LoyaltyTransaction, String> {

    // 1. Lấy toàn bộ lịch sử giao dịch điểm của 1 User cụ thể
    List<LoyaltyTransaction> findByUserId(String userId);

    // 2. Lấy danh sách giao dịch theo loại (Ví dụ: xem tất cả các giao dịch REDEEM - đổi thưởng)
    List<LoyaltyTransaction> findByTransactionType(LoyalType transactionType);

    // 3. Lấy lịch sử giao dịch gắn với một đơn hàng cụ thể
    List<LoyaltyTransaction> findByOrderId(String orderId);
}