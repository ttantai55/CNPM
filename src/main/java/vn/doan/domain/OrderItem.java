package vn.doan.domain;

import java.util.ArrayList;
import java.util.List;

public class OrderItem {
    private String id;
    private Order order;
    private Product product;
    private long quantity;
    private long unitPrice;
    private String note;
    private List<OrderItemTopping> orderItemToppings = new ArrayList<>();

    public OrderItem() {
    }

    public OrderItem(String id, Order order, Product product, long quantity, long unitPrice, String note) {
        this.id = id;
        this.order = order;
        this.product = product;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.note = note;
    }

    // Tính thành tiền cho item (đơn giá * số lượng)
    public long calculateSubtotal() {
        return this.unitPrice * this.quantity;
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