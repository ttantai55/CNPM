package vn.doan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.doan.domain.Invoices;
import vn.doan.domain.Order;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoicesRepository extends JpaRepository<Invoices, String> {

    // 1. Tìm kiếm hóa đơn theo mã số hóa đơn (invoiceNumber)
    Optional<Invoices> findByInvoiceNumber(String invoiceNumber);

    // 2. Tìm hóa đơn tương ứng với một đơn hàng cụ thể
    Optional<Invoices> findByOrder(Order order);

    // 3. Kiểm tra xem mã hóa đơn đã tồn tại trong hệ thống chưa (tránh trùng lặp)
    boolean existsByInvoiceNumber(String invoiceNumber);

    // 4. Lấy danh sách hóa đơn xuất trong một khoảng thời gian (dùng cho thống kê, báo cáo thuế/doanh thu)
    List<Invoices> findByIssuedDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // 5. Tìm danh sách hóa đơn theo tổng tiền đã thanh toán lớn hơn hoặc bằng một mức nào đó
    List<Invoices> findByTotalPaidGreaterThanEqual(long minTotalPaid);
}