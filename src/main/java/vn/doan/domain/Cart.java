package vn.doan.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
public class Cart implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @PrePersist
    private void assignId() { if (id == null) id = Ids.next("CART"); }

    // QUAN HỆ 1 - 1: Mỗi Cart gắn liền với một User sở hữu
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // QUAN HỆ 1 - NHIỀU: 1 Cart chứa nhiều CartItem
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();

    // BẮT BUỘC: Constructor không tham số cho JPA
    public Cart() {
    }

    public Cart(User user) {
        this.user = user;
    }

    // --- CÁC HÀM NGHIỆP VỤ GIỎ HÀNG TIỆN ÍCH ---

    public void addItem(CartItem item) {
        items.add(item);
        item.setCart(this);
    }

    public void removeItem(CartItem item) {
        items.remove(item);
        item.setCart(null);
    }

    public void clearCart() {
        items.clear();
    }

    public long getTotalPrice() {
        return items.stream()
                .mapToLong(CartItem::getSubtotal)
                .sum();
    }

    // --- GETTERS & SETTERS ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
    }
}