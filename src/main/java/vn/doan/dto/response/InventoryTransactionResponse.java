package vn.doan.dto.response;

import vn.doan.domain.enums.InventoryTransactionType;
import java.time.LocalDateTime;

public class InventoryTransactionResponse {
    private String id;
    private InventoryTransactionType type;
    private LocalDateTime createAt;
    private String note;
    private String baristaName; // Làm phẳng dữ liệu, chỉ lấy tên Barista
    private String ingredientId;
    private double quantity;
    private long price;

    public InventoryTransactionResponse() {}

    // Getters & Setters
    public String getId() { return id; }

    public InventoryTransactionType getType() { return type; }

    public LocalDateTime getCreateAt() { return createAt; }

    public String getNote() { return note; }

    public String getBaristaName() { return baristaName; }
    public String getIngredientId() { return ingredientId; }
    public double getQuantity() { return quantity; }
    public long getPrice() { return price; }
    public void setId(String id) { this.id = id; }
    public void setType(InventoryTransactionType type) { this.type = type; }
    public void setCreateAt(LocalDateTime createAt) { this.createAt = createAt; }
    public void setNote(String note) { this.note = note; }
    public void setBaristaName(String baristaName) { this.baristaName = baristaName; }
    public void setIngredientId(String ingredientId) { this.ingredientId = ingredientId; }
    public void setQuantity(double quantity) { this.quantity = quantity; }
    public void setPrice(long price) { this.price = price; }

}