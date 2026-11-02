package vn.doan.domain.enums;

public enum UnitType {
    PACK("Gói/Bịch"),
    CAN("Lon"),
    BOX("Hộp/Thùng"),
    PIECE("Cái/Chiếc");

    private final String description;

    UnitType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}