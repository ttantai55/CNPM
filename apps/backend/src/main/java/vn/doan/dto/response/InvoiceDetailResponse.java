package vn.doan.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class InvoiceDetailResponse {
    private String invoiceNumber;
    private LocalDateTime issuedDate;
    private String baristaName; // Tên nhân viên thu ngân
    private long totalPaid; // Tổng tiền hóa đơn
    
    private List<OrderItemResponse> items; // Danh sách chi tiết các món

    public InvoiceDetailResponse() {}

    public InvoiceDetailResponse(String invoiceNumber, LocalDateTime issuedDate, String baristaName, long totalPaid, List<OrderItemResponse> items) {
        this.invoiceNumber = invoiceNumber;
        this.issuedDate = issuedDate;
        this.baristaName = baristaName;
        this.totalPaid = totalPaid;
        this.items = items;
    }
    // Getters & Setters
    public String getInvoiceNumber() { return invoiceNumber; }
    
    public LocalDateTime getIssuedDate() { return issuedDate; }
    
    public String getBaristaName() { return baristaName; }
    
    public long getTotalPaid() { return totalPaid; }
   
    public List<OrderItemResponse> getItems() { return items; }
}