package vn.doan.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class PaymentCreateRequest {

    @NotBlank(message = "ID Đơn hàng không được để trống")
    private String orderId;

    @Min(value = 0, message = "Số tiền thanh toán không được âm")
    private long totalAmount;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;

    public PaymentCreateRequest() {
    }

    public PaymentCreateRequest(String orderId, long totalAmount, String paymentMethod) {
        this.orderId = orderId;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public long getTotalAmount() { return totalAmount; }
    public void setTotalAmount(long totalAmount) { this.totalAmount = totalAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
