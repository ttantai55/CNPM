package vn.doan.dto.response;

import java.time.LocalDateTime;

public class UserResponse {

    private String id;
    private String username;
    private String email;
    private String role;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Các trường làm phẳng (Flattening) để tránh đệ quy
    private String customerId; // Chỉ trả về ID của Customer (nếu có)
    private String baristaId;  // Chỉ trả về ID của Barista (nếu user này là nhân viên)
    private String fullName;
    private String phone;

    // --- CONSTRUCTOR ---
    public UserResponse() {
    }

    public UserResponse(String id, String username, String email, String role, String avatarUrl, 
                        LocalDateTime createdAt, LocalDateTime updatedAt, String customerId, 
                        String baristaId, String fullName, String phone) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.customerId = customerId;
        this.baristaId = baristaId;
        this.fullName = fullName;
        this.phone = phone;
    }

    // --- GETTERS & SETTERS ---
    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    
    public String getAvatarUrl() {
        return avatarUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public String getCustomerId() {
        return customerId;
    }

    public String getBaristaId() {
        return baristaId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPhone() {
        return phone;
    }
}