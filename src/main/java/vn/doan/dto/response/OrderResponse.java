package vn.doan.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private String id;
    
    // Thông tin khách hàng làm phẳng
    private String customerId;
    private String customerName;
    private String customerPhone;

    // Chi tiết tiền nong
    private long totalAmount;
    private long discountAmount; // Tiền được giảm giá (Tính toán từ voucherCode)
    private long finalAmount;

    private String status; // Lấy tên Enum OrderStatus
    private LocalDateTime createdAt;

    // Chi tiết các món hàng
    private List<OrderItemResponse> items;

    //Dòng thời gian lịch sử trạng thái đơn hàng
    private List<OrderProcessResponse> processes;

    // Mã giảm giá đã dùng (nếu có)
    private String voucherCode;

    public OrderResponse() {
    }

    public OrderResponse(String id, String customerId, String customerName, String customerPhone, 
                         long totalAmount, long discountAmount, long finalAmount, String status, 
                         LocalDateTime createdAt, List<OrderItemResponse> items, 
                         List<OrderProcessResponse> processes, String voucherCode) {
        this.id = id;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.totalAmount = totalAmount;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
        this.status = status;
        this.createdAt = createdAt;
        this.items = items;
        this.processes = processes;
        this.voucherCode = voucherCode;
    }

    // --- GETTERS & SETTERS ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    
    public long getTotalAmount() { return totalAmount; }
    public void setTotalAmount(long totalAmount) { this.totalAmount = totalAmount; }
    
    public long getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(long discountAmount) { this.discountAmount = discountAmount; }
    
    public long getFinalAmount() { return finalAmount; }
    public void setFinalAmount(long finalAmount) { this.finalAmount = finalAmount; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public List<OrderItemResponse> getItems() { return items; }
    public void setItems(List<OrderItemResponse> items) { this.items = items; }

    // Getter & Setter cho thuộc tính mới thêm
    public List<OrderProcessResponse> getProcesses() { return processes; }
    public void setProcesses(List<OrderProcessResponse> processes) { this.processes = processes; }
    
    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }
}