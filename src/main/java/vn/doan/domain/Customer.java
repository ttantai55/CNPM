package vn.doan.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    private String id;

    @PrePersist
    private void assignId() {
        if (id == null) id = Ids.next("CUST");
    }

    // QUAN HỆ 1 - 1: Ánh xạ 2 chiều ngược về User thông qua trường info ở class User
    @OneToOne(mappedBy = "info", fetch = FetchType.LAZY)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(nullable = false)
    private boolean gender;

    private String address;

    @Column(length = 20)
    private String phone;

    // QUAN HỆ 1 - NHIỀU: 1 Customer thực hiện nhiều đơn hàng Order
    @OneToMany(mappedBy = "customer")
    private List<Order> orders = new ArrayList<>();

    // BẮT BUỘC CHO JPA: Constructor không tham số
    public Customer() {
    }

    public Customer(String name, LocalDate dateOfBirth, boolean gender, String address, String phone) {
        this.name = name;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.address = address;
        this.phone = phone;
    }

    public Customer(String id, User user, String name, LocalDate dateOfBirth, boolean gender, String address, String phone) {
        this.id = id;
        this.user = user;
        this.name = name;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.address = address;
        this.phone = phone;
    }

    // --- GETTERS & SETTERS ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public boolean isGender() {
        return gender;
    }

    public void setGender(boolean gender) {
        this.gender = gender;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public List<Order> getOrders() {
        return orders;
    }

    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }
}