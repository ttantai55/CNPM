package vn.doan.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class OrderCreateRequest {

    // ID của Customer đặt hàng 
    private String customerId;

    // Mã Voucher giảm giá (Nếu có)
    private String voucherCode;

    // Danh sách các món hàng (Bắt buộc phải có ít nhất 1 món)
    @NotEmpty(message = "Đơn hàng phải có ít nhất 1 sản phẩm")
    @Valid // Kích hoạt validate bên trong OrderItemRequest
    private List<OrderItemRequest> items;

    // Thông tin thanh toán cơ bản
    private String paymentMethod;

    public OrderCreateRequest() {
    }

    public OrderCreateRequest(String customerId, String voucherCode, List<OrderItemRequest> items, String paymentMethod) {
        this.customerId = customerId;
        this.voucherCode = voucherCode;
        this.items = items;
        this.paymentMethod = paymentMethod;
    }

    // --- GETTERS & SETTERS ---
    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getVoucherCode() {
        return voucherCode;
    }

    public void setVoucherCode(String voucherCode) {
        this.voucherCode = voucherCode;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}