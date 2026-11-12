package vn.doan.domain;

import jakarta.persistence.*;
import vn.doan.domain.enums.DiscountType;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "promotions")
public class Promotion {

    @Id
    private String id;

    @Column(name = "voucher_code", nullable = false, unique = true, length = 50)
    private String voucherCode;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false)
    private long discountValue;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "usage_limit")
    private long usageLimit;

    @Column(name = "used_count")
    private long usedCount;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    // QUAN HỆ 1 - NHIỀU: 1 Voucher khuyến mãi có thể được áp dụng ở nhiều Order
    @OneToMany(mappedBy = "discount")
    private List<Order> orders = new ArrayList<>();

    @PrePersist
    private void assignId() {
        if (id == null) id = Ids.next("PROMO");
    }

    // 1. Constructor không tham số 
    public Promotion() {
    }

    // 2. Constructor tạo mới nhanh
    public Promotion(String voucherCode, String description, DiscountType discountType,
                     long discountValue, LocalDate startDate, LocalDate endDate, long usageLimit) {
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

    // 3. Constructor đầy đủ tham số 
    public Promotion(String id, String voucherCode, String description, DiscountType discountType,
                     long discountValue, LocalDate startDate, LocalDate endDate, long usageLimit,
                     long usedCount, boolean isActive) {
        this.id = id;
        this.voucherCode = voucherCode;
        this.description = description;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.startDate = startDate;
        this.endDate = endDate;
        this.usageLimit = usageLimit;
        this.usedCount = usedCount;
        this.isActive = isActive;
    }

    public boolean isValid() {
        LocalDate today = LocalDate.now();
        boolean withinDateRange = (startDate == null || !today.isBefore(startDate))
                                && (endDate == null || !today.isAfter(endDate));
        boolean withinLimit = usageLimit <= 0 || usedCount < usageLimit;
        return isActive && withinDateRange && withinLimit;
    }

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

    // --- GETTERS & SETTERS ---

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

    public List<Order> getOrders() {
        return orders;
    }

    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }
}