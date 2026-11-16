package vn.doan.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "baristas")
public class Barista {

    @Id
    private String id;

    @PrePersist
    private void assignId() {
        if (id == null) id = Ids.next("STAFF");
    }

    @Column(nullable = false, length = 100)
    private String name;

    // BẮT BUỘC CHO JPA: Constructor không tham số
    public Barista() {
    }

    public Barista(String name) {
        this.name = name;
    }

    public Barista(String id, String name) {
        this.id = id;
        this.name = name;
    }

    // --- GETTERS & SETTERS ---

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

}