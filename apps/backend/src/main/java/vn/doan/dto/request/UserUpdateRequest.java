package vn.doan.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

public class UserUpdateRequest {

    @Email(message = "Email không đúng định dạng")
    private String email;
    private String username;

    private String avatarUrl;

    // Các trường dưới đây dùng để map sang bảng Customer (Thông tin cá nhân)
    private String fullName;

    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại không hợp lệ")
    private String phone;
    private Boolean gender;
    private LocalDate dateOfBirth;
    private String address;

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
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

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
    public Boolean getGender() { return gender; }
    public void setGender(Boolean gender) { this.gender = gender; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}