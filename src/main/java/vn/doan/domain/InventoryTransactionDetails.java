package vn.doan.domain;

public class InventoryTransactionDetails {
    private String id;
    private double quantity;
    private long price;
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