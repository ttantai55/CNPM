package vn.doan.domain.enums;

public enum LoyalType {
    EARN("Tích điểm"),
    REDEEM("Đổi điểm"),
    ADJUSTMENT("Điều chỉnh điểm"),
    EXPIRE("Hết hạn điểm");

    private final String description;

    LoyalType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}