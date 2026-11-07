package vn.doan.dto.request;

<<<<<<< HEAD
=======
import jakarta.validation.constraints.Email;
>>>>>>> 588da0f172ce78ad6a0bf0eae51d3685fac2ddcb
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

<<<<<<< HEAD
    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;
=======
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;
>>>>>>> 588da0f172ce78ad6a0bf0eae51d3685fac2ddcb

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

<<<<<<< HEAD
    public LoginRequest() {
    }

    public LoginRequest(String username, String password) {
        this.username = username;
=======
    public LoginRequest() {}

    public LoginRequest(String email, String password) {
        this.email = email;
>>>>>>> 588da0f172ce78ad6a0bf0eae51d3685fac2ddcb
        this.password = password;
    }

    // --- GETTERS & SETTERS ---
<<<<<<< HEAD
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
=======
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
>>>>>>> 588da0f172ce78ad6a0bf0eae51d3685fac2ddcb
}