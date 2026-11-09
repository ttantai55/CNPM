package vn.doan.domain;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private long price;

    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    private boolean status;

    private Double rating = 5.0;

    @Column(name = "weekly_sales_count", nullable = false)
    private Integer weeklySalesCount = 0;

    // QUAN HỆ NHIỀU - 1: Nhiều sản phẩm thuộc về 1 danh mục
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @PrePersist
    private void assignId() {
        if (id == null) id = Ids.next("PROD");
        if (rating == null) rating = 5.0;
        if (weeklySalesCount == null) weeklySalesCount = 0;
    }

    // 1. Constructor không tham số cho JPA
    public Product() {
    }

    // 2. Constructor đầy đủ tham số 
    public Product(String id, String name, long price,
                   String description, String imageUrl, boolean status, Category category) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.status = status;
        this.category = category;
    }

    // --- CÁC HÀM NGHIỆP VỤ ---

    public void activate() {
        status = true;
    }

    public void deactivate() {
        status = false;
    }

    public void changePrice(long newPrice) {
        if (newPrice < 0) {
            throw new IllegalArgumentException("Giá không được âm");
        }
        price = newPrice;
    }

    // --- GETTERS & SETTERS ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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
        if (price < 0) {
            throw new IllegalArgumentException("Giá sản phẩm không được âm");
        }
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

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getWeeklySalesCount() { return weeklySalesCount; }
    public void setWeeklySalesCount(Integer weeklySalesCount) { this.weeklySalesCount = weeklySalesCount; }
}