package vn.doan.domain;

import java.time.LocalDate;

import vn.doan.domain.enums.LoyalType;

public class LoyaltyTransaction {
    private String id;
    private User user;
    private Order order;
    private LoyalType transactionType;
    private int points;
    private int balancedAfter;
    private String description;
    private LocalDate createDate;

    // Constructor rỗng (Mặc định)
    public LoyaltyTransaction() {
    }

    // Constructor đầy đủ tham số
    public LoyaltyTransaction(String id, User user, Order order, LoyalType transactionType, int points, int balancedAfter, String description, LocalDate createDate) {
        this.id = id;
        this.user = user;
        this.order = order;
        this.transactionType = transactionType;
        this.points = points;
        this.balancedAfter = balancedAfter;
        this.description = description;
        this.createDate = createDate;
    }

    // --- GETTER & SETTER ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public LoyalType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(LoyalType transactionType) {
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