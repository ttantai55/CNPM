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

    // Getters & Setters
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public LocalDateTime getIssuedDate() { return issuedDate; }
    public void setIssuedDate(LocalDateTime issuedDate) { this.issuedDate = issuedDate; }
    public String getBaristaName() { return baristaName; }
    public void setBaristaName(String baristaName) { this.baristaName = baristaName; }
    public long getTotalPaid() { return totalPaid; }
    public void setTotalPaid(long totalPaid) { this.totalPaid = totalPaid; }
    public List<OrderItemResponse> getItems() { return items; }
    public void setItems(List<OrderItemResponse> items) { this.items = items; }
}