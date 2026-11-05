package vn.doan.dto.response;

import java.time.LocalDate;

public class CustomerResponse {

    private String id;
    private String name;
    private LocalDate dateOfBirth;
    private boolean gender;
    private String address;
    private String phone;

    // Các trường làm phẳng (Flattening) từ bảng User
    private String userId;
    private String email; 

    public CustomerResponse() {
    }

    public CustomerResponse(String id, String name, LocalDate dateOfBirth, boolean gender, 
                            String address, String phone, String userId, String email) {
        this.id = id;
        this.name = name;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.address = address;
        this.phone = phone;
        this.userId = userId;
        this.email = email;
    }

    // --- GETTERS & SETTERS ---
    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public boolean isGender() {
        return gender;
    }

    public String getAddress() {
        return address;
    }

    public String getPhone() {
        return phone;
    }

    public String getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }
}