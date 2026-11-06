package vn.doan.domain.enums;

import java.util.EnumSet;

public enum OrderStatus {
    PENDING,
    CONFIRM,
    PREPARING,
    READY,
 
    COMPLETED,
    CANCELED;
    public boolean canTransitionTo(OrderStatus next) {
        if (next == null) {
            return false;
        }

        return switch (this) {
            case PENDING -> EnumSet.of(CONFIRM, CANCELED).contains(next);
            case CONFIRM -> EnumSet.of(PREPARING, CANCELED).contains(next);
            case PREPARING -> EnumSet.of(READY).contains(next);
            case READY -> EnumSet.of(COMPLETED).contains(next);
            case COMPLETED, CANCELED -> false;
        };
}
}