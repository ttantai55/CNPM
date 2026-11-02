package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.Order;
import vn.doan.domain.Payment;
import vn.doan.domain.enums.PaymentMethod;
import vn.doan.domain.enums.PaymentStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {

    // 1. Tìm thông tin thanh toán theo đơn hàng (Mỗi đơn hàng liên kết với giao dịch thanh toán)
    Optional<Payment> findByOrder(Order order);

    // 2. Lấy danh sách giao dịch theo trạng thái thanh toán (ví dụ: tìm các giao dịch PENDING, SUCCESS...)
    List<Payment> findByPaymentStatus(PaymentStatus paymentStatus);

    // 3. Lọc danh sách thanh toán theo phương thức thanh toán (MOMO hoặc BANK_TRANSFER)
    List<Payment> findByPaymentMethod(PaymentMethod paymentMethod);

    // 4. Tìm các giao dịch thanh toán thành công trong một khoảng thời gian (dùng để chốt doanh thu)
    List<Payment> findByPaymentStatusAndPaymentDateBetween(
            PaymentStatus paymentStatus,
            LocalDateTime startDate,
            LocalDateTime endDate
    );
}