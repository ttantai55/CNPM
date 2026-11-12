package vn.doan.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "order_item_toppings")
public class OrderItemTopping {

    @Id
    private String id;

    @PrePersist
    private void assignId() { if (id == null) id = Ids.next("OTOP"); }

    // Quan hệ Nhiều - 1: Nhiều lựa chọn topping thuộc về 1 dòng chi tiết sản phẩm (OrderItem)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    // Quan hệ Nhiều - 1: Lựa chọn này ứng với Topping nào trong menu
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topping_id", nullable = false)
    private Topping topping;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private long price;

    // BẮT BUỘC CHO JPA: Constructor không tham số
    public OrderItemTopping() {
    }

    public OrderItemTopping(OrderItem orderItem, Topping topping, int quantity, long price) {
        this.orderItem = orderItem;
        this.topping = topping;
        this.quantity = quantity;
        this.price = price;
    }

    public OrderItemTopping(String id, OrderItem orderItem, Topping topping, int quantity, long price) {
        this.id = id;
        this.orderItem = orderItem;
        this.topping = topping;
        this.quantity = quantity;
        this.price = price;
    }

    // --- GETTER & SETTER ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public OrderItem getOrderItem() {
        return orderItem;
    }

    public void setOrderItem(OrderItem orderItem) {
        this.orderItem = orderItem;
    }

    public Topping getTopping() {
        return topping;
    }

    public void setTopping(Topping topping) {
        this.topping = topping;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public long getPrice() {
        return price;
    }

    public void setPrice(long price) {
        this.price = price;
    }
}