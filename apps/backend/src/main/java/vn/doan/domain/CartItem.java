package vn.doan.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

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

    @Column(nullable = false, length = 1)
    private String size = "M";

    @Column(name = "sugar_percent", nullable = false)
    private int sugarPercent = 50;

    @Column(name = "ice_percent", nullable = false)
    private int icePercent = 50;

    @Column(length = 100)
    private String note;

    @ElementCollection
    @CollectionTable(name = "cart_item_toppings", joinColumns = @JoinColumn(name = "cart_item_id"))
    @OrderColumn(name = "position")
    @Column(name = "topping_id", nullable = false)
    private List<String> toppingIds = new ArrayList<>();

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

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public int getSugarPercent() { return sugarPercent; }
    public void setSugarPercent(int sugarPercent) { this.sugarPercent = sugarPercent; }
    public int getIcePercent() { return icePercent; }
    public void setIcePercent(int icePercent) { this.icePercent = icePercent; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public List<String> getToppingIds() { return toppingIds; }
    public void setToppingIds(List<String> toppingIds) { this.toppingIds = toppingIds; }
}