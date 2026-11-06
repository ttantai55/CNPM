package vn.doan.dto.response;

import java.util.List;

public class OrderItemResponse {

    private String id;
    private String productId;
    private String productName;
    private long quantity;
    private long unitPrice;
    private long subtotal; // Thành tiền = quantity * unitPrice
    private String note;
    
    // Tên các Topping đi kèm (Thay vì nguyên object Topping)
    private List<String> toppingNames;

    public OrderItemResponse() {
    }

    public OrderItemResponse(String id, String productId, String productName, long quantity, 
                             long unitPrice, long subtotal, String note, List<String> toppingNames) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
        this.note = note;
        this.toppingNames = toppingNames;
    }

    // --- GETTERS & SETTERS ---
    public String getId() { 
        return id; 
        }

    public String getProductId() { 
        return productId; 
        }

    public String getProductName() { 
        return productName; 
        }

    public long getQuantity() { 
        return quantity; 
        }

    public long getUnitPrice() { 
        return unitPrice; 
        }

    public long getSubtotal() { 
        return subtotal; 
        }

    public String getNote() { 
        return note; 
        }

    public List<String> getToppingNames() { 
        return toppingNames; 
        }
}