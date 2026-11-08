package vn.doan.dto.response;

import java.time.LocalDateTime;

public class PaymentResponse {

    private String id;
    private String orderId;
    private long totalAmount;
    private String paymentMethod; 
    private String paymentStatus; 
    private LocalDateTime paymentDate;

    public PaymentResponse() {
    }

    public PaymentResponse(String id, String orderId, long totalAmount, 
                           String paymentMethod, String paymentStatus, LocalDateTime paymentDate) {
        this.id = id;
        this.orderId = orderId;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.paymentDate = paymentDate;
    }

    // --- GETTERS & SETTERS ---

    public String getId() {
        return id;
    }

    public String getOrderId() {
        return orderId;
    }

    public long getTotalAmount() {
        return totalAmount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }
}