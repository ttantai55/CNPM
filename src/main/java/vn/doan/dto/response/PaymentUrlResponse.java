package vn.doan.dto.response;

import java.time.LocalDateTime;

public class PaymentUrlResponse {
    private String orderId;
    private String paymentUrl;
    private LocalDateTime expiredAt;

    public PaymentUrlResponse() {}

    public PaymentUrlResponse(String orderId, String paymentUrl, LocalDateTime expiredAt) {
        this.orderId = orderId;
        this.paymentUrl = paymentUrl;
        this.expiredAt = expiredAt;
    }
//--- GETTER & SETTER ---
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public String getPaymentUrl() { return paymentUrl; }
    public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }
    public LocalDateTime getExpiredAt() { return expiredAt; }
    public void setExpiredAt(LocalDateTime expiredAt) { this.expiredAt = expiredAt; }
}
