package vn.doan.domain;

import jakarta.persistence.*;


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
    private boolean isAvailable;

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

    // QUAN HỆ NHIỀU - NHIỀU: Nhiều Topping thuộc về nhiều Product khác nhau
    @ManyToMany(mappedBy = "toppings")
    private List<Product> products = new ArrayList<>();

    // QUAN HỆ 1 - NHIỀU: 1 Topping được tham chiếu trong nhiều dòng OrderItemTopping
    @OneToMany(mappedBy = "topping")
    private List<OrderItemTopping> orderItemToppings = new ArrayList<>();

    // BẮT BUỘC: Constructor không tham số cho JPA
    public Topping() {
    }

    public Topping(String name, long price, boolean isAvailable) {
        this.name = name;
        this.price = price;
        this.isAvailable = isAvailable;
    }

    // Getters and Setters
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