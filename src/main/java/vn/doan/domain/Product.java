package vn.doan.domain;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private long price;

    @Column(name = "stock_quantity", nullable = false)
    private long stockQuantity;

    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    private boolean status;

    // QUAN HỆ NHIỀU - 1: Nhiều sản phẩm thuộc về 1 danh mục
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // 1. Constructor không tham số cho JPA
    public Product() {
    }

    // 2. Constructor đầy đủ tham số 
    public Product(String id, String name, long price, long stockQuantity,
                   String description, String imageUrl, boolean status, Category category) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stockQuantity = stockQuantity;
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

    public boolean hasEnoughStock(long quantity) {
        return quantity > 0 && stockQuantity >= quantity;
    }

    public boolean isOutOfStock() {
        return stockQuantity == 0;
    }

    public void decreaseStock(long quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }
        if (!hasEnoughStock(quantity)) {
            throw new IllegalStateException("Không đủ hàng trong kho");
        }
        stockQuantity -= quantity;
    }

    public void increaseStock(long quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }
        stockQuantity += quantity;
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

    public long getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(long stockQuantity) {
        if (stockQuantity < 0) {
            throw new IllegalArgumentException("Số lượng tồn kho không được âm");
        }
        this.stockQuantity = stockQuantity;
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

    // ĐÃ BỔ SUNG GETTER VÀ SETTER CHO CATEGORY
    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}