package vn.doan.dto.response;

import java.util.List;

public class CartResponse {

    private String id;
    
    // Lấy ID của User sở hữu Cart này
    private String userId; 
    
    // Tổng số tiền, sẽ lấy từ hàm getTotalPrice() của Cart
    private long totalCartAmount; 

    private List<CartItemResponse> items;

    public CartResponse() {
    }

    public CartResponse(String id, String userId, long totalCartAmount, List<CartItemResponse> items) {
        this.id = id;
        this.userId = userId;
        this.totalCartAmount = totalCartAmount;
        this.items = items;
    }

    // --- GETTERS & SETTERS ---
    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public long getTotalCartAmount() {
        return totalCartAmount;
    }

    public List<CartItemResponse> getItems() {
        return items;
    }
}