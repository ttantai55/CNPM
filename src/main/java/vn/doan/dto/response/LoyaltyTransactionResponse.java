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

    public String getUserId() {
        return userId;
    }

    public String getOrderId() {
        return orderId;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public int getPoints() {
        return points;
    }

    public int getBalancedAfter() {
        return balancedAfter;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getCreateDate() {
        return createDate;
    }
}