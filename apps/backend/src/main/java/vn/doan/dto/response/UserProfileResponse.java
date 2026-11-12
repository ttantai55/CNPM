package vn.doan.dto.response;

public class UserProfileResponse {
    
    private String id;
    private String name;
    private String email;
    private String avatarUrl;
    private String role; // Enum Role được chuyển thành String

    public UserProfileResponse() {}

    public UserProfileResponse(String id, String name, String email, String avatarUrl, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatarUrl = avatarUrl;
        this.role = role;
    }

    // --- CHỈ CÓ GETTER, KHÔNG CÓ SETTER ---
    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getAvatarUrl() { return avatarUrl;}
    public String getRole() { return role; }
}