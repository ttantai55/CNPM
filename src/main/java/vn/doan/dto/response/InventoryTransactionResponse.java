package vn.doan.dto.response;

import vn.doan.domain.enums.InventoryTransactionType;
import java.time.LocalDateTime;

public class InventoryTransactionResponse {
    private String id;
    private InventoryTransactionType type;
    private LocalDateTime createAt;
    private String note;
    private String baristaName; // Làm phẳng dữ liệu, chỉ lấy tên Barista

    public InventoryTransactionResponse() {}

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public InventoryTransactionType getType() { return type; }
    public void setType(InventoryTransactionType type) { this.type = type; }
    public LocalDateTime getCreateAt() { return createAt; }
    public void setCreateAt(LocalDateTime createAt) { this.createAt = createAt; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getBaristaName() { return baristaName; }
    public void setBaristaName(String baristaName) { this.baristaName = baristaName; }
}