package vn.doan.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // QUAN HỆ NHIỀU - 1: Nhiều OrderItem thuộc về 1 Order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // QUAN HỆ NHIỀU - 1: Nhiều OrderItem cùng tham chiếu 1 Product
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private long quantity;

    @Column(name = "unit_price", nullable = false)
    private long unitPrice;

    private String note;

    // QUAN HỆ 1 - NHIỀU: 1 OrderItem có nhiều OrderItemTopping đi kèm
    @OneToMany(mappedBy = "orderItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItemTopping> orderItemToppings = new ArrayList<>();

    // 1. Constructor không tham số 
    public OrderItem() {
    }

    // 2. Constructor tạo mới tiện lợi khi thêm món vào đơn
    public OrderItem(Order order, Product product, long quantity, long unitPrice, String note) {
        this.order = order;
        this.product = product;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.note = note;
    }

    // 3. Constructor đầy đủ tham số CÓ ID (dùng cho mock test, seed data, mapping)
    public OrderItem(String id, Order order, Product product, long quantity, long unitPrice, String note) {
        this.id = id;
        this.order = order;
        this.product = product;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.note = note;
    }

    public long calculateSubtotal() {
        return this.unitPrice * this.quantity;
    }

    // --- GETTERS & SETTERS ---

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

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public long getQuantity() {
        return quantity;
    }

    public void setQuantity(long quantity) {
        this.quantity = quantity;
    }

    public long getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(long unitPrice) {
        this.unitPrice = unitPrice;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public List<OrderItemTopping> getOrderItemToppings() {
        return orderItemToppings;
    }

    public void setOrderItemToppings(List<OrderItemTopping> orderItemToppings) {
        this.orderItemToppings = orderItemToppings;
    }
}