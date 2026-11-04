package vn.doan.dto.response;

public class ProductResponse {
    private String id;
    private String name;
    private long price;
    private String description;
    private String imageUrl;
    private boolean status;
    private String categoryName; 

    public ProductResponse() {}

    public ProductResponse(String id, String name, long price, String description, String imageUrl, boolean status, String categoryName) {
        this.id = id;
        this.name = name;
        this.price = price;

        this.description = description;
        this.imageUrl = imageUrl;
        this.status = status;
        this.categoryName = categoryName;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public long getPrice() { return price; }
    public void setPrice(long price) { this.price = price; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public boolean isStatus() { return status; }
    public void setStatus(boolean status) { this.status = status; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
}