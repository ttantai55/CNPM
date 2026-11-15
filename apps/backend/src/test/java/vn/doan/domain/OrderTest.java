package vn.doan.domain;

import org.junit.jupiter.api.Test;
import vn.doan.domain.enums.OrderStatus;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class OrderTest {

    @Test
    void recordsPreparationAndCompletionTimesOnStatusChanges() {
        Order order = new Order();
        order.changeStatus(OrderStatus.CONFIRMED);
        assertNotNull(order.getPaidAt());
        assertNull(order.getPreparedAt());
        assertNull(order.getCompletedAt());

        LocalDateTime beforePreparation = OrderTime.now().minusSeconds(1);
        order.changeStatus(OrderStatus.PREPARING);
        assertNotNull(order.getPreparedAt());
        assertFalse(order.getPreparedAt().isBefore(beforePreparation));
        assertNull(order.getCompletedAt());

        LocalDateTime preparedAt = order.getPreparedAt();
        order.changeStatus(OrderStatus.COMPLETED);
        assertNotNull(order.getCompletedAt());
        assertFalse(order.getCompletedAt().isBefore(preparedAt));
    }
}
