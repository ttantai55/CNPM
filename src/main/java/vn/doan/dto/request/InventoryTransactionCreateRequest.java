package vn.doan.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import vn.doan.domain.enums.InventoryTransactionType;

public class InventoryTransactionCreateRequest {

    @NotNull(message = "Loại giao dịch không được để trống")
    private InventoryTransactionType type;

    private String note;

    @NotBlank(message = "Mã nhân viên (Barista) không được để trống")
    private String baristaId;

    public InventoryTransactionCreateRequest() {}

    // Getters & Setters
    public InventoryTransactionType getType() { return type; }
    public void setType(InventoryTransactionType type) { this.type = type; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getBaristaId() { return baristaId; }
    public void setBaristaId(String baristaId) { this.baristaId = baristaId; }
}