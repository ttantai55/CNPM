package vn.doan.domain;

import jakarta.persistence.*;
import vn.doan.domain.enums.OrderStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "total_amount")
    private long totalAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id")
    private Promotion discount;

    @Column(name = "final_amount")
    private long finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderProcess> processes = new ArrayList<>();

    // 1. Constructor không tham số
    public Order() {
        this.status = OrderStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    // 2. Constructor tạo mới nhanh trong Service khi đặt đơn
    public Order(Customer customer) {
        this.customer = customer;
        this.status = OrderStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        recordProcess(OrderStatus.PENDING);
    }

    @PrePersist
    private void assignId() {
        if (id == null) id = Ids.next("ORD");
    }

    // 3. Constructor đầy đủ tham số CÓ ID (dùng cho mock test, seed data, map DTO)
    public Order(String id, Customer customer, long totalAmount, Promotion discount, 
                 long finalAmount, OrderStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.customer = customer;
        this.totalAmount = totalAmount;
        this.discount = discount;
        this.finalAmount = finalAmount;
        this.status = status != null ? status : OrderStatus.PENDING;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        recordProcess(this.status);
    }

    // --- CÁC HÀM NGHIỆP VỤ ---

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
        OrderProcess process = new OrderProcess(this, newStatus);
        this.processes.add(process);
    }

    // --- GETTERS & SETTERS ---

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