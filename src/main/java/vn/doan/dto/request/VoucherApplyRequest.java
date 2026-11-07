package vn.doan.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class VoucherApplyRequest {

    @NotBlank(message = "Vui lòng nhập mã voucher")
    private String voucherCode;

    // Dùng kiểu Long (Wrapper) kèm @NotNull để tránh lỗi ép kiểu về 0 khi FE quên gửi
    @NotNull(message = "Tổng tiền giỏ hàng không được để trống")
    @Min(value = 0, message = "Tổng tiền giỏ hàng không hợp lệ")
    private Long cartTotalAmount;

    public VoucherApplyRequest() {}

    public VoucherApplyRequest(String voucherCode, Long cartTotalAmount) {
        this.voucherCode = voucherCode;
        this.cartTotalAmount = cartTotalAmount;
    }

    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }

    public Long getCartTotalAmount() { return cartTotalAmount; }
    public void setCartTotalAmount(Long cartTotalAmount) { this.cartTotalAmount = cartTotalAmount; }
}