package vn.doan.dto.request;

import jakarta.validation.constraints.NotBlank;

public class UpdateRoleRequest {

    @NotBlank(message = "Chức vụ mới không được để trống")
    private String newRole;

    public UpdateRoleRequest() {}

    public UpdateRoleRequest(String newRole) {
        this.newRole = newRole;
    }

    // --- GETTER & SETTER ---
    public String getNewRole() {
        return newRole;
    }

    public void setNewRole(String newRole) {
        this.newRole = newRole;
    }
}