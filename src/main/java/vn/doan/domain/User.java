package vn.doan.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "hash_password", nullable = false)
    private String hashPassword;

    @Column(length = 30)
    private String role;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    // QUAN HỆ 1 - 1: Mỗi User gắn với thông tin 1 Customer
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "customer_id", unique = true)
    private Customer info;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // QUAN HỆ 1 - 1: User sở hữu một giỏ hàng Cart
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Cart cart;

    // QUAN HỆ 1 - NHIỀU: Một User tích lũy nhiều giao dịch điểm thưởng
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LoyaltyTransaction> loyaltyTransactions = new ArrayList<>();

    // QUAN HỆ 0..1 - 1: User có thể là một nhân viên pha chế Barista
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barista_id", unique = true)
    private Barista barista;

    // BẮT BUỘC CHO JPA: Constructor không tham số
    public User() {
    }

    public User(String username, String hashPassword, String role, String email, Customer info, String avatarUrl) {
        this.username = username;
        this.hashPassword = hashPassword;
        this.role = role;
        this.email = email;
        this.info = info;
        this.avatarUrl = avatarUrl;
    }

    public User(String id, String username, String hashPassword, String role, String email,
                Customer info, String avatarUrl, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.username = username;
        this.hashPassword = hashPassword;
        this.role = role;
        this.email = email;
        this.info = info;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Tự động gán thời gian khi tạo hoặc cập nhật bản ghi
    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // --- GETTERS & SETTERS ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getHashPassword() {
        return hashPassword;
    }

    public void setHashPassword(String hashPassword) {
        this.hashPassword = hashPassword;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Customer getInfo() {
        return info;
    }

    public void setInfo(Customer info) {
        this.info = info;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public List<LoyaltyTransaction> getLoyaltyTransactions() {
        return loyaltyTransactions;
    }

    public void setLoyaltyTransactions(List<LoyaltyTransaction> loyaltyTransactions) {
        this.loyaltyTransactions = loyaltyTransactions;
    }

    public Barista getBarista() {
        return barista;
    }

    public void setBarista(Barista barista) {
        this.barista = barista;
    }
}