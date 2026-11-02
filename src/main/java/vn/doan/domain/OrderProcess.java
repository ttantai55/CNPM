package vn.doan.domain;

import java.time.LocalDateTime;

import vn.doan.domain.enums.OrderStatus;

public class OrderProcess {
    private String id;
    private Order order;
    private OrderStatus status;
    private LocalDateTime updateAt;

    public OrderProcess() {
    }

    public OrderProcess(String id, Order order, OrderStatus status) {
        this.id = id;
        this.order = order;
        this.status = status;
        this.updateAt = LocalDateTime.now();
    }

    public OrderProcess(String id, Order order, OrderStatus status, LocalDateTime updateAt) {
        this.id = id;
        this.order = order;
        this.status = status;
        this.updateAt = updateAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public LocalDateTime getUpdateAt() {
        return updateAt;
    }

    public void setUpdateAt(LocalDateTime updateAt) {
        this.updateAt = updateAt;
    }
}