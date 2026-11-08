package vn.doan.dto.request;

<<<<<<< HEAD

import lombok.Builder;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder 
public class ProductRequest {
    
   
=======
public class ProductRequest {
    
    private String name;
    private long price;
    private String description;
    private String imageUrl;
>>>>>>> b032aed05faa130471684c4c6f24b56b49053905

    public ProductRequest() {
    }

    // --- GETTERS & SETTERS ---
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getPrice() {
        return price;
    }

    public void setPrice(long price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}