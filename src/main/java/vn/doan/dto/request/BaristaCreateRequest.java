package vn.doan.dto.request;

import jakarta.validation.constraints.NotBlank;

public class BaristaCreateRequest {

    @NotBlank(message = "Tên nhân viên không được để trống")
    private String name;

    public BaristaCreateRequest() {}

    public BaristaCreateRequest(String name) {
        this.name = name;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}