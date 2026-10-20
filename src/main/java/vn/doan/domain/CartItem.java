package vn.doan.domain; // hoặc vn.doan.dto tùy cấu trúc dự án của bạn

import java.io.Serializable;

public class CartItem implements Serializable {
    private static final long serialVersionUID = 1L;
    /* 
    private String id;           // Mã định danh món hàng (packageId hoặc productId)
    private String name;         // Tên hiển thị (Tên gói tập hoặc tên sản phẩm)
    private String imageUrl;     // Ảnh đại diện
    private long price;          // Đơn giá tại thời điểm thêm vào giỏ
    private int quantity;        // Số lượng (với gói tập luôn là 1)
    private boolean isPackage;   // true nếu là Gói tập, false nếu là Sản phẩm
    */
    private Package pkg;
    private Product product;
    private int quantity;

    public CartItem() {
    }


    public CartItem(Package pkg){
        this.pkg = pkg;
        this.product = null;
        this.quantity = 1;
    }

    public CartItem(Product product, int quantity) {
        this.pkg = null;
        this.product = product;
        this.quantity = quantity;
    }

   // Kiểm tra nhanh xem đây là gói tập hay sản phẩm
    public boolean isPackage() {
        return this.pkg != null;
    }

    // Lấy ID định danh của món hàng
    public String getId() {
        return isPackage() ? this.pkg.getId() : this.product.getId();
    }

    // Lấy tên hiển thị
    public String getName() {
        return isPackage() ? this.pkg.getName() : this.product.getName();
    }

    // Lấy đơn giá
    public long getPrice() {
        return isPackage() ? this.pkg.getPrice() : this.product.getPrice();
    }

    // Tính thành tiền của món này (đơn giá x số lượng)
    public long getSubTotal() {
        return getPrice() * this.quantity;
    }

    // --- Getters & Setters ---

    public Package getPkg() {
        return pkg;
    }

    public void setPkg(Package pkg) {
        this.pkg = pkg;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}