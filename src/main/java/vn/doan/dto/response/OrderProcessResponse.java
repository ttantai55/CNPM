package vn.doan.dto.response;

import java.time.LocalDateTime;

public class OrderProcessResponse {

    private String id;
    
    // Làm phẳng quan hệ, chỉ lấy ID của Order thay vì nguyên Object
    private String orderId;

    // Ép kiểu Enum OrderStatus về String để Frontend dễ xử lý
    private String status;
    
    // Thời gian cập nhật trạng thái
    private LocalDateTime updateAt;

    public OrderProcessResponse() {
    }

    public OrderProcessResponse(String id, String orderId, String status, LocalDateTime updateAt) {
        this.id = id;
        this.orderId = orderId;
        this.status = status;
        this.updateAt = updateAt;
    }

    // --- GETTERS & SETTERS ---
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getUpdateAt() {
        return updateAt;
    }

    public void setUpdateAt(LocalDateTime updateAt) {
        this.updateAt = updateAt;
    }
}