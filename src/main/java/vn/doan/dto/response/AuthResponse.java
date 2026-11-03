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

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}