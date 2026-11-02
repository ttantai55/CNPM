package vn.doan.domain.enums;

public enum PaymentMethod {
    MOMO("Ví điện tử MoMo"),
    BANK_TRANSFER("Chuyển khoản ngân hàng");

    private final String description;

    PaymentMethod(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}