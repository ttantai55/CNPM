package vn.doan.dto.request;

public class ProductRequest {
    private String name;
    private long price;
    private String description;
    private String imageUrl;
    private String categoryId;
    private Double rating;
    private Integer weeklySalesCount;
    private Boolean status;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public long getPrice() { return price; }
    public void setPrice(long price) { this.price = price; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getWeeklySalesCount() { return weeklySalesCount; }
    public void setWeeklySalesCount(Integer weeklySalesCount) { this.weeklySalesCount = weeklySalesCount; }
    public Boolean getStatus() { return status; }
    public void setStatus(Boolean status) { this.status = status; }
}