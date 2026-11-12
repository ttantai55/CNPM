package vn.doan.domain.enums;

import java.util.EnumSet;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PREPARING,
    COMPLETED,
    CANCELLED;
    public boolean canTransitionTo(OrderStatus next) {
        if (next == null) {
            return false;
        }

        return switch (this) {
            case PENDING -> EnumSet.of(CONFIRMED, CANCELLED).contains(next);
            case CONFIRMED -> EnumSet.of(PREPARING, CANCELLED).contains(next);
            case PREPARING -> next == COMPLETED;
            case COMPLETED, CANCELLED -> false;
        };
}
}