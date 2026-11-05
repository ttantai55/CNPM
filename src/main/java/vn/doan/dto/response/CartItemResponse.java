package vn.doan.dto.response;

public class CartItemResponse {

    private String id; // ID của CartItem để Frontend gọi API xóa món
    
    // Thông tin cơ bản làm phẳng từ Product
    private String productId;
    private String productName;
    private String productImageUrl;
    private long unitPrice; 
    private int quantity;
    private long subtotal;

    public CartItemResponse() {
    }

    public CartItemResponse(String id, String productId, String productName, String productImageUrl, 
                            long unitPrice, int quantity, long subtotal) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productImageUrl = productImageUrl;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.subtotal = subtotal;
    }

    // --- GETTERS & SETTERS ---
    public String getId() { return id; }
   
    public String getProductId() { return productId; }
    
    public String getProductName() { return productName; }
    
    public String getProductImageUrl() { return productImageUrl; }
    
    public long getUnitPrice() { return unitPrice; }
   
    public int getQuantity() { return quantity; }
  
    public long getSubtotal() { return subtotal; }
}