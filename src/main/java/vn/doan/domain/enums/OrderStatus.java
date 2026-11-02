package vn.doan.domain.enums;

public enum OrderStatus {
    PENDING,    // Chờ xử lý / Chờ thanh toán
    SHIPPING,   // Đang giao hàng (với whey, phụ kiện)
    COMPLETED,  // Giao dịch thành công
    CANCELLED,   // Đã huỷ
    CONFIRMED
}