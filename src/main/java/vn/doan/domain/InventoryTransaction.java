package vn.doan.domain;

import jakarta.persistence.*;
import vn.doan.domain.enums.InventoryTransactionType;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
public class InventoryTransaction {

    @Id
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private InventoryTransactionType type;

    @Column(name = "create_at", nullable = false)
    private LocalDateTime createAt;

    private String note;

    // QUAN HỆ NHIỀU - 1: Nhiều giao dịch kho do 1 Barista thực hiện
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barista_id", nullable = false)
    private Barista barista;

    // QUAN HỆ 1 - 1: Mỗi giao dịch kho gắn với 1 chi tiết giao dịch
    @OneToOne(mappedBy = "inventoryTransaction", cascade = CascadeType.ALL, orphanRemoval = true)
    private InventoryTransactionDetails details;

    @PrePersist
    private void assignId() {
        if (id == null) id = Ids.next("INV");
    }

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

    public InventoryTransaction(String id, InventoryTransactionType type, LocalDateTime createAt, String note, Barista barista, InventoryTransactionDetails details) {
        this.id = id;
        this.type = type;
        this.createAt = createAt;
        this.note = note;
        this.barista = barista;
        this.setDetails(details);
    }

    // --- GETTERS & SETTERS ---

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