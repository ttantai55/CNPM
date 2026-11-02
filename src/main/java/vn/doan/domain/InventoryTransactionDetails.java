package vn.doan.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory_transaction_details")
public class InventoryTransactionDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private double quantity;

    @Column(nullable = false)
    private long price;

    // Quan hệ Nhiều - 1: Nhiều chi tiết giao dịch kho liên quan đến 1 Nguyên liệu (Ingredient)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;
    
    public InventoryTransactionDetails() {
    }

    public InventoryTransactionDetails(String id, double quantity, long price, Ingredient ingredient) {
        this.id = id;
        this.quantity = quantity;
        this.price = price;
        this.ingredient = ingredient;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public double getQuantity() {
        return quantity;
    }

    public void setQuantity(double quantity) {
        this.quantity = quantity;
    }

    public long getPrice() {
        return price;
    }

    public void setPrice(long price) {
        this.price = price;
    }

    public Ingredient getIngredient() {
        return ingredient;
    }

    public void setIngredient(Ingredient ingredient) {
        this.ingredient = ingredient;
    }
}