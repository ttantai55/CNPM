package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
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