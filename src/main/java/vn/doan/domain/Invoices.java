package vn.doan.domain;

import java.time.LocalDateTime;

public class Invoices {
    private String id;
    private String invoiceNumber;
    private String orderId;
    private long totalPaid;
    private LocalDateTime issuedDate;

    public Invoices() {
    }

    public Invoices(String id, String invoiceNumber, String orderId, long totalPaid, LocalDateTime issuedDate) {
        this.id = id;
        this.invoiceNumber = invoiceNumber;
        this.orderId = orderId;
        this.totalPaid = totalPaid;
        this.issuedDate = issuedDate;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public long getTotalPaid() {
        return totalPaid;
    }

    public void setTotalPaid(long totalPaid) {
        this.totalPaid = totalPaid;
    }

    public LocalDateTime getIssuedDate() {
        return issuedDate;
    }

    public void setIssuedDate(LocalDateTime issuedDate) {
        this.issuedDate = issuedDate;
    }

}
