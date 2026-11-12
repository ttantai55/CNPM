package vn.doan.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public class InvoiceCreateRequest {

    @NotBlank(message = "ID Đơn hàng không được để trống")
    private String orderId;

    @NotBlank(message = "ID Nhân viên thu ngân (Barista) không được để trống")
    private String baristaId;

    // Tùy chọn: Khách đưa bao nhiêu tiền (nếu là tiền mặt) để in ra dòng "Tiền thối lại"
    @NotNull(message = "Số tiền khách đưa không được để trống")
    @Min(value = 0, message = "Số tiền khách đưa không hợp lệ")
    private Long amountTendered; 

    public InvoiceCreateRequest() {}

    public InvoiceCreateRequest(String orderId, String baristaId, Long amountTendered) {
        this.orderId = orderId;
        this.baristaId = baristaId;
        this.amountTendered = amountTendered;
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getBaristaId() { return baristaId; }
    public void setBaristaId(String baristaId) { this.baristaId = baristaId; }

    public Long getAmountTendered() { return amountTendered; }
    public void setAmountTendered(Long amountTendered) { this.amountTendered = amountTendered; }
}