package vn.doan.domain;
import jakarta.persistence.*;
@Entity
@Table(name = "inventories")
public class Inventory {

    @Id
    private String id;

    @PrePersist
    private void assignId() { if (id == null) id = Ids.next("INV"); }

    public Inventory() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}