package vn.doan.dto.response;

import java.util.List;

public class CartItemResponse {

    private String id; // ID của CartItem để Frontend gọi API xóa món
    
    // Thông tin cơ bản làm phẳng từ Product
    private String productId;
    private String productName;
    private String productImageUrl;
    private long unitPrice; 
    private int quantity;
    private long subtotal;
    private String size;
    private int sugarPercent;
    private int icePercent;
    private String note;
    private List<String> toppingIds;

    public CartItemResponse() {
    }

    public CartItemResponse(String id, String productId, String productName, String productImageUrl, 
                            long unitPrice, int quantity, long subtotal) {
        this(id, productId, productName, productImageUrl, unitPrice, quantity, subtotal, "M", 50, 50, null, List.of());
    }

    public CartItemResponse(String id, String productId, String productName, String productImageUrl,
                            long unitPrice, int quantity, long subtotal, String size, int sugarPercent,
                            int icePercent, String note, List<String> toppingIds) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productImageUrl = productImageUrl;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.subtotal = subtotal;
        this.size = size;
        this.sugarPercent = sugarPercent;
        this.icePercent = icePercent;
        this.note = note;
        this.toppingIds = toppingIds;
    }

    // --- GETTERS & SETTERS ---
    public String getId() { return id; }
   
    public String getProductId() { return productId; }
    
    public String getProductName() { return productName; }
    
    public String getProductImageUrl() { return productImageUrl; }
    
    public long getUnitPrice() { return unitPrice; }
   
    public int getQuantity() { return quantity; }
  
    public long getSubtotal() { return subtotal; }
    public String getSize() { return size; }
    public int getSugarPercent() { return sugarPercent; }
    public int getIcePercent() { return icePercent; }
    public String getNote() { return note; }
    public List<String> getToppingIds() { return toppingIds; }
}