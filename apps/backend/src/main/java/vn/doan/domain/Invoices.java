package vn.doan.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
public class Invoices {

    @Id
    private String id;

    @PrePersist
    private void assignId() { if (id == null) id = Ids.next("INVOICE"); }

    @Column(name = "invoice_number", nullable = false, unique = true, length = 50)
    private String invoiceNumber;

    // QUAN HỆ 1 - 1: Mỗi hóa đơn tương ứng với đúng một đơn hàng
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(name = "total_paid", nullable = false)
    private long totalPaid;

    @Column(name = "issued_date", nullable = false)
    private LocalDateTime issuedDate;

    // BẮT BUỘC: Constructor không tham số cho JPA
    public Invoices() {
        this.issuedDate = LocalDateTime.now();
    }

    public Invoices(String invoiceNumber, Order order, long totalPaid) {
        this.invoiceNumber = invoiceNumber;
        this.order = order;
        this.totalPaid = totalPaid;
        this.issuedDate = LocalDateTime.now();
    }

    public Invoices(String id, String invoiceNumber, Order order, long totalPaid) {
        this.id =id;
        this.invoiceNumber = invoiceNumber;
        this.order = order;
        this.totalPaid = totalPaid;
        this.issuedDate = LocalDateTime.now();
    }

    // Getters and Setters
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

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
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