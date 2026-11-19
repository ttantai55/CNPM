package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.doan.domain.Promotion;
import vn.doan.domain.enums.DiscountType;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, String> {

    // 1. Tìm voucher theo mã code chính xác (nghiệp vụ áp dụng mã giảm giá khi đặt hàng)
    Optional<Promotion> findByVoucherCode(String voucherCode);

    @Modifying
    @Query("UPDATE Promotion p SET p.usedCount = p.usedCount + 1 WHERE p.id = :id "
            + "AND p.isActive = true AND (COALESCE(p.usageLimit, 0) <= 0 OR p.usedCount < p.usageLimit) "
            + "AND (p.startDate IS NULL OR p.startDate <= :today) "
            + "AND (p.endDate IS NULL OR p.endDate >= :today)")
    int incrementUsageIfAvailable(@Param("id") String id, @Param("today") LocalDate today);

    // 2. Tìm tất cả các chương trình khuyến mãi đang ở trạng thái kích hoạt (isActive = true)
    List<Promotion> findByIsActiveTrue();

    // 3. Tìm các khuyến mãi đang còn hiệu lực theo thời gian hiện tại
    List<Promotion> findByIsActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            LocalDate currentDateForStart, 
            LocalDate currentDateForEnd
    );

    // 4. Tìm các chương trình khuyến mãi theo loại giảm giá (PERCENTAGE hoặc FIX_AMOUNT)
    List<Promotion> findByDiscountType(DiscountType discountType);
}