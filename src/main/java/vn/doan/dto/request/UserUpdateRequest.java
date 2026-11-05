package vn.doan.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public class UserUpdateRequest {

    @Email(message = "Email không đúng định dạng")
    private String email;

    private String avatarUrl;

    // Các trường dưới đây dùng để map sang bảng Customer (Thông tin cá nhân)
    private String fullName;

    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại không hợp lệ")
    private String phone;

    public UserUpdateRequest() {
    }

    public UserUpdateRequest(String email, String avatarUrl, String fullName, String phone) {
        this.email = email;
        this.avatarUrl = avatarUrl;
        this.fullName = fullName;
        this.phone = phone;
    }

    // --- GETTERS & SETTERS ---
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}