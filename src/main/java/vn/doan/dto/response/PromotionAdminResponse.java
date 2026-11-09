package vn.doan.dto.response;

import vn.doan.domain.Promotion;
import java.time.LocalDate;

public class PromotionAdminResponse {
    private final String id;
    private final String voucherCode;
    private final String description;
    private final String discountType;
    private final long discountValue;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final long usageLimit;
    private final long usedCount;
    private final boolean isActive;

    public PromotionAdminResponse(Promotion promotion) {
        this.id = promotion.getId();
        this.voucherCode = promotion.getVoucherCode();
        this.description = promotion.getDescription();
        this.discountType = promotion.getDiscountType().name();
        this.discountValue = promotion.getDiscountValue();
        this.startDate = promotion.getStartDate();
        this.endDate = promotion.getEndDate();
        this.usageLimit = promotion.getUsageLimit();
        this.usedCount = promotion.getUsedCount();
        this.isActive = promotion.isActive();
    }

    public String getId() { return id; }
    public String getVoucherCode() { return voucherCode; }
    public String getDescription() { return description; }
    public String getDiscountType() { return discountType; }
    public long getDiscountValue() { return discountValue; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public long getUsageLimit() { return usageLimit; }
    public long getUsedCount() { return usedCount; }
    public boolean getIsActive() { return isActive; }
}