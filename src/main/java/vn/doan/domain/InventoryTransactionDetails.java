package vn.doan.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory_transaction_details")
public class InventoryTransactionDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // QUAN HỆ 1 - 1: Thuộc về một phiếu giao dịch kho cụ thể
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false, unique = true)
    private InventoryTransaction inventoryTransaction;

    // QUAN HỆ NHIỀU - 1: Chi tiết giao dịch gắn với một nguyên liệu cụ thể
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(nullable = false)
    private double quantity;

    @Column(nullable = false)
    private long price;

    // BẮT BUỘC CHO JPA: Constructor không tham số
    public InventoryTransactionDetails() {
    }

    public InventoryTransactionDetails(InventoryTransaction inventoryTransaction, Ingredient ingredient, double quantity, long price) {
        this.inventoryTransaction = inventoryTransaction;
        this.ingredient = ingredient;
        this.quantity = quantity;
        this.price = price;
    }

    public InventoryTransactionDetails(String id, InventoryTransaction inventoryTransaction, Ingredient ingredient, double quantity, long price) {
        this.id = id;
        this.inventoryTransaction = inventoryTransaction;
        this.ingredient = ingredient;
        this.quantity = quantity;
        this.price = price;
    }

    // --- GETTERS & SETTERS ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public InventoryTransaction getInventoryTransaction() {
        return inventoryTransaction;
    }

    public void setInventoryTransaction(InventoryTransaction inventoryTransaction) {
        this.inventoryTransaction = inventoryTransaction;
    }

    public Ingredient getIngredient() {
        return ingredient;
    }

    public void setIngredient(Ingredient ingredient) {
        this.ingredient = ingredient;
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
}