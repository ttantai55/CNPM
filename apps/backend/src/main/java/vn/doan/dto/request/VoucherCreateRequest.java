package vn.doan.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class VoucherCreateRequest {

    @NotBlank(message = "Mã voucher không được để trống")
    private String code; // Ví dụ: "NOEL50K"

    @NotNull(message = "Số tiền giảm không được để trống")
    @Min(value = 1000, message = "Số tiền giảm tối thiểu là 1000đ")
    private Long discountAmount;

    @NotNull(message = "Điều kiện hóa đơn tối thiểu không được để trống")
    @Min(value = 0, message = "Giá trị tối thiểu không hợp lệ")
    private Long minOrderValue;

    @NotNull(message = "Số lượng mã không được để trống")
    @Min(value = 1, message = "Số lượng mã phải từ 1 trở lên")
    private Integer quantity;

    @NotNull(message = "Ngày hết hạn không được để trống")
    @Future(message = "Ngày hết hạn phải ở tương lai")
    private LocalDateTime expiredAt;

    public VoucherCreateRequest() {}

    // Các hàm Getters và Setters ông tự Generate ra nhé (để rút gọn code chat)
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public Long getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Long discountAmount) { this.discountAmount = discountAmount; }
    public Long getMinOrderValue() { return minOrderValue; }
    public void setMinOrderValue(Long minOrderValue) { this.minOrderValue = minOrderValue; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public LocalDateTime getExpiredAt() { return expiredAt; }
    public void setExpiredAt(LocalDateTime expiredAt) { this.expiredAt = expiredAt; }
}