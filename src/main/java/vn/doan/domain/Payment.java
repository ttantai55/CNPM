package vn.doan.domain;

import jakarta.persistence.*;
import vn.doan.domain.enums.PaymentMethod;
import vn.doan.domain.enums.PaymentStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    private String id;

    // QUAN HỆ 1 - 1: Mỗi thanh toán ứng với 1 đơn hàng cụ thể
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(name = "total_amount", nullable = false)
    private long totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;

    @PrePersist
    private void assignId() {
        if (id == null) id = Ids.next("PAY");
    }

    // 1. Constructor không tham số 
    public Payment() {
        this.paymentStatus = PaymentStatus.PENDING;
        this.paymentDate = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }

    // 2. Constructor tạo mới nhanh
    public Payment(Order order, long totalAmount, PaymentMethod paymentMethod) {
    this.order = order;
    this.totalAmount = totalAmount;
    this.paymentMethod = paymentMethod;
    this.paymentStatus = PaymentStatus.PENDING;

    LocalDateTime now = LocalDateTime.now();
    this.paymentDate = now;
    this.createdAt = now;
}

    // 3. Constructor đầy đủ tham số 
    public Payment(String id, Order order, long totalAmount, PaymentMethod paymentMethod, PaymentStatus paymentStatus, LocalDateTime paymentDate) {
    this.id = id;
    this.order = order;
    this.totalAmount = totalAmount;
    this.paymentMethod = paymentMethod;
    this.paymentStatus = paymentStatus != null
            ? paymentStatus
            : PaymentStatus.PENDING;

    this.paymentDate = paymentDate != null
            ? paymentDate
            : LocalDateTime.now();

    this.createdAt = this.paymentDate;
}

    // --- GETTERS & SETTERS ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public long getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(long totalAmount) {
        this.totalAmount = totalAmount;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public LocalDateTime getCreatedAt() {
    return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
    }
}