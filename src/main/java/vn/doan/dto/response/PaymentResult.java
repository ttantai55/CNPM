package vn.doan.dto.response;

import vn.doan.domain.enums.PaymentStatus;

public class PaymentResult {
    private PaymentStatus status;
    private String message;
    private String orderId;

    public PaymentResult() {}

    public PaymentResult(PaymentStatus status, String message, String orderId) {
        this.status = status;
        this.message = message;
        this.orderId = orderId;
    }

    public PaymentStatus getStatus() { return status; }
    
    public String getMessage() { return message; }
    
    public String getOrderId() { return orderId; }
}
