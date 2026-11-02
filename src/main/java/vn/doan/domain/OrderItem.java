package vn.doan.domain;

public class OrderItem {
    private String id;
    private String orderId;
    private String packageId;
    private String productId;
    private long quantity;
    private long price;

    public OrderItem() {
    }

    public OrderItem(String id, String orderId, String packageId, String productId, long quantity, long price) {
        this.id = id;
        this.orderId = orderId;
        this.packageId = packageId;
        this.productId = productId;
        this.quantity = quantity;
        this.price = price;
        validate();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getPackageId() {
        return packageId;
    }

    public void setPackageId(String packageId) {
        this.packageId = packageId;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public long getQuantity() {
        return quantity;
    }

    public void setQuantity(long quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }
        if (isPackage() && quantity != 1) {
            throw new IllegalArgumentException("Gói tập chỉ có số lượng bằng 1");
        }
        this.quantity = quantity;
    }

    public long getPrice() {
        return price;
    }

    public void setPrice(long price) {
        if (price < 0) {
            throw new IllegalArgumentException("Giá không được âm");
        }
        this.price = price;
    }

    public long getSubTotal() {
        return Math.multiplyExact(price, quantity);
    }

    public boolean isProduct() {
        return hasText(productId);
    }

    public boolean isPackage() {
        return hasText(packageId);
    }

    public void validate() {
        requireText(id, "Mã dòng đơn hàng không được để trống");
        requireText(orderId, "Mã đơn hàng không được để trống");

        if (isProduct() == isPackage()) {
            throw new IllegalStateException("Món hàng phải là sản phẩm hoặc gói tập");
        }
        if (quantity <= 0) {
            throw new IllegalStateException("Số lượng phải lớn hơn 0");
        }
        if (isPackage() && quantity != 1) {
            throw new IllegalStateException("Gói tập chỉ có số lượng bằng 1");
        }
        if (price < 0) {
            throw new IllegalStateException("Giá không được âm");
        }

        getSubTotal();
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private static void requireText(String value, String message) {
        if (!hasText(value)) {
            throw new IllegalStateException(message);
        }
    }
}