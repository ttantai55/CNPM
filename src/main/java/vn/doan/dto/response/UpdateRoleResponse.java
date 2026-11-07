package vn.doan.dto.response;

public class UpdateRoleResponse {
    
    private String userId;
    private String username;
    private String updatedRole;
    private String message; // Thông báo thành công để Frontend hiện Toast/Notification

    public UpdateRoleResponse() {}

    public UpdateRoleResponse(String userId, String username, String updatedRole, String message) {
        this.userId = userId;
        this.username = username;
        this.updatedRole = updatedRole;
        this.message = message;
    }

    // --- CHỈ CÓ GETTER (Bất biến) ---
    public String getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getUpdatedRole() {
        return updatedRole;
    }

    public String getMessage() {
        return message;
    }
}