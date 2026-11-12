package vn.doan.domain;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
@Entity
@Table(name = "inventories")
public class Inventory {

    @Id
    private String id;

    @PrePersist
    private void assignId() { if (id == null) id = Ids.next("INV"); }

    // Quan hệ 1 - Nhiều: 1 Kho chứa nhiều nguyên liệu (Ingredient)
    // Nếu trong bảng Ingredient có cột foreign key `inventory_id` thì dùng mappedBy = "inventory"
  
   @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "inventory_id") // Tạo cột khóa ngoại bên bảng ingredients
    private List<Ingredient> items = new ArrayList<>();
    
    public Inventory() {
    }

    public Inventory(List<Ingredient> items) {
        this.items = items != null ? items : new ArrayList<>();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<Ingredient> getItems() {
        return items;
    }

    public void setItems(List<Ingredient> items) {
        this.items = items;
    }
}