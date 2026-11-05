package vn.doan.dto.request;

import jakarta.validation.constraints.NotBlank;

public class UserLoginRequest {

    @NotBlank(message = "Vui lòng nhập tài khoản")
    private String username;

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    private String password;

    public UserLoginRequest() {
    }

    public UserLoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // --- GETTERS & SETTERS ---
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}