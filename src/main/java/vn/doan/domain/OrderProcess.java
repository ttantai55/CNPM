package vn.doan.domain;

import jakarta.persistence.*;
import vn.doan.domain.enums.OrderStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_processes")
public class OrderProcess {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status;

    @Column(name = "update_at", nullable = false)
    private LocalDateTime updateAt;

    // BẮT BUỘC CHO JPA: Constructor không tham số
    public OrderProcess() {
    }

    public OrderProcess(Order order, OrderStatus status) {
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

    // Getters and Setters
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