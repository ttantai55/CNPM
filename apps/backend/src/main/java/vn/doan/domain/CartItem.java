package vn.doan.domain;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "cart_items")
public class CartItem implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @PrePersist
    private void assignId() { if (id == null) id = Ids.next("CITEM"); }

    // QUAN HỆ NHIỀU - 1: Nhiều CartItem nằm trong 1 Cart
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    // QUAN HỆ NHIỀU - 1: Mỗi dòng CartItem tham chiếu tới 1 Product
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantity;

    // BẮT BUỘC CHO JPA: Constructor không tham số
    public CartItem() {
    }

    public CartItem(Cart cart, Product product, int quantity) {
        this.cart = cart;
        this.product = product;
        this.quantity = quantity;
    }

    public CartItem(Product product, int quantity) {
        this.product = product;
        this.quantity = quantity;
    }

    // --- CÁC HÀM TIỆN ÍCH NGHIỆP VỤ ---

    // Lấy thành tiền = Đơn giá sản phẩm * số lượng
    public long getSubtotal() {
        if (this.product == null) {
            return 0;
        }
        return this.product.getPrice() * this.quantity;
    }

    // --- GETTERS & SETTERS ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}