
package vn.doan.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public class PaymentCallbackDTO {

    @NotBlank(message = "ID đơn hàng không được để trống")
    private String orderId;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;

    @Positive(message = "Số tiền thanh toán phải lớn hơn 0")
    private long amount;

    @NotBlank(message = "Mã kết quả thanh toán không được để trống")
    private String responseCode;

    private String transactionId;
    private LocalDateTime paymentDate;

    public PaymentCallbackDTO() {}

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public long getAmount() { return amount; }
    public void setAmount(long amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getResponseCode() { return responseCode; }
    public void setResponseCode(String responseCode) {
        this.responseCode = responseCode;
    }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }
}
