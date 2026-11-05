package vn.doan.dto.response;

public class AuthResponse {

    private String accessToken;
    private String tokenType = "Bearer";
    
    // Các thông tin cơ bản để Frontend lưu trữ phiên đăng nhập
    private String id;
    private String username;
    private String role;
    private String fullName;
    private String avatarUrl;

    // --- CONSTRUCTOR ---
    public AuthResponse() {
    }

    public AuthResponse(String accessToken, String id, String username, String role, String fullName, String avatarUrl) {
        this.accessToken = accessToken;
        this.id = id;
        this.username = username;
        this.role = role;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
    }

    // --- GETTERS & SETTERS ---
    public String getAccessToken() {
        return accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }
    public String getFullName() {
        return fullName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }
}