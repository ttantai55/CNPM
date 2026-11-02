package vn.doan.domain;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product implements Serializable{
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

    // --- QUAN HỆ NHIỀU - MỘT (MANY-TO-ONE) ---
    // Nhiều Product thuộc về 1 Category
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false) // Khóa ngoại trỏ về bảng categories
    private Category category;
    public Product() {
    }

    public Product(String id, String name, long price, long stockQuantity,
            String description, String imageUrl, boolean status) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.description = description;
        this.imageUrl = imageUrl;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public boolean isStatus() {
        return status;
    }

    public void activate() {
        status = true;
    }

    public void deactivate() {
        status = false;
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

    @Deprecated
    public void setPice(long price) {
        setPrice(price);
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

    public void validate() {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Mã sản phẩm không được để trống");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Tên sản phẩm không được để trống");
        }
        if (price < 0) {
            throw new IllegalArgumentException("Giá sản phẩm không được âm");
        }
        if (stockQuantity < 0) {
            throw new IllegalArgumentException("Số lượng tồn kho không được âm");
        }
    }
}