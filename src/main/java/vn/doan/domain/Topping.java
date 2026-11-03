package vn.doan.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "toppings")
public class Topping {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private long price;

    @Column(name = "is_available", nullable = false)
    private boolean isAvailable = true;

    // QUAN HỆ NHIỀU - NHIỀU: Một Topping có thể thuộc nhiều Product
    @ManyToMany(mappedBy = "toppings")
    private List<Product> products = new ArrayList<>();

    // QUAN HỆ 1 - NHIỀU: Một Topping xuất hiện trong nhiều OrderItemTopping
    @OneToMany(mappedBy = "topping")
    private List<OrderItemTopping> orderItemToppings = new ArrayList<>();

    // BẮT BUỘC CHO JPA: Constructor không tham số
    public Topping() {
    }

    public Topping(String name, long price, boolean isAvailable) {
        this.name = name;
        this.price = price;
        this.isAvailable = isAvailable;
    }

    public Topping(String id, String name, long price, boolean isAvailable) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.isAvailable = isAvailable;
    }

    // --- GETTERS & SETTERS ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getPrice() {
        return price;
    }

    public void setPrice(long price) {
        this.price = price;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }

    public List<OrderItemTopping> getOrderItemToppings() {
        return orderItemToppings;
    }

    public void setOrderItemToppings(List<OrderItemTopping> orderItemToppings) {
        this.orderItemToppings = orderItemToppings;
    }
}