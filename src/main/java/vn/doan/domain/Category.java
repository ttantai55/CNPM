package vn.doan.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")

public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    // --- QUAN HỆ 1 - NHIỀU (ONE-TO-MANY) ---
    // 1. 1 Category có nhiều Product
    // 2. mappedBy = "category": Báo cho JPA biết biến `category` bên class Product 
    //    mới là phía nắm giữ khóa ngoại (foreign key).
    // 3. cascade = CascadeType.ALL: Khi thao tác với Category (lưu/xóa), 
    //    nó sẽ lan truyền hành động đó xuống các Product bên trong.
    // 4. orphanRemoval = true: Nếu xóa một Product ra khỏi danh sách này, 
    //    nó sẽ tự động bị xóa khỏi cơ sở dữ liệu.
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private String description;

    

    // BẮT BUỘC: Constructor không tham số cho JPA
    public Category() {
    }

    public Category(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public Category(String id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    
}