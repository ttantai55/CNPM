package vn.doan.domain;

import jakarta.persistence.*;

import java.time.LocalDate;

import vn.doan.domain.enums.LoyalType;

@Entity
@Table(name = "loyalty_transactions")

public class LoyaltyTransaction {
    @Id
    private String id;

    @PrePersist
    private void assignId() { if (id == null) id = Ids.next("LOYAL"); }

    // Quan hệ Nhiều - 1: Nhiều giao dịch điểm thuộc về 1 User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

// Quan hệ Nhiều - 1: Nhiều giao dịch có thể liên quan tới 1 Order cụ thể
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private LoyalType transactionType;

    @Column(nullable = false)
    private int points;

    @Column(name = "balanced_after", nullable = false)
    private int balancedAfter;

    private String description;

    @Column(name = "create_date")
    private LocalDate createDate;

    public LoyaltyTransaction() {
        this.createDate = LocalDate.now();
    }

    public LoyaltyTransaction(User user, Order order, LoyalType transactionType, int points, int balancedAfter, String description) {
        this.user = user;
        this.order = order;
        this.transactionType = transactionType;
        this.points = points;
        this.balancedAfter = balancedAfter;
        this.description = description;
        this.createDate = LocalDate.now();
    }

    public LoyaltyTransaction(String id, User user, Order order, LoyalType transactionType, int points, int balancedAfter, String description) {
        this.id = id;
        this.user = user;
        this.order = order;
        this.transactionType = transactionType;
        this.points = points;
        this.balancedAfter = balancedAfter;
        this.description = description;
        this.createDate = LocalDate.now();
    }

    // Getters and Setters
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