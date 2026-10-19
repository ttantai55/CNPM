package vn.doan.domain;

import java.time.LocalDateTime;

import vn.doan.domain.enums.PaymentMethod;
import vn.doan.domain.enums.PaymentStatus;

public class Payment {

    private String id;
    private String orderId;
    private long totalAmount;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private LocalDateTime paymentDate;
    
    public Payment() {
    }

    public Payment(String id, String orderId, long totalAmount, PaymentMethod paymentMethod, PaymentStatus paymentStatus,
            LocalDateTime paymentDate) {
        this.id = id;
        this.orderId = orderId;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.paymentDate = paymentDate;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public long getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(long totalAmount) {
        if (totalAmount < 0) {
            throw new IllegalArgumentException("Số tiền thanh toán không được âm");
        }
        this.totalAmount = totalAmount;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        if (paymentMethod == null) {
            throw new IllegalArgumentException("Phương thức thanh toán không được để trống");
        }
        this.paymentMethod = paymentMethod;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    // Alias getter để khớp với InvoiceService khi gọi p.getStatus()
    public PaymentStatus getStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        if (paymentStatus == null) {
            throw new IllegalArgumentException("Trạng thái thanh toán không được để trống");
        }
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }
        
    public boolean isPending() {
        return this.paymentStatus == PaymentStatus.PENDING;
    }

    public boolean isPaid() {
        return this.paymentStatus == PaymentStatus.SUCCESS;
    }

    public void markPaid(LocalDateTime paidAt) {
        if (paidAt == null) {
            throw new IllegalArgumentException("Thời gian thanh toán không được để trống");
        }

        if (!isPending()) {
            throw new IllegalStateException("Giao dịch không còn ở trạng thái chờ");
        }

        this.paymentStatus = PaymentStatus.SUCCESS;
        this.paymentDate = paidAt;
    }

    public void markFailed() {
        if (!isPending()) {
            throw new IllegalStateException("Giao dịch không còn ở trạng thái chờ");
        }

        this.paymentStatus = PaymentStatus.FAILED;
    }

    public void validate() {
        requireText(id, "Mã thanh toán không được để trống");
        requireText(orderId, "Mã đơn hàng không được để trống");
        if (totalAmount < 0) {
            throw new IllegalStateException("Số tiền thanh toán không được âm");
        }
        if (paymentMethod == null) {
            throw new IllegalStateException("Phương thức thanh toán không hợp lệ: " + paymentMethod);
        }
        if (paymentStatus == null) {
            throw new IllegalStateException("Trạng thái thanh toán không hợp lệ: " + paymentStatus);
        }
        if (paymentStatus == PaymentStatus.SUCCESS && paymentDate == null) {
            throw new IllegalStateException("Thanh toán thành công phải có thời gian thanh toán");
        }
    }

    private static void requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(message);
        }
    }
}