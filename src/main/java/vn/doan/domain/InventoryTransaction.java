package vn.doan.domain;
import jakarta.persistence.*;
import vn.doan.domain.enums.InventoryTransactionType;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InventoryTransactionType type;

    @Column(name = "create_at", nullable = false)
    private LocalDateTime createAt;


    private String note;
   // Quan hệ 1 - 1 hoặc Nhiều - 1 với bảng chi tiết giao dịch kho
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "details_id")
    private InventoryTransactionDetails details;

    // Quan hệ Nhiều - 1: Nhiều giao dịch được thực hiện bởi 1 Barista
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barista_id", nullable = false)
    private Barista barista;

    // QUAN HỆ 1 - 1: Mỗi giao dịch kho gắn liền với 1 chi tiết giao dịch kho
    @OneToOne(mappedBy = "inventoryTransaction", cascade = CascadeType.ALL, orphanRemoval = true)
    private InventoryTransactionDetails details;

    // BẮT BUỘC CHO JPA: Constructor không tham số
    public InventoryTransaction() {
        this.createAt = LocalDateTime.now();
    }

    public InventoryTransaction(InventoryTransactionType type, String note, Barista barista) {
        this.type = type;
        this.note = note;
        this.barista = barista;
        this.createAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public InventoryTransactionType getType() {
        return type;
    }

    public void setType(InventoryTransactionType type) {
        this.type = type;
    }

    public LocalDateTime getCreateAt() {
        return createAt;
    }

    public void setCreateAt(LocalDateTime createAt) {
        this.createAt = createAt;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Barista getBarista() {
        return barista;
    }

    public void setBarista(Barista barista) {
        this.barista = barista;
    }

    public InventoryTransactionDetails getDetails() {
        return details;
    }

    public void setDetails(InventoryTransactionDetails details) {
        this.details = details;
        if (details != null) {
            details.setInventoryTransaction(this);
        }
    }
}