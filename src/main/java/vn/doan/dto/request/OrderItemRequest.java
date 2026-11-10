package vn.doan.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class OrderItemRequest {

    @NotBlank(message = "ID Sản phẩm không được để trống")
    private String productId;

    @Min(value = 1, message = "Số lượng phải lớn hơn hoặc bằng 1")
    private long quantity;

    private String note; // Ghi chú (ví dụ: "Ít đá", "Nhiều đường")

    // Danh sách ID các Topping đi kèm (nếu có)
    private List<String> toppings;
    private String size;
    private Integer sugarPercent;
    private Integer icePercent;

    public OrderItemRequest() {
    }

    public OrderItemRequest(String productId, long quantity, String note, List<String> toppingIds) {
        this.productId = productId;
        this.quantity = quantity;
        this.note = note;
        this.toppings = toppingIds;
    }

    // --- GETTERS & SETTERS ---
    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public long getQuantity() {
        return quantity;
    }

    public void setQuantity(long quantity) {
        this.quantity = quantity;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public List<String> getToppingIds() {
        return toppings;
    }

    public void setToppingIds(List<String> toppingIds) {
        this.toppings = toppingIds;
    }
    public List<String> getToppings() { return toppings; }
    public void setToppings(List<String> toppings) { this.toppings = toppings; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public Integer getSugarPercent() { return sugarPercent; }
    public void setSugarPercent(Integer sugarPercent) { this.sugarPercent = sugarPercent; }
    public Integer getIcePercent() { return icePercent; }
    public void setIcePercent(Integer icePercent) { this.icePercent = icePercent; }
}