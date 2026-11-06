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

    public InventoryTransactionType getType() { return type; }

    public LocalDateTime getCreateAt() { return createAt; }

    public String getNote() { return note; }

    public String getBaristaName() { return baristaName; }

}