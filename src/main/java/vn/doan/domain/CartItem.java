package vn.doan.domain; // hoặc vn.doan.dto tùy cấu trúc dự án của bạn

import java.io.Serializable;

public class CartItem implements Serializable {
    private static final long serialVersionUID = 1L;

    private Product product;
    private int quantity;

    public CartItem() {
    }



    public CartItem(Product product, int quantity) {
        this.product = product;
        this.quantity = quantity;
    }

  
    // Lấy ID định danh của món hàng
    public String getId() {
        return this.product.getId();
    }

    // Lấy tên hiển thị
    public String getName() {
        return this.product.getName();
    }

    // Lấy đơn giá
    public long getPrice() {
        return this.product.getPrice();
    }

    // Tính thành tiền của món này (đơn giá x số lượng)
    public long getSubTotal() {
        return getPrice() * this.quantity;
    }

    // --- Getters & Setters ---


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