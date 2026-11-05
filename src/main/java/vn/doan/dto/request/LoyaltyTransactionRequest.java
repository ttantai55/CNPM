package vn.doan.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class LoyaltyTransactionRequest {

    @NotBlank(message = "ID Người dùng không được để trống")
    private String userId;

    // orderId có thể null (ví dụ: Admin tặng điểm sinh nhật không liên quan đến đơn hàng nào)
    private String orderId;

    @NotBlank(message = "Loại giao dịch không được để trống")
    private String transactionType; // Tương ứng với Enum LoyalType (ví dụ: "EARN", "REDEEM")

    @Min(value = 1, message = "Số điểm giao dịch phải lớn hơn 0")
    private int points;

    private String description;

    public LoyaltyTransactionRequest() {
    }

    public LoyaltyTransactionRequest(String userId, String orderId, String transactionType, int points, String description) {
        this.userId = userId;
        this.orderId = orderId;
        this.transactionType = transactionType;
        this.points = points;
        this.description = description;
    }

    // --- GETTERS & SETTERS ---
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}