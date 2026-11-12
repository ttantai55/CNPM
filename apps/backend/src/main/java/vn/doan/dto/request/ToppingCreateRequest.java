package vn.doan.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class ToppingCreateRequest {

    @NotBlank(message = "Tên topping không được để trống")
    private String name;

    @Min(value = 0, message = "Giá topping không được âm")
    private long price;

    private boolean isAvailable;

    public ToppingCreateRequest() {}

    public ToppingCreateRequest(String name, long price, boolean isAvailable) {
        this.name = name;
        this.price = price;
        this.isAvailable = isAvailable;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public long getPrice() { return price; }
    public void setPrice(long price) { this.price = price; }
    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }
}