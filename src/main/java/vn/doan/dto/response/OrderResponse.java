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

    // Dòng thời gian lịch sử trạng thái đơn hàng
    private List<OrderProcessResponse> processes;

    // Mã giảm giá đã dùng (nếu có)
    private String voucherCode;
    private String paymentMethod;

    public OrderResponse() {
    }

    public OrderResponse(String id, String customerId, String customerName, String customerPhone, 
                         long totalAmount, long discountAmount, long finalAmount, String status, 
                         LocalDateTime createdAt, List<OrderItemResponse> items, 
                         List<OrderProcessResponse> processes, String voucherCode, String paymentMethod) {
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
        this.paymentMethod = paymentMethod;
    }

    // --- GETTERS & SETTERS ---
    public String getId() { return id; }
    
    public String getCustomerId() { return customerId; }
    
    public String getCustomerName() { return customerName; }
    
    public String getCustomerPhone() { return customerPhone; }
    
    public long getTotalAmount() { return totalAmount; }
    
    public long getDiscountAmount() { return discountAmount; }
    
    public long getFinalAmount() { return finalAmount; }
    
    public String getStatus() { return status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    
    public List<OrderItemResponse> getItems() { return items; }
    
    public List<OrderProcessResponse> getProcesses() { return processes; }
    
    public String getVoucherCode() { return voucherCode; }

    public String getPaymentMethod() { return paymentMethod; }
}