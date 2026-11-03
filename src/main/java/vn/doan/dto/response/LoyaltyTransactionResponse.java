package vn.doan.dto.response;

import java.time.LocalDate;

public class LoyaltyTransactionResponse {

    private String id;
    
    // Các trường làm phẳng
    private String userId;
    private String orderId;

    private String transactionType; // Trả về dạng String từ Enum LoyalType
    private int points;
    private int balancedAfter; // Số dư sau biến động
    private String description;
    private LocalDate createDate;

    public LoyaltyTransactionResponse() {
    }

    public LoyaltyTransactionResponse(String id, String userId, String orderId, String transactionType, 
                                      int points, int balancedAfter, String description, LocalDate createDate) {
        this.id = id;
        this.userId = userId;
        this.orderId = orderId;
        this.transactionType = transactionType;
        this.points = points;
        this.balancedAfter = balancedAfter;
        this.description = description;
        this.createDate = createDate;
    }

    // --- GETTERS & SETTERS ---
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public int getBalancedAfter() {
        return balancedAfter;
    }

    public void setBalancedAfter(int balancedAfter) {
        this.balancedAfter = balancedAfter;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDate createDate) {
        this.createDate = createDate;
    }
}