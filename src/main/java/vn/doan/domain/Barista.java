package vn.doan.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "baristas")


public class Barista {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    // Quan hệ 1 - Nhiều: 1 Barista thực hiện nhiều InventoryTransaction
    // mappedBy = "barista" trỏ đến biến barista ở phía InventoryTransaction
    @OneToMany(mappedBy = "barista", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventoryTransaction> transactions = new ArrayList<>();
    

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    // QUAN HỆ 1 - NHIỀU: 1 Barista có thể tạo nhiều giao dịch nhập/xuất/kiểm kê kho
    @OneToMany(mappedBy = "barista")
    private List<InventoryTransaction> inventoryTransactions = new ArrayList<>();

    // BẮT BUỘC: Constructor không tham số cho JPA
    public Barista() {
    }

    public Barista(String name) {
        this.name = name;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<InventoryTransaction> getInventoryTransactions() {
        return inventoryTransactions;
    }

    public void setInventoryTransactions(List<InventoryTransaction> inventoryTransactions) {
        this.inventoryTransactions = inventoryTransactions;
    }
}