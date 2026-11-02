package vn.doan.domain.enums;

import java.util.Set;

public enum OrderStatus {
    PENDING,
    CONFIRM,
    PREPARING,
    READY,
    COMPLETED,
    CANCELED;

    private final String description;

    OrderStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Định nghĩa các trạng thái hợp lệ tiếp theo có thể chuyển đến
     */
    public Set<OrderStatus> nextValidStatuses() {
        return switch (this) {
            case PENDING -> Set.of(CONFIRM, CANCELED);
            case CONFIRM -> Set.of(PREPARING, CANCELED);
            case PREPARING -> Set.of(READY, CANCELED);
            case READY -> Set.of(COMPLETED, CANCELED);
            case COMPLETED, CANCELED -> Set.of(); // Trạng thái kết thúc
        };
    }

    /**
     * Kiểm tra tính hợp lệ của việc chuyển đổi trạng thái
     */
    public boolean canTransitionTo(OrderStatus nextStatus) {
        return nextValidStatuses().contains(nextStatus);
    }
}