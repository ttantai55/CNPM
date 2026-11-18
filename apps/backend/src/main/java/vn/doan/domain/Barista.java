package vn.doan.domain;

import jakarta.persistence.*;
import vn.doan.domain.enums.BaristaStatus;

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

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BaristaStatus status = BaristaStatus.OFFLINE;

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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public BaristaStatus getStatus() {
        return status;
    }

    public void setStatus(BaristaStatus status) {
        this.status = status;
    }

}