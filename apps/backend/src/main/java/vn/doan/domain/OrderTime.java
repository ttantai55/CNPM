package vn.doan.domain;

import java.time.LocalDateTime;
import java.time.ZoneId;

final class OrderTime {
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private OrderTime() {
    }

    static LocalDateTime now() {
        return LocalDateTime.now(VIETNAM_ZONE);
    }
}
