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