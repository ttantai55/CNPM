package vn.doan.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class CartItemRequest {

    @NotBlank(message = "ID Sản phẩm không được để trống")
    private String productId;

    // Dựa theo file CartItem.java, quantity là kiểu int
    @Min(value = 1, message = "Số lượng phải lớn hơn hoặc bằng 1")
    private int quantity;

    public CartItemRequest() {
    }

    public CartItemRequest(String productId, int quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    // --- GETTERS & SETTERS ---
    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}