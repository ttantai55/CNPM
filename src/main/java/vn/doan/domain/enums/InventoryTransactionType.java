package vn.doan.domain.enums;

public enum InventoryTransactionType {
    IMPORT("Nhập kho"),
    EXPORT("Xuất kho"),
    ADJUSTMENT("Điều chỉnh kho");

    private final String description;

    InventoryTransactionType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}