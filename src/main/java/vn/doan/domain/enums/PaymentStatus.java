package vn.doan.domain.enums;

public enum PaymentStatus {
    PENDING("Chờ thanh toán"),
    SUCCESS("Thanh toán thành công"),
    FAILED("Thanh toán thất bại"),
    CANCELLED("Hủy thanh toán");

    private final String description;

    PaymentStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}