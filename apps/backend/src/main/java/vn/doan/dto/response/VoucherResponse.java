package vn.doan.dto.response;

import java.time.LocalDateTime;

public class VoucherResponse {
    private String id;
    private String code;
    private long discountAmount;
    private long minOrderValue;
    private int quantity;
    private int usedCount; // Số lượng mã đã có người xài
    private LocalDateTime expiredAt;
    private boolean isActive; // True nếu còn hạn và còn số lượng

    public VoucherResponse() {}

    public VoucherResponse(String id, String code, long discountAmount, long minOrderValue, 
                           int quantity, int usedCount, LocalDateTime expiredAt, boolean isActive) {
        this.id = id;
        this.code = code;
        this.discountAmount = discountAmount;
        this.minOrderValue = minOrderValue;
        this.quantity = quantity;
        this.usedCount = usedCount;
        this.expiredAt = expiredAt;
        this.isActive = isActive;
    }

    // Chỉ có Getters, không có Setters
    public String getId() { return id; }
    public String getCode() { return code; }
    public long getDiscountAmount() { return discountAmount; }
    public long getMinOrderValue() { return minOrderValue; }
    public int getQuantity() { return quantity; }
    public int getUsedCount() { return usedCount; }
    public LocalDateTime getExpiredAt() { return expiredAt; }
    public boolean isActive() { return isActive; }
}