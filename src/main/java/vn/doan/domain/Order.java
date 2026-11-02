package vn.doan.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import vn.doan.domain.enums.OrderStatus;

public class Order {
    private String id;
    private Customer customer;
    private long totalAmount;
    private Promotion discount;
    private long finalAmount;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private List<OrderItem> items = new ArrayList<>();
    private List<OrderProcess> processes = new ArrayList<>();

    public Order() {
        this.status = OrderStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public Order(String id, Customer customer) {
        this.id = id;
        this.customer = customer;
        this.status = OrderStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        recordProcess(OrderStatus.PENDING);
    }

    /**
     * Chuyển trạng thái đơn hàng kèm ghi nhận lịch sử vào OrderProcess
     */
    public void changeStatus(OrderStatus newStatus) {
        if (!this.status.canTransitionTo(newStatus)) {
            throw new IllegalStateException(
                String.format("Không thể chuyển trạng thái từ %s sang %s", this.status, newStatus)
            );
        }
        this.status = newStatus;
        recordProcess(newStatus);
    }

    private void recordProcess(OrderStatus newStatus) {
        OrderProcess process = new OrderProcess(
            UUID.randomUUID().toString(),
            this,
            newStatus,
            LocalDateTime.now()
        );
        this.processes.add(process);
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public long getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(long totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Promotion getDiscount() {
        return discount;
    }

    public void setDiscount(Promotion discount) {
        this.discount = discount;
    }

    public long getFinalAmount() {
        return finalAmount;
    }

    public void setFinalAmount(long finalAmount) {
        this.finalAmount = finalAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public List<OrderProcess> getProcesses() {
        return processes;
    }

    public void setProcesses(List<OrderProcess> processes) {
        this.processes = processes;
    }
}