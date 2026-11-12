package vn.doan.dto.request;

import vn.doan.domain.enums.DiscountType;
import java.time.LocalDate;

public class PromotionAdminRequest {
    private String voucherCode;
    private String description;
    private DiscountType discountType;
    private Long discountValue;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long usageLimit;
    private Long usedCount;
    private Boolean isActive;

    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public DiscountType getDiscountType() { return discountType; }
    public void setDiscountType(DiscountType discountType) { this.discountType = discountType; }
    public Long getDiscountValue() { return discountValue; }
    public void setDiscountValue(Long discountValue) { this.discountValue = discountValue; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public Long getUsageLimit() { return usageLimit; }
    public void setUsageLimit(Long usageLimit) { this.usageLimit = usageLimit; }
    public Long getUsedCount() { return usedCount; }
    public void setUsedCount(Long usedCount) { this.usedCount = usedCount; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}
