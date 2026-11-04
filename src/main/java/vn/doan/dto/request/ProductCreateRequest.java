package vn.doan.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class ProductCreateRequest {
    
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    @Min(value = 0, message = "Giá sản phẩm không được âm")
    private long price;

    @Min(value = 0, message = "Số lượng tồn kho không được âm")
    private long stockQuantity;

    private String description;
    private String imageUrl;

    @NotBlank(message = "ID Danh mục không được để trống")
    private String categoryId;

    public ProductCreateRequest() {}

    public ProductCreateRequest(String name, long price, long stockQuantity, String description, String imageUrl, String categoryId) {
        this.name = name;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.description = description;
        this.imageUrl = imageUrl;
        this.categoryId = categoryId;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public long getPrice() { return price; }
    public void setPrice(long price) { this.price = price; }
    public long getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(long stockQuantity) { this.stockQuantity = stockQuantity; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
}