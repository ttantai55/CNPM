package vn.doan.domain;

import java.time.LocalDate;

import vn.doan.domain.enums.DiscountType;

public class Promotion {
    private String id;
    private String voucherCode;
    private String description;
    private DiscountType discountType;
    private long discountValue;
    private LocalDate startDate;
    private LocalDate endDate;
    private long usageLimit;
    private long usedCount;
    private boolean isActive;

    public Promotion() {
    }

    public Promotion(String id, String voucherCode, String description, DiscountType discountType,
                     long discountValue, LocalDate startDate, LocalDate endDate, long usageLimit) {
        this.id = id;
        this.voucherCode = voucherCode;
        this.description = description;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.startDate = startDate;
        this.endDate = endDate;
        this.usageLimit = usageLimit;
        this.usedCount = 0;
        this.isActive = true;
    }

    /**
     * Kiểm tra điều kiện hiệu lực của khuyến mãi
     */
    public boolean isValid() {
        LocalDate today = LocalDate.now();
        boolean withinDateRange = (startDate == null || !today.isBefore(startDate))
                                && (endDate == null || !today.isAfter(endDate));
        boolean withinLimit = usageLimit <= 0 || usedCount < usageLimit;
        return isActive && withinDateRange && withinLimit;
    }

    /**
     * Tính toán số tiền được giảm giá dựa trên tổng tiền ban đầu
     */
    public long calculateDiscount(long totalAmount) {
        if (!isValid() || totalAmount <= 0) {
            return 0;
        }

        if (discountType == DiscountType.PERCENTAGE) {
            return Math.min(totalAmount, (totalAmount * discountValue) / 100);
        } else if (discountType == DiscountType.FIX_AMOUNT) {
            return Math.min(totalAmount, discountValue);
        }
        return 0;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getVoucherCode() {
        return voucherCode;
    }

    public void setVoucherCode(String voucherCode) {
        this.voucherCode = voucherCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public long getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(long discountValue) {
        this.discountValue = discountValue;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public long getUsageLimit() {
        return usageLimit;
    }

    public void setUsageLimit(long usageLimit) {
        this.usageLimit = usageLimit;
    }

    public long getUsedCount() {
        return usedCount;
    }

    public void setUsedCount(long usedCount) {
        this.usedCount = usedCount;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }
}