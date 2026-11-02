package vn.doan.domain;

import vn.doan.domain.enums.InventoryTransactionType;
import java.time.LocalDateTime;

public class InventoryTransaction {
    private String id;
    private InventoryTransactionType type;
    private LocalDateTime createAt;
    private String note;
    private InventoryTransactionDetails details;
    private Barista barista;

    public InventoryTransaction() {
        this.createAt = LocalDateTime.now();
    }

    public InventoryTransaction(String id, InventoryTransactionType type, String note, 
                                InventoryTransactionDetails details, Barista barista) {
        this.id = id;
        this.type = type;
        this.createAt = LocalDateTime.now();
        this.note = note;
        this.details = details;
        this.barista = barista;
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

    public InventoryTransactionDetails getDetails() {
        return details;
    }

    public void setDetails(InventoryTransactionDetails details) {
        this.details = details;
    }

    public Barista getBarista() {
        return barista;
    }

    public void setBarista(Barista barista) {
        this.barista = barista;
    }
}