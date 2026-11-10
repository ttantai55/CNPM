package vn.doan.dto.response;

public class ProductResponse {
    private String id;
    private String name;
    private long price;
    private String description;
    private String imageUrl;
    private boolean status;
    private Double rating;
    private Integer weeklySalesCount;
    private String categoryName; 
    private String categoryId;


    public ProductResponse() {}

    public ProductResponse(String id, String name, long price, String description, String imageUrl, boolean status,String categoryId, String categoryName, Double rating, Integer weeklySalesCount) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.categoryId =categoryId;
        this.description = description;
        this.imageUrl = imageUrl;
        this.status = status;
        this.categoryName = categoryName;
        this.rating = rating;
        this.weeklySalesCount = weeklySalesCount;
    }

    public String getId() { return id; }

    public String getName() { return name; }

    public long getPrice() { return price; }


    public String getDescription() { return description; }

    public String getImageUrl() { return imageUrl; }

    public boolean isStatus() { return status; }

    public String getCategoryName() { return categoryName; }

    public String getCategoryId() { return categoryId; }
    public Double getRating() { return rating; }
    public Integer getWeeklySalesCount() { return weeklySalesCount; }

}