package vn.doan.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class CartItemRequest {

    @NotBlank(message = "ID Sản phẩm không được để trống")
    private String productId;

    // Dựa theo file CartItem.java, quantity là kiểu int
    @Min(value = 1, message = "Số lượng phải lớn hơn hoặc bằng 1")
    private int quantity;
    private String size = "M";
    private Integer sugarPercent = 50;
    private Integer icePercent = 50;
    private String note;
    private List<String> toppingIds = new ArrayList<>();

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

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public Integer getSugarPercent() { return sugarPercent; }
    public void setSugarPercent(Integer sugarPercent) { this.sugarPercent = sugarPercent; }
    public Integer getIcePercent() { return icePercent; }
    public void setIcePercent(Integer icePercent) { this.icePercent = icePercent; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public List<String> getToppingIds() { return toppingIds; }
    public void setToppingIds(List<String> toppingIds) { this.toppingIds = toppingIds; }
}